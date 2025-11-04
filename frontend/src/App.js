// src/App.js (LIMPIADO Y CORREGIDO)
import React, { useState } from 'react';
import './App.css'; // Aún necesitamos el CSS general
import Register from './components/Register';
import Login from './components/Login';
import ProductList from './components/ProductList';
import CreateProduct from './components/CreateProduct';
import ManageProducts from './components/ManageProducts';
import Sidebar from './components/Sidebar'; // Importación clave del menú
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext'; 
import UserProfileConfig from './components/UserProfileConfig'; // <-- Componente de configuración

function App() {
  const [view, setView] = useState('products'); 
  // Controlamos solo el estado de visibilidad del Sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
  
  const { isLoggedIn } = useAuth(); 

  const renderView = () => {
    switch (view) {
      case 'register':
        // setView ya no se pasa aquí, sino al Sidebar (que llama a setView)
        return <Register onSuccess={() => setView('login')} />; 
      case 'login':
        return <Login onSuccess={() => setView('products')} />; 
      case 'create-product':
        return <CreateProduct />;
      case 'manage-products':
        return <ManageProducts />;
      case 'configure-user': // Nueva vista
        return <UserProfileConfig />; // <-- CORRECCIÓN: Renderiza el componente real
      case 'products':
      default:
        return <ProductList />;
    }
  };

  return (
    <div className={`App ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      <Toaster position="top-right" reverseOrder={false} />
      
      {/* Nuevo componente Sidebar */}
      <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
          setView={setView} 
      />

      <header className="App-header">
        {/* Botón para alternar el Sidebar */}
        <button 
            className="menu-toggle-btn" 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
            {isSidebarOpen ? '✕' : '☰'}
        </button>
        <h1>🛒 Mercardo no Libre</h1>
        
        {/* Botón de Catálogo que sigue en el Header */}
        <div className="nav-buttons">
          <button onClick={() => setView('products')} className="btn">Catálogo</button>
        </div>
      </header>

      <main className="App-main">
        {renderView()}
      </main>
    </div>
  );
}

export default App;