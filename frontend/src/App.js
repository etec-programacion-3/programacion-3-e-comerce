// src/App.js (LÓGICA DE MENÚ CORREGIDA)
import React, { useState } from 'react';
import './App.css';
import Register from './components/Register';
import Login from './components/Login';
import ProductList from './components/ProductList';
import CreateProduct from './components/CreateProduct';
import ManageProducts from './components/ManageProducts';
import { Toaster, toast } from 'react-hot-toast';
import { useAuth } from './context/AuthContext'; 

function App() {
  const [view, setView] = useState('products'); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
  
  const { isLoggedIn, logout } = useAuth(); 
  
  // Asumo que tienes una forma de obtener el rol (Ej. Decodificando el token)
  // TEMPORAL: Función que asume que el usuario logueado es Vendedor si ve estos botones
  // En un sistema real, esta lógica vendría del AuthContext/Token
  const isSeller = () => {
    // Si necesitas diferenciar por rol, aquí decodificarías el token
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    // Asumo que si el token existe, eres vendedor si accedes a rutas de vendedor.
    // Esto es un placeholder; la lógica real debería ser:
    // const decoded = decodeToken(token);
    // return decoded && decoded.role === 'vendedor';
    
    // Por simplicidad, asumimos que si te logueas, puedes ver todas las opciones,
    // pero limitaremos las opciones del sidebar para demostrar la lógica.
    return true; 
  }
  // --- FIN LÓGICA TEMPORAL ---

  const handleLogout = () => {
    logout();
    setView('products'); 
  };
  
  const handleSuccessfulAuth = (targetView) => {
    setView(targetView);
    setIsSidebarOpen(false); // Cierra el menú al navegar
  };

  const navigateAndClose = (targetView) => {
    setView(targetView);
    setIsSidebarOpen(false);
  };
  
  const renderView = () => {
    switch (view) {
      case 'register':
        return <Register onSuccess={() => handleSuccessfulAuth('login')} />; 
      case 'login':
        return <Login onSuccess={() => handleSuccessfulAuth('products')} />; 
      case 'create-product':
        return <CreateProduct />;
      case 'manage-products':
        return <ManageProducts />;
      case 'products':
      default:
        return <ProductList />;
    }
  };

  return (
    <div className={`App ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      <Toaster position="top-right" reverseOrder={false} />

      <header className="App-header">
        <button 
            className="menu-toggle-btn" 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
            {isSidebarOpen ? '✕' : '☰'}
        </button>
        <h1>🛒 Mercardo no Libre</h1>
        
        {/* MANTENEMOS EL BOTÓN DE CATÁLOGO AQUÍ SIEMPRE VISIBLE */}
        <div className="nav-buttons">
          <button onClick={() => setView('products')} className="btn">Catálogo</button>
        </div>
      </header>

      {/* ----------------- SIDEBAR ----------------- */}
      <div className="sidebar">
        <div className="sidebar-content">
          <h3>Navegación</h3>
          
          {/* Bloque: USUARIO LOGUEADO (VENDEDOR O COMPRADOR) */}
          {isLoggedIn ? (
            <>
              {/* Opciones de Comprador / Vendedor (Necesitas lógica de rol aquí) */}
              {isSeller() ? (
                  // OPCIONES DE VENDEDOR
                  <>
                      <button onClick={() => navigateAndClose('create-product')} className="btn sidebar-btn btn-seller">Crear Producto</button>
                      <button onClick={() => navigateAndClose('manage-products')} className="btn sidebar-btn btn-seller">Administrar Productos</button> 
                      {/* Opciones Comunes */}
                      <button onClick={handleLogout} className="btn sidebar-btn btn-danger">Cerrar Sesión</button>
                  </>
              ) : (
                  // OPCIONES DE COMPRADOR
                  <>
                      <button onClick={() => navigateAndClose('products')} className="btn sidebar-btn">Ver Catálogo</button>
                      <button onClick={() => navigateAndClose('messages')} className="btn sidebar-btn">Mensajes (WIP)</button>
                      {/* Opciones Comunes */}
                      <button onClick={handleLogout} className="btn sidebar-btn btn-danger">Cerrar Sesión</button>
                  </>
              )}
            </>
          ) : (
            // Bloque: USUARIO NO LOGUEADO
            <>
              <button onClick={() => navigateAndClose('login')} className="btn sidebar-btn">Login</button>
              <button onClick={() => navigateAndClose('register')} className="btn sidebar-btn">Registro</button>
            </>
          )}
        </div>
      </div>
      {/* ----------------- /SIDEBAR ----------------- */}

      {/* OVERLAY para cerrar el sidebar al hacer clic fuera */}
      {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}

      <main className="App-main">
        {renderView()}
      </main>
    </div>
  );
}

export default App;