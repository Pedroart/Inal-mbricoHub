#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Modbus TCP Simulator con UI en vivo (curses) y fallback a UI simple ANSI..
Teclas:
  a=agregar/actualizar, d=borrar, s=guardar, l=cargar, c=vaciar, p=pausa, q=salir
"""

# FORCE_SIMPLE_UI=1 python modbus_sim.py

import json
import os
import signal
import sys
import threading
import time
from dataclasses import dataclass, asdict
from typing import Dict, Optional, List

# --- Pymodbus imports (3.x preferido, cae a 2.x si es necesario)
try:
    from pymodbus.server import StartTcpServer        # 3.x
except Exception:  # pragma: no cover
    from pymodbus.server.sync import StartTcpServer   # 2.x

from pymodbus.datastore import (
    ModbusSlaveContext,
    ModbusServerContext,
    ModbusSequentialDataBlock,
)

CONFIG_FILE = "modbus_config.json"
HOST = "0.0.0.0"
PORT = 5020
MAX_REGS = 65536
LOCK = threading.Lock()


def clamp16(v: int) -> int:
    return max(0, min(65535, int(v)))


def rand_inclusive(min_v: int, max_v: int) -> int:
    import random
    if min_v > max_v:
        min_v, max_v = max_v, min_v
    return clamp16(random.randint(min_v, max_v))


@dataclass
class Tag:
    address: int
    min: int
    max: int
    period_ms: int

    def to_dict(self):
        return asdict(self)

    @staticmethod
    def from_dict(d: dict) -> "Tag":
        return Tag(
            address=int(d["address"]),
            min=clamp16(int(d["min"])),
            max=clamp16(int(d["max"])),
            period_ms=max(50, int(d["period_ms"])),
        )


class TagUpdater(threading.Thread):
    def __init__(self, ctx: ModbusServerContext, tag: Tag,
                 stop_event: threading.Event, pause_event: threading.Event):
        super().__init__(daemon=True)
        self.ctx = ctx
        self.tag = tag
        self.stop_event = stop_event
        self.pause_event = pause_event  # pausa global

    def run(self):
        while not self.stop_event.is_set():
            if self.pause_event.is_set():
                self.stop_event.wait(0.1)
                continue
            value = rand_inclusive(self.tag.min, self.tag.max)
            with LOCK:
                self.ctx[0].setValues(3, self.tag.address, [value])  # 3=Holding Registers
            self.stop_event.wait(self.tag.period_ms / 1000.0)


class ModbusSim:
    def __init__(self, host=HOST, port=PORT, config_file=CONFIG_FILE):
        self.store = ModbusSlaveContext(
            di=ModbusSequentialDataBlock(0, [0] * 1),
            co=ModbusSequentialDataBlock(0, [0] * 1),
            hr=ModbusSequentialDataBlock(0, [0] * MAX_REGS),
            ir=ModbusSequentialDataBlock(0, [0] * 1),
            zero_mode=True,
        )
        self.context = ModbusServerContext(slaves=self.store, single=True)
        self.host = host
        self.port = port
        self.config_file = config_file

        self.server_thread: Optional[threading.Thread] = None
        self.server_running = threading.Event()

        self.tags: Dict[int, Tag] = {}
        self.tag_threads: Dict[int, TagUpdater] = {}
        self.tag_stops: Dict[int, threading.Event] = {}

        self.pause_event = threading.Event()  # encendido = pausa

    # --- Servidor ---
    def start_server(self):
        if self.server_thread and self.server_thread.is_alive():
            return

        def _serve():
            self.server_running.set()
            try:
                StartTcpServer(self.context, address=(self.host, self.port))
            except Exception as e:
                print(f"[ERROR] Servidor Modbus: {e}")
            finally:
                self.server_running.clear()

        self.server_thread = threading.Thread(target=_serve, daemon=True)
        self.server_thread.start()
        time.sleep(0.25)

    # --- Pausa/Resume ---
    def pause_all(self): self.pause_event.set()
    def resume_all(self): self.pause_event.clear()
    def is_paused(self) -> bool: return self.pause_event.is_set()

    # --- CRUD Tags ---
    def add_or_update_tag(self, address: int, min_v: int, max_v: int, period_ms: int):
        address = int(address)
        if address < 0 or address >= MAX_REGS:
            raise ValueError("Dirección fuera de rango (0..65535)")
        tag = Tag(address=address, min=clamp16(min_v), max=clamp16(max_v), period_ms=max(50, int(period_ms)))

        if address in self.tag_stops:
            self.delete_tag(address, silent=True)

        init_value = rand_inclusive(tag.min, tag.max)
        with LOCK:
            self.context[0].setValues(3, address, [init_value])

        stop_ev = threading.Event()
        updater = TagUpdater(self.context, tag, stop_ev, self.pause_event)
        updater.start()

        self.tags[address] = tag
        self.tag_stops[address] = stop_ev
        self.tag_threads[address] = updater

    def delete_tag(self, address: int, silent: bool = False):
        address = int(address)
        if address not in self.tags:
            if not silent:
                raise ValueError("No existe esa dirección configurada")
            return
        if address in self.tag_stops:
            self.tag_stops[address].set()
        if address in self.tag_threads:
            self.tag_threads[address].join(timeout=0.8)
        self.tag_stops.pop(address, None)
        self.tag_threads.pop(address, None)
        self.tags.pop(address, None)

    def list_rows(self):
        rows = []
        with LOCK:
            for addr in sorted(self.tags.keys()):
                t = self.tags[addr]
                val = self.context[0].getValues(3, addr, count=1)[0]
                rows.append((addr, t.min, t.max, t.period_ms, int(val)))
        return rows

    # --- Persistencia ---
    def save_config(self):
        data = {"tags": [t.to_dict() for t in self.tags.values()]}
        with open(self.config_file, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

    def load_config(self):
        if not os.path.exists(self.config_file):
            raise FileNotFoundError("No hay configuración previa")
        for addr in list(self.tags.keys()):
            self.delete_tag(addr, silent=True)
        with open(self.config_file, "r", encoding="utf-8") as f:
            data = json.load(f)
        for item in data.get("tags", []):
            t = Tag.from_dict(item)
            self.add_or_update_tag(t.address, t.min, t.max, t.period_ms)

    def clear_all(self):
        for addr in list(self.tags.keys()):
            self.delete_tag(addr, silent=True)

    def shutdown(self):
        self.clear_all()


# =========================
#      UI SIMPLE (ANSI)
# =========================
def ansi_clear():
    print("\033[2J\033[H", end="", flush=True)

def run_simple_ui(sim: ModbusSim, refresh_sec: float = 0.5):
    print("(UI simple) Escribe comandos y Enter: a=agregar d=borrar s=guardar l=cargar c=vaciar p=pausa q=salir")
    time.sleep(0.6)
    prev: Dict[int, int] = {}
    try:
        while True:
            ansi_clear()
            state = "[PAUSA]" if sim.is_paused() else "[RUN]"
            print(f"Modbus {sim.host}:{sim.port}  {state}")
            print("Comandos: a=agregar d=borrar s=guardar l=cargar c=vaciar p=pausa q=salir")
            print("")
            header = " Dir    Min    Max   Period(ms)   Valor  Trend "
            print(header)
            print("-" * len(header))
            rows = sim.list_rows()
            for (addr, mn, mx, p, val) in rows:
                trend = "→"
                if addr in prev:
                    if val > prev[addr]: trend = "↑"
                    elif val < prev[addr]: trend = "↓"
                prev[addr] = val
                print(f" {addr:5d}  {mn:6d} {mx:6d}   {p:10d}   {val:5d}   {trend}")
            if not rows:
                print("(Sin datos). Comando 'a' para agregar.)")
            print("")
            try:
                cmd = input("Comando: ").strip().lower()
            except EOFError:
                cmd = "q"

            if cmd == "q":
                break
            elif cmd == "p":
                if sim.is_paused():
                    sim.resume_all()
                    print("Reanudado.")
                else:
                    sim.pause_all()
                    print("Pausado.")
                time.sleep(0.3)
            elif cmd == "a":
                try:
                    addr = int(input("Dirección HR (0..65535): ").strip())
                    mn = int(input("Mínimo: ").strip())
                    mx = int(input("Máximo: ").strip())
                    per = int(input("Periodo (ms, >=50): ").strip())
                    sim.add_or_update_tag(addr, mn, mx, per)
                except Exception as e:
                    print(f"[ERROR] {e}"); time.sleep(0.8)
            elif cmd == "d":
                try:
                    addr = int(input("Dirección a borrar: ").strip())
                    sim.delete_tag(addr)
                    prev.pop(addr, None)
                except Exception as e:
                    print(f"[ERROR] {e}"); time.sleep(0.8)
            elif cmd == "s":
                try:
                    sim.save_config(); print("[OK] Guardado.")
                except Exception as e:
                    print(f"[ERROR] {e}")
                time.sleep(0.6)
            elif cmd == "l":
                try:
                    sim.load_config(); prev.clear(); print("[OK] Cargado.")
                except Exception as e:
                    print(f"[ERROR] {e}")
                time.sleep(0.6)
            elif cmd == "c":
                sim.clear_all(); prev.clear(); print("[OK] Vacío.")
                time.sleep(0.6)
            else:
                print("Comando no reconocido."); time.sleep(0.6)
    finally:
        ansi_clear()


# =========================
#          TUI
# =========================
def run_curses_ui(sim: ModbusSim, refresh_hz: float = 5.0):
    # Import lazy para no romper si no hay curses (Windows sin windows-curses)
    try:
        import curses  # noqa
    except Exception as e:
        raise RuntimeError(f"curses no disponible: {e}")

    import curses

    class TUI:
        def __init__(self, sim: ModbusSim, refresh_hz: float = 5.0):
            self.sim = sim
            self.delay = 1.0 / max(1.0, refresh_hz)
            self.status = "Listo."
            self.prev_vals: Dict[int, int] = {}

        def run(self):
            curses.wrapper(self._main)

        def _draw_header(self, stdscr, w):
            runstate = "[PAUSA]" if self.sim.is_paused() else "[RUN]"
            title = f" Modbus TUI  —  {self.sim.host}:{self.sim.port}  {runstate} "
            helpbar = " a:Agregar/Act  d:Borrar  s:Guardar  l:Cargar  c:Vaciar  p:Pausa  q:Salir "
            try:
                stdscr.attron(curses.A_REVERSE)
                stdscr.addnstr(0, 0, title.ljust(w), w)
                stdscr.attroff(curses.A_REVERSE)
            except Exception:
                stdscr.addnstr(0, 0, title[:w], w)
            stdscr.addnstr(1, 0, helpbar[:w], w)

        def _draw_table(self, stdscr, h, w, rows):
            header = " Dir    Min    Max   Period(ms)   Valor  Trend "
            stdscr.addnstr(3, 0, header[:w], w)
            stdscr.addnstr(4, 0, "-" * min(w, len(header)), w)

            y = 5
            for (addr, mn, mx, p, val) in rows:
                prev = self.prev_vals.get(addr)
                trend = "→"
                if prev is not None:
                    if val > prev: trend = "↑"
                    elif val < prev: trend = "↓"
                self.prev_vals[addr] = val
                line = f" {addr:5d}  {mn:6d} {mx:6d}   {p:10d}   {val:5d}   {trend}"
                if y < h - 2:
                    stdscr.addnstr(y, 0, line[:w], w)
                y += 1

            if not rows and h > 7:
                stdscr.addnstr(6, 0, "(Sin datos). Presiona 'a' para agregar.", w)

        def _draw_status(self, stdscr, h, w):
            stdscr.addnstr(h - 1, 0, f" {self.status}".ljust(w), w)

        def _prompt(self, stdscr, prompt_text, default: Optional[str] = None) -> Optional[str]:
            curses.echo()
            h, w = stdscr.getmaxyx()
            stdscr.addnstr(h - 1, 0, " " * (w - 1), w)
            txt = prompt_text + (f" [{default}]: " if default is not None else ": ")
            stdscr.addnstr(h - 1, 0, txt[:w - 1], w - 1)
            stdscr.refresh()
            try:
                s = stdscr.getstr(h - 1, min(len(txt), w - 2)).decode("utf-8").strip()
            except Exception:
                s = ""
            curses.noecho()
            if s == "" and default is not None:
                return default
            return s if s != "" else None

        def _prompt_int(self, stdscr, label, default: Optional[int] = None, minv=None, maxv=None) -> Optional[int]:
            d = str(default) if default is not None else None
            s = self._prompt(stdscr, label, d)
            if s is None: return None
            try:
                v = int(s)
                if minv is not None and v < minv: raise ValueError
                if maxv is not None and v > maxv: raise ValueError
                return v
            except Exception:
                self.status = f"Valor inválido para {label}"
                return None

        def _action_add_update(self, stdscr):
            addr = self._prompt_int(stdscr, "Dirección HR (0..65535)", minv=0, maxv=65535)
            if addr is None: return
            t = self.sim.tags.get(addr)
            min_d = t.min if t else 0
            max_d = t.max if t else 1000
            per_d = t.period_ms if t else 1000
            mn = self._prompt_int(stdscr, "Mínimo", default=min_d, minv=0, maxv=65535)
            if mn is None: return
            mx = self._prompt_int(stdscr, "Máximo", default=max_d, minv=0, maxv=65535)
            if mx is None: return
            per = self._prompt_int(stdscr, "Periodo (ms, >=50)", default=per_d, minv=50, maxv=60000)
            if per is None: return
            try:
                self.sim.add_or_update_tag(addr, mn, mx, per)
                self.status = f"[OK] HR{addr} min={mn} max={mx} period={per}ms"
            except Exception as e:
                self.status = f"[ERROR] {e}"

        def _action_delete(self, stdscr):
            addr = self._prompt_int(stdscr, "Dirección a borrar", minv=0, maxv=65535)
            if addr is None: return
            try:
                self.sim.delete_tag(addr)
                self.prev_vals.pop(addr, None)
                self.status = f"[OK] Borrado HR{addr}"
            except Exception as e:
                self.status = f"[ERROR] {e}"

        def _action_save(self):
            try:
                self.sim.save_config()
                self.status = f"[OK] Config guardada en {CONFIG_FILE}"
            except Exception as e:
                self.status = f"[ERROR] {e}"

        def _action_load(self):
            try:
                self.sim.load_config()
                self.prev_vals.clear()
                self.status = "[OK] Config cargada"
            except Exception as e:
                self.status = f"[ERROR] {e}"

        def _action_clear(self, stdscr):
            ok = self._prompt(stdscr, "Escribe 'SI' para borrar TODOS")
            if ok and ok.upper() == "SI":
                self.sim.clear_all()
                self.prev_vals.clear()
                self.status = "[OK] Todos borrados"
            else:
                self.status = "Cancelado"

        def _main(self, stdscr):
            try:
                curses.curs_set(0)
            except Exception:
                pass
            stdscr.nodelay(True)
            stdscr.timeout(int(self.delay * 1000))
            self.status = "Servidor Modbus en marcha. 'a' para agregar, 'p' para pausar."
            while True:
                try:
                    h, w = stdscr.getmaxyx()
                    stdscr.erase()
                    rows = self.sim.list_rows()
                    self._draw_header(stdscr, w)
                    self._draw_table(stdscr, h, w, rows)
                    self._draw_status(stdscr, h, w)
                    stdscr.refresh()
                    ch = stdscr.getch()
                    if ch == -1:
                        continue
                    if ch in (ord('q'), ord('Q')): break
                    elif ch in (ord('a'), ord('A')): self._action_add_update(stdscr)
                    elif ch in (ord('d'), ord('D')): self._action_delete(stdscr)
                    elif ch in (ord('s'), ord('S')): self._action_save()
                    elif ch in (ord('l'), ord('L')): self._action_load()
                    elif ch in (ord('c'), ord('C')): self._action_clear(stdscr)
                    elif ch in (ord('p'), ord('P')):
                        if self.sim.is_paused():
                            self.sim.resume_all(); self.status = "Reanudado."
                        else:
                            self.sim.pause_all(); self.status = "Pausado."
                except KeyboardInterrupt:
                    break
                except Exception as e:
                    self.status = f"[ERROR UI] {e}"
                    time.sleep(0.3)

    TUI(sim, refresh_hz=5.0).run()


# =========================
#          MAIN
# =========================
def main():
    sim = ModbusSim()
    sim.start_server()

    if os.path.exists(CONFIG_FILE):
        try:
            sim.load_config()
        except Exception:
            pass

    def on_sigint(sig, frame):
        sim.shutdown()
        sys.exit(0)
    signal.signal(signal.SIGINT, on_sigint)

    force_simple = os.getenv("FORCE_SIMPLE_UI", "0") == "1"
    if force_simple:
        run_simple_ui(sim, refresh_sec=0.5)
    else:
        try:
            # intenta curses primero
            run_curses_ui(sim, refresh_hz=5.0)
        except Exception as e:
            # cae a UI simple
            print(f"[INFO] No se pudo iniciar curses ({e}). Cambiando a UI simple…")
            time.sleep(0.8)
            run_simple_ui(sim, refresh_sec=0.5)

    sim.shutdown()


if __name__ == "__main__":
    main()
