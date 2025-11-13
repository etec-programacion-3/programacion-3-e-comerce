// Frontend/src/components/ImageUploader.js
import React, { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import './ImageUploader.css';

const ImageUploader = ({ 
  currentImage, 
  onImageUploaded, 
  type = 'products', // 'products' o 'users'
  label = 'Subir Imagen'
}) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage || null);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    
    if (!file) return;

    // Validación de tipo de archivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Tipo de archivo no válido. Solo se permiten imágenes (JPEG, PNG, GIF, WEBP)');
      return;
    }

    // Validación de tamaño (5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('La imagen es demasiado grande. Máximo 5MB');
      return;
    }

    // Mostrar vista previa
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Subir imagen
    await uploadImage(file);
  };

  const uploadImage = async (file) => {
    setUploading(true);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Debes iniciar sesión para subir imágenes');
        return;
      }

      // Crear FormData
      const formData = new FormData();
      formData.append('image', file);

      // Subir al servidor
      const response = await fetch(`http://localhost:4000/api/upload/image?type=${type}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Imagen subida exitosamente');
        
        // Notificar al componente padre con la URL de la imagen
        if (onImageUploaded) {
          onImageUploaded(data.data.fullUrl);
        }
        
        setPreview(data.data.fullUrl);
      } else {
        toast.error(data.message || 'Error al subir la imagen');
        setPreview(currentImage);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Error de conexión al subir la imagen');
      setPreview(currentImage);
    } finally {
      setUploading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    setPreview(null);
    if (onImageUploaded) {
      onImageUploaded(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="image-uploader">
      <label className="image-uploader-label">{label}</label>
      
      <div className="image-uploader-container">
        {/* Vista previa */}
        <div className="image-preview-wrapper">
          {preview ? (
            <div className="image-preview-container">
              <img 
                src={preview} 
                alt="Preview" 
                className="image-preview"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="remove-image-btn"
                disabled={uploading}
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="image-placeholder">
              <svg 
                width="64" 
                height="64" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              <p>Sin imagen</p>
            </div>
          )}
        </div>

        {/* Input de archivo (oculto) */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          disabled={uploading}
        />

        {/* Botón de subida */}
        <button
          type="button"
          onClick={handleButtonClick}
          className="upload-button"
          disabled={uploading}
        >
          {uploading ? (
            <>
              <span className="spinner-small"></span>
              Subiendo...
            </>
          ) : (
            <>
              📁 Elegir Imagen
            </>
          )}
        </button>

        {/* Información */}
        <p className="upload-info">
          Formatos permitidos: JPEG, PNG, GIF, WEBP (Máx. 5MB)
        </p>
      </div>
    </div>
  );
};

export default ImageUploader;
