import { Database } from 'better-sqlite3';
import * as path from 'path';
import * as fs from 'fs';
import { RegistroService } from '../registroService';
import { RegistroRaw, Unidad } from '../registroModel';


describe('RegistroService', () => {
  const sampleRegistro: RegistroRaw = {
    sensor_id: 1,
    valor: 22.5,
    unidad: Unidad.Celsius,
    nivel_bateria: 85,
    timestamp: new Date().toISOString(),
  };

  it('debería agregar un nuevo registro correctamente', () => {
    const result = RegistroService.addRegistro(sampleRegistro);
    expect(result).toBe(true);
  });

  it('debería obtener registros por sensor_id', () => {
    RegistroService.addRegistro(sampleRegistro);
    const registros = RegistroService.getRegistrosBySensorId(1);
    expect(registros.length).toBeGreaterThan(0);
    expect(registros[0].sensor_id).toBe(1);
  });

  it('debería procesar el último registro y clasificar estado como Operativo', () => {
    RegistroService.addRegistro(sampleRegistro);
    const registro = RegistroService.getUltimoRegistroProcesado(1);
    expect(registro).not.toBeNull();
    expect(registro?.estado).toBe('Operativo');
  });

  it('debería detectar batería baja si el nivel es menor a 20%', () => {
    const registroBaja = { ...sampleRegistro, nivel_bateria: 10 };
    RegistroService.addRegistro(registroBaja);
    const procesado = RegistroService.getUltimoRegistroProcesado(1);
    expect(procesado?.estado).toBe('Batería Baja');
  });

  it('debería detectar desconexión si el timestamp es muy antiguo', () => {
    const oldTimestamp = new Date(Date.now() - 10 * 60 * 1000).toISOString(); // 10 minutos atrás
    const registroViejo = { ...sampleRegistro, timestamp: oldTimestamp };
    RegistroService.addRegistro(registroViejo);
    const procesado = RegistroService.getUltimoRegistroProcesado(1);
    expect(procesado?.estado).toBe('Desconectado');
  });
});
