// src/components/Login.js (MODIFICADO)
import React, { useState } from 'react';
import { toast } from 'react-hot-toast'; // <--- NUEVO: Importa toast
import './Forms.css';
const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const { email, password } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json(); 

      if (res.ok && data.success && data.data.token) {
        localStorage.setItem('token', data.data.token); 
        console.log('Token guardado:', data.data.token);
        toast.success('¡Login exitoso!'); // <--- CAMBIO: alert() por toast.success()
      } else {
        const errorMessage = data.errors 
            ? data.errors.map(err => err.msg).join(', ') 
            : data.message || 'Error desconocido';
        toast.error('Error en login: ' + errorMessage); // <--- CAMBIO: alert() por toast.error()
      }
    } catch (error) {
      console.error(error);
      toast.error('Error al iniciar sesión. Revisa la consola.'); // <--- CAMBIO: alert() por toast.error()
    }
  };

  return (
    <form onSubmit={onSubmit} className="form-container">
      <h2>Login</h2>
      <input type="email" name="email" value={email} onChange={onChange} placeholder="Email" required />
      <input type="password" name="password" value={password} onChange={onChange} placeholder="Contraseña" required />
      <button type="submit" className="btn btn-primary">Iniciar Sesión</button>
    </form>
  );
};

export default Login;