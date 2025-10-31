// src/context/AuthContext.js

import React, { createContext, useState, useContext } from 'react';
import { toast } from 'react-hot-toast';

// 1. Crear el Contexto
const AuthContext = createContext(null);

// 2. Hook personalizado para usar el contexto fácilmente
export const useAuth = () => {
    return useContext(AuthContext);
};

// 3. Proveedor del Contexto
export const AuthProvider = ({ children }) => {
    // Inicializa el estado 'isLoggedIn' verificando si existe el token en localStorage
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
    // Opcionalmente, puedes añadir 'userRole' o 'userData' aquí

    // Función de LOGIN: Guarda el token y actualiza el estado
    const login = (token) => {
        localStorage.setItem('token', token);
        setIsLoggedIn(true);
        // NO HACEMOS setView AQUÍ. La vista se actualiza en App.js
    };

    // Función de LOGOUT: Elimina el token y actualiza el estado
    const logout = () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        toast.success('Sesión cerrada correctamente.'); 
        // NO HACEMOS setView AQUÍ. La vista se actualiza en App.js
    };

    // Objeto de valor que se compartirá con toda la aplicación
    const value = {
        isLoggedIn,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};