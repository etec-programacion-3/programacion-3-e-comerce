import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const { isLoggedIn, logout, user } = useAuth();
   
    const avatar = user && user.avatar
        ? user.avatar
        : 'https://via.placeholder.com/60/61dafb/FFFFFF?text=P';
           
    const username = user ? user.username : 'Usuario';
    const isSeller = user && user.role === 'vendedor';

    const handleLogout = () => {
        logout();
        navigate('/');
        onClose();
    };

    const navigateAndClose = (path) => {
        navigate(path);
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
                                onClick={() => navigateAndClose('/configure-user')}
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
                                <>
                                    <button onClick={() => navigateAndClose('/create-product')} className="btn btn-primary">
                                        ➕ Crear Producto
                                    </button>
                                    <button onClick={() => navigateAndClose('/manage-products')} className="btn btn-secondary">
                                        📦 Gestionar Productos
                                    </button>
                                </>
                            ) : null}
                            <button onClick={() => navigateAndClose('/messages')} className="btn btn-secondary">
                                💬 Mensajes
                            </button>
                            <button onClick={handleLogout} className="btn btn-danger">
                                🚪 Cerrar Sesión
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => navigateAndClose('/login')} className="btn btn-primary">
                                🔑 Iniciar Sesión
                            </button>
                            <button onClick={() => navigateAndClose('/register')} className="btn btn-secondary">
                                📝 Registrarse
                            </button>
                        </>
                    )}
                </div>
            </div>
            {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
        </>
    );
};

export default Sidebar;
