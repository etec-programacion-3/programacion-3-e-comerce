// src/components/Register.js (MODIFICADO)
import React, { useState } from 'react';
import { toast } from 'react-hot-toast'; // <--- NUEVO: Importa toast
import './Forms.css';
const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'comprador',
  });

  const { username, email, password, role } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:4000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json(); 

      if (res.ok && data.success) {
        console.log(data);
        toast.success('✅ ¡Usuario registrado exitosamente! Ahora puedes iniciar sesión.'); // <--- CAMBIO
      } else {
        const errorMessage = data.errors 
            ? data.errors.map(err => err.msg).join(', ') 
            : data.message || 'Error desconocido del servidor.';
        toast.error(`❌ Error al registrar: ${errorMessage}`); // <--- CAMBIO
      }

    } catch (error) {
      console.error(error);
      toast.error('Error al registrar. Revisa la consola.'); // <--- CAMBIO
    }
  };

  return (
    <form onSubmit={onSubmit} className="form-container">
      <h2>Registro</h2>
      <input type="text" name="username" value={username} onChange={onChange} placeholder="Nombre de usuario" required />
      <input type="email" name="email" value={email} onChange={onChange} placeholder="Email" required />
      <input type="password" name="password" value={password} onChange={onChange} placeholder="Contraseña" required />
      <select name="role" value={role} onChange={onChange}>
        <option value="comprador">Comprador</option>
        <option value="vendedor">Vendedor</option>
      </select>
      <button type="submit" className="btn btn-primary">Registrarse</button>
    </form>
  );
};

export default Register;