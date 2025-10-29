// src/App.js (MODIFICADO)
import React, { useState } from 'react';
import './App.css';
import Register from './components/Register';
import Login from './components/Login';
import ProductList from './components/ProductList';
// import UserList from './components/UserList'; // <--- ELIMINADO
import CreateProduct from './components/CreateProduct';
import ManageProducts from './components/ManageProducts';
import { Toaster, toast } from 'react-hot-toast';

function App() {
  const [view, setView] = useState('products'); 

  const isUserLoggedIn = () => {
    return !!localStorage.getItem('token');
  };

  const logout = () => {
    localStorage.removeItem('token');
    toast.success('Sesión cerrada correctamente.'); 
    setView('products'); 
  };
  
  const renderView = () => {
    switch (view) {
      case 'register':
        return <Register />;
      case 'login':
        return <Login />;
      // case 'users': // <--- ELIMINADA LA VISTA
      //   return <UserList />;
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
    <div className="App">
      {/* ... Toaster configuration ... */}

      <header className="App-header">
        <h1>🛒 Marketplace Full-Stack</h1>
        <div className="nav-buttons">
          <button onClick={() => setView('products')} className="btn">Catálogo</button>
          
          {isUserLoggedIn() ? (
            <>
              <button onClick={() => setView('create-product')} className="btn btn-seller">Crear Producto</button>
              <button onClick={() => setView('manage-products')} className="btn btn-seller">Administrar Productos</button> 
              {/* <button onClick={() => setView('users')} className="btn">Ver Usuarios</button> */} {/* <--- ELIMINADO BOTÓN */}
              <button onClick={logout} className="btn btn-danger">Cerrar Sesión</button>
            </>
          ) : (
            <>
              <button onClick={() => setView('login')} className="btn">Login</button>
              <button onClick={() => setView('register')} className="btn">Registro</button>
            </>
          )}
        </div>
      </header>

      <main className="App-main">
        {renderView()}
      </main>
      
    </div>
  );
}

export default App;