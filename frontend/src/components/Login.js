import React, { useState } from 'react';
import { toast } from 'react-hot-toast'; 
import { useAuth } from '../context/AuthContext'; // <--- IMPORTACIÓN AÑADIDA
import './Forms.css';
// Recibimos onSuccess como prop
const Login = ({ onSuccess }) => { 
  const { login } = useAuth();
  // const navigate = useNavigate(); <--- YA NO ES NECESARIO
  
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
        
        login(data.data.token); // <--- CAMBIO CLAVE: Usa la función del contexto para iniciar sesión
        console.log('Token guardado y Contexto actualizado.');
        toast.success('¡Login exitoso! Actualizando vista...'); 
        
        // Ejecuta el cambio de vista en App.js
        setTimeout(() => {
            if (onSuccess) {
                onSuccess(); 
            }
        }, 1500);
      } else {
        const errorMessage = data.errors 
            ? data.errors.map(err => err.msg).join(', ') 
            : data.message || 'Error desconocido';
        toast.error('Error en login: ' + errorMessage); 
      }
    } catch (error) {
      console.error(error);
      toast.error('Error al iniciar sesión. Revisa la consola.'); 
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