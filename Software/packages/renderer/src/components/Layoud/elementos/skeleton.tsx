import * as React from "react";

type CSSSize = number | string;

type AppShellProps = {
  /** Contenido del header (ej: botones, breadcrumb, search, etc.) */
  header?: React.ReactNode;
  /** Contenido del sidebar (ej: nav, filtros, etc.) */
  sidebar?: React.ReactNode;
  /** Contenido principal */
  children?: React.ReactNode;

  /** Alto del header (px, rem, etc.). Ej: 56, "3.5rem", "64px" */
  headerHeight?: CSSSize;
  /** Ancho del sidebar (px, rem, etc.). Ej: 256, "16rem", "280px" */
  sidebarWidth?: CSSSize;

  /** Opcional: clases extra en contenedores */
  className?: string;
  headerClassName?: string;
  sidebarClassName?: string;
  mainClassName?: string;

  /** Opcional: sticky header (true por defecto) */
  stickyHeader?: boolean;
};

/**
 * AppShell: Layout de pantalla completa con Header, Sidebar y Main.
 * - Ocupa 100% del viewport (h-screen).
 * - Header arriba, Sidebar a la izquierda, Main a la derecha.
 * - Scroll independiente para Sidebar y Main.
 * - Tamaños del header y sidebar parametrizables.
 */
export function AppShell({
  header,
  sidebar,
  children,
  headerHeight = 56,      // 56px ~ h-14
  sidebarWidth = 256,     // 256px ~ w-64
  className = "",
  headerClassName = "",
  sidebarClassName = "",
  mainClassName = "",
  stickyHeader = true,
}: AppShellProps) {
  // Normaliza tamaños a string CSS
  const toSize = (v: CSSSize) =>
    typeof v === "number" ? `${v}px` : v;

  const headerH = toSize(headerHeight);
  const asideW = toSize(sidebarWidth);

  return (
    <div className={`flex flex-col h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white ${className}`}>
      {/* Header */}
      <header
        aria-label="Site header"
        className={[
          "w-full",
          "flex items-center",
          stickyHeader ? "sticky top-0 z-40" : "",
          headerClassName,
        ].join(" ")}
        style={{ height: headerH, minHeight: headerH }}
      >
        {header}
      </header>

      {/* Contenedor principal */}
      <div className="flex flex-1 overflow-hidden" >
        {/* Sidebar */}
        <aside
          aria-label="Sidebar"
          className={[
            //"p-3",
            "overflow-y-auto",
            sidebarClassName,
          ].join(" ")}
          style={{ width: asideW, minWidth: asideW }}
        >
          {sidebar}
        </aside>

        {/* Main */}
        <main
          
          aria-label="Main content"
          className={[
            "flex-1",
            "overflow-y-auto",
            //"p-4",
            mainClassName,
          ].join(" ")}
          // Resta el header solo si no es sticky (cuando header ocupa flujo normal)
          // Si es sticky, el header no ocupa espacio dentro del flujo del main.
        >
          {children}
        </main>
      </div>
    </div>
  );
}
