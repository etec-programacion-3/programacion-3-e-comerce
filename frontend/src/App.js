// src/App.js (MODIFICADO)
import React, { useState } from 'react';
import './App.css'; 
import Register from './components/Register';
import Login from './components/Login';
import ProductList from './components/ProductList';
import CreateProduct from './components/CreateProduct';
import ManageProducts from './components/ManageProducts';
import Sidebar from './components/Sidebar'; 
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext'; 
import UserProfileConfig from './components/UserProfileConfig';
import Messaging from './components/Messaging'; // <-- 1. IMPORTAR

function App() {
  const [view, setView] = useState('products'); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
  
  const { isLoggedIn } = useAuth(); 

  const renderView = () => {
    switch (view) {
      case 'register':
        return <Register onSuccess={() => setView('products')} />; // <-- CAMBIO: Ir a productos
      case 'login':
        return <Login onSuccess={() => setView('products')} />; 
      case 'create-product':
        return <CreateProduct />;
      case 'manage-products':
        return <ManageProducts />;
      case 'configure-user': 
        return <UserProfileConfig />;
      
      // --- 2. AÑADIR NUEVO CASO ---
      case 'messages':
        return <Messaging />;
      // -------------------------

      case 'products':
      default:
        // --- 3. PASAR setView a ProductList ---
        return <ProductList setView={setView} />;
    }
  };

  return (
    <div className={`App ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      <Toaster position="top-right" reverseOrder={false} />
      
      <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
          setView={setView} 
      />

      <header className="App-header">
        <button 
            className="menu-toggle-btn" 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
            {isSidebarOpen ? '✕' : '☰'}
        </button>
        <h1>🛒 Mercardo no Libre</h1>
        
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