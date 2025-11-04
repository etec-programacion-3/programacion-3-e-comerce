// Frontend/src/components/UserProfileConfig.js (CON SUBIDA DE FOTO)
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext'; 
import ImageUploader from './ImageUploader';
import './Forms.css'; 
import './UserProfileConfig.css'; 

const decodeToken = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

const UserProfileConfig = () => {
  const { isLoggedIn } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: '',
    avatar: '', // ✅ Cambiado de profileImageUrl a avatar para consistencia con backend
    newPassword: '',
    confirmNewPassword: ''
  });
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const PORT = 4000;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Sesión no válida. Por favor, inicia sesión.');
      setLoading(false);
      return;
    }

    const userPayload = decodeToken(token);
    if (!userPayload || !userPayload.id) {
      toast.error('Token inválido. No se puede obtener el ID de usuario.');
      setLoading(false);
      return;
    }
    
    setUserId(userPayload.id);

    const fetchUserData = async (id, token) => {
      try {
        const res = await fetch(`http://localhost:${PORT}/api/users/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();

        if (res.ok && data.success) {
          setFormData({
            username: data.data.username || '',
            email: data.data.email || '',
            role: data.data.role || 'comprador',
            avatar: data.data.avatar || '', // ✅ Cargar avatar existente
            newPassword: '',
            confirmNewPassword: ''
          });
        } else {
          toast.error(data.message || 'Error al cargar los datos del perfil.');
        }
      } catch (error) {
        console.error('Fetch user data error:', error);
        toast.error('Error de conexión con la API.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData(userPayload.id, token);
  }, [isLoggedIn]);

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ NUEVO: Callback cuando se sube una imagen
  const handleAvatarUploaded = (imageUrl) => {
    setFormData({ ...formData, avatar: imageUrl });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (formData.newPassword !== formData.confirmNewPassword) {
      toast.error('Las nuevas contraseñas no coinciden.');
      return;
    }

    const updateData = {
      username: formData.username,
      email: formData.email,
      avatar: formData.avatar, // ✅ Enviar avatar actualizado
      role: formData.role,
      ...(formData.newPassword && { password: formData.newPassword })
    };

    try {
      const res = await fetch(`http://localhost:${PORT}/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success('Perfil actualizado exitosamente.');
        setFormData(prev => ({
          ...prev,
          newPassword: '',
          confirmNewPassword: ''
        }));
      } else {
        const errorMessage = data.errors 
          ? data.errors.map(err => err.msg).join(', ') 
          : data.message || 'Error desconocido al actualizar.';
        toast.error(`Error al actualizar: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error('Error de conexión con la API.');
    }
  };

  if (loading) return <div className="profile-config-container"><p>Cargando perfil...</p></div>;
  if (!userId) return <div className="profile-config-container"><p>Acceso denegado o usuario no encontrado.</p></div>;

  return (
    <div className="profile-config-container">
      <h2>Configuración de Perfil</h2>
      <form onSubmit={onSubmit} className="form-container user-config-form">
        
        <div className="form-section-title">Foto de Perfil</div>
        
        {/* ✅ NUEVO: Componente de subida de avatar */}
        <ImageUploader
          currentImage={formData.avatar}
          onImageUploaded={handleAvatarUploaded}
          type="users"
          label="Foto de Perfil"
        />
        
        <div className="form-section-title">Datos Básicos</div>
        
        <input 
          type="text" 
          name="username" 
          value={formData.username} 
          onChange={onChange} 
          placeholder="Nombre de usuario" 
          required 
        />
        <input 
          type="email" 
          name="email" 
          value={formData.email} 
          onChange={onChange} 
          placeholder="Email" 
          required 
        />
        <select name="role" value={formData.role} onChange={onChange} disabled={true}>
          <option value="comprador">Comprador</option>
          <option value="vendedor">Vendedor</option>
        </select>

        <div className="form-section-title">Cambiar Contraseña (Opcional)</div>
        <input 
          type="password" 
          name="newPassword" 
          value={formData.newPassword} 
          onChange={onChange} 
          placeholder="Nueva Contraseña" 
        />
        <input 
          type="password" 
          name="confirmNewPassword" 
          value={formData.confirmNewPassword} 
          onChange={onChange} 
          placeholder="Confirmar Nueva Contraseña" 
        />

        <button type="submit" className="btn btn-primary">
          Guardar Cambios
        </button>
      </form>
    </div>
  );
};

export default UserProfileConfig;