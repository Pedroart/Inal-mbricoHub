import { createRoot } from 'react-dom/client'
import './assets/main.css';

import App from './App.tsx'

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
