src/
│
├── assets/              # Imágenes, fuentes, íconos
│   └── fondo.jpg        # (opcional si no usas base64)
│
├── components/          # Componentes reutilizables de UI
│   └── SensorOverlay/
│       ├── SensorOverlay.tsx
│       ├── SensorOverlay.module.css (o .scss)
│       └── index.ts     # Exportación limpia
│
├── data/                # Datos estáticos o mockeados (JSON, .ts)
│   └── sensoresEjemplo.ts
│
├── hooks/               # Custom hooks (si aplican)
│   └── useResizeObserver.ts
│
├── models/              # Tipos e interfaces
│   └── sensor.ts
│
├── pages/               # Vistas principales (si usas rutas)
│   └── Dashboard.tsx
│
├── services/            # Funciones que acceden al backend, API o BD
│   └── sensorService.ts
│
├── styles/              # CSS global o variables (si usas styled-components, tailwind, etc.)
│   └── globals.css
│
├── App.tsx              # Punto de entrada de la app
├── index.tsx            # ReactDOM.render()
└── main.ts              # Si usas Vite o setup específico
