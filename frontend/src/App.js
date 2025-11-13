import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
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
import Messaging from './components/Messaging';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isLoggedIn } = useAuth();

  return (
    <BrowserRouter>
      <div className={`App ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <Toaster position="top-right" reverseOrder={false} />
       
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <header className="App-header">
          <button
              className="menu-toggle-btn"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
              {isSidebarOpen ? '✕' : '☰'}
          </button>
          <h1>🛒 Mercado no Libre</h1>
         
          <div className="nav-buttons">
            <Link to="/" className="btn">Catálogo</Link>
          </div>
        </header>

        <main className="App-main">
          <Routes>
            <Route path="/" element={<ProductList />} />
            <Route path="/products/:id" element={<ProductList />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/create-product"
              element={isLoggedIn ? <CreateProduct /> : <Navigate to="/login" />}
            />
            <Route
              path="/manage-products"
              element={isLoggedIn ? <ManageProducts /> : <Navigate to="/login" />}
            />
            <Route
              path="/configure-user"
              element={isLoggedIn ? <UserProfileConfig /> : <Navigate to="/login" />}
            />
            <Route
              path="/messages"
              element={isLoggedIn ? <Messaging /> : <Navigate to="/login" />}
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;