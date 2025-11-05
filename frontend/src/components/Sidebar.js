// src/components/Sidebar.js (CORREGIDO)

import React from 'react';
import { useAuth } from '../context/AuthContext';
// import { toast } from 'react-hot-toast'; // (Eliminamos esto antes para el warning)
import './Sidebar.css'; 

const Sidebar = ({ isOpen, onClose, setView }) => {
    
    const { isLoggedIn, logout, user } = useAuth();
    
    const avatar = user && user.avatar 
        ? user.avatar 
        : 'https://via.placeholder.com/60/61dafb/FFFFFF?text=P';
            
    const username = user ? user.username : 'Usuario';
    const isSeller = user && user.role === 'vendedor'; 

    const handleLogout = () => {
        logout();
        setView('products'); 
        onClose(); 
    };

    const navigateAndClose = (targetView) => {
        setView(targetView);
        onClose(); 
    };

    return (
        <>
            <div className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-content">
                    
                    {isLoggedIn && user && ( 
                        <div className="sidebar-profile">
                            <div className="profile-info">
                                
                                <img 
                                    src={avatar} 
                                    alt="Perfil" 
                                    className="profile-photo"
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/60/61dafb/FFFFFF?text=P';
                                    }}
                                />
                                <span className="profile-name">{username}</span>
                            </div>
                            <button 
                                onClick={() => navigateAndClose('configure-user')} 
                                className="btn btn-config"
                            >
                                ⚙️ Configurar Cuenta
                            </button>
                        </div>
                    )}
                    
                    <h3>Navegación</h3>

                    {isLoggedIn ? (
                        <>
                            {isSeller ? (
                                // OPCIONES DE VENDEDOR
                                <>
                                    <button onClick={() => navigateAndClose('create-product')} className="btn sidebar-btn btn-seller">Crear Producto</button>
                                    <button onClick={() => navigateAndClose('manage-products')} className="btn sidebar-btn btn-seller">Administrar Productos</button> 
                                    
                                    {/* --- LÍNEA AÑADIDA --- */}
                                    <button onClick={() => navigateAndClose('messages')} className="btn sidebar-btn">Mensajes</button>
                                    
                                    <button onClick={handleLogout} className="btn sidebar-btn btn-danger">Cerrar Sesión</button>
                                </>
                            ) : (
                                // OPCIONES DE COMPRADOR
                                <>
                                    <button onClick={() => navigateAndClose('products')} className="btn sidebar-btn">Ver Catálogo</button>
                                    
                                    {/* --- LÍNEA MODIFICADA (se quitó WIP) --- */}
                                    <button onClick={() => navigateAndClose('messages')} className="btn sidebar-btn">Mensajes</button>
                                    
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
            {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
        </>
    );
};

export default Sidebar;