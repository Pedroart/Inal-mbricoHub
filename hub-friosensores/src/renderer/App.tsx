import React from 'react';

export default function App() {
  const handleClick = async () => {
    const result = await window.api.ping();
    alert(result);
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Hub de Sensores Inalámbricos</h1>
      <button onClick={handleClick}>Probar conexión con el backend</button>
    </div>
  );
}
