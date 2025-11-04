// src/components/Sidebar.js

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import './Sidebar.css'; // Importa el nuevo archivo CSS

// Función auxiliar para decodificar el token (si no se usa AuthContext para el rol)
const decodeToken = (token) => {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
};

// Componente que renderiza el perfil y las opciones de navegación
const Sidebar = ({ isOpen, onClose, setView }) => {
    const { isLoggedIn, logout } = useAuth();
    
    // --- LÓGICA DE PERFIL Y ROL ---
    const token = localStorage.getItem('token');
    const user = token ? decodeToken(token) : null;
    const username = user ? user.username : 'Usuario';
    const fullName = username;
    
    // Asumo que el rol 'vendedor' está en el token:
    const isSeller = user && user.role === 'vendedor'; 

    // --- FUNCIONES DE NAVEGACIÓN ---
    const handleLogout = () => {
        logout();
        setView('products'); // Retorna a la vista de productos
        onClose(); // Cierra el sidebar
    };

    const navigateAndClose = (targetView) => {
        setView(targetView);
        onClose(); // Cierra el sidebar
    };

    return (
        <>
            {/* El sidebar en sí */}
            <div className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-content">
                    
                    {/* ----------------- SECCIÓN DE PERFIL ----------------- */}
                    {isLoggedIn && (
                        <div className="sidebar-profile">
                            <div className="profile-info">
                                <img 
                                    src="https://via.placeholder.com/60/61dafb/FFFFFF?text=P"
                                    alt="Perfil" 
                                    className="profile-photo"
                                />
                                <span className="profile-name">{fullName}</span>
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

                    {/* Bloque de Opciones de Menú */}
                    {isLoggedIn ? (
                        <>
                            {isSeller ? (
                                // OPCIONES DE VENDEDOR
                                <>
                                    <button onClick={() => navigateAndClose('create-product')} className="btn sidebar-btn btn-seller">Crear Producto</button>
                                    <button onClick={() => navigateAndClose('manage-products')} className="btn sidebar-btn btn-seller">Administrar Productos</button> 
                                    <button onClick={handleLogout} className="btn sidebar-btn btn-danger">Cerrar Sesión</button>
                                </>
                            ) : (
                                // OPCIONES DE COMPRADOR
                                <>
                                    <button onClick={() => navigateAndClose('products')} className="btn sidebar-btn">Ver Catálogo</button>
                                    <button onClick={() => navigateAndClose('messages')} className="btn sidebar-btn">Mensajes (WIP)</button>
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
            {/* OVERLAY para cerrar el sidebar al hacer clic fuera */}
            {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
        </>
    );
};

export default Sidebar;