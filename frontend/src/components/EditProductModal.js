// src/components/EditProductModal.js
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import ImageUploader from './ImageUploader';
import './Forms.css'; // Reutilizamos los estilos del formulario
import './Modal.css'; // Importamos los estilos del modal

// Copiamos las categorías de CreateProduct.js
const categories = ['Electrónica', 'Ropa', 'Hogar', 'Deportes', 'Libros', 'Juguetes', 'Alimentos', 'Otros'];
const PORT = 4000;

const EditProductModal = ({ product, onClose, onProductUpdated }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: categories[0],
    image: ''
  });

  // Efecto para llenar el formulario cuando el producto (prop) cambia
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        stock: product.stock || '',
        category: product.category || categories[0],
        image: product.image || ''
      });
    }
  }, [product]);

  const { name, description, price, stock, category, image } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUploaded = (imageUrl) => {
    setFormData({ ...formData, image: imageUrl });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (!image) {
      toast.error('Debes tener una imagen del producto');
      return;
    }

    const productData = {
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock),
      category,
      image
    };

    try {
      const res = await fetch(`http://localhost:${PORT}/api/products/${product._id}`, {
        method: 'PUT', // Usamos PUT para actualizar
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(`Producto "${data.data.name}" actualizado.`);
        
        // Notificar al componente padre (ManageProducts) que se actualizó
        if (onProductUpdated) {
          onProductUpdated(data.data);
        }
        onClose(); // Cerrar el modal
      } else {
        const errorMessage = data.errors 
          ? data.errors.map(err => err.msg || err.message).join(', ') 
          : data.message || 'Error desconocido.';
        
        toast.error(`Error al actualizar: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Update product error:', error);
      toast.error('Error de conexión con la API.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>✕</button>
        
        {/* Usamos el form-container de Forms.css pero dentro del modal */}
        <form onSubmit={onSubmit} className="form-container" style={{ margin: 0, maxWidth: '100%', boxShadow: 'none', border: 'none' }}>
          <h2>Editar Producto</h2>
          
          <ImageUploader
            currentImage={image}
            onImageUploaded={handleImageUploaded}
            type="products"
            label="Imagen del Producto *"
          />

          <input 
            type="text" 
            name="name" 
            value={name} 
            onChange={onChange} 
            placeholder="Nombre del Producto (3-100 caracteres)" 
            required 
            minLength={3}
            maxLength={100}
          />
          
          <textarea 
            name="description" 
            value={description} 
            onChange={onChange} 
            placeholder="Descripción del Producto (10-2000 caracteres)" 
            rows="4"
            required 
            minLength={10}
            maxLength={2000}
          />
          
          <div style={{ display: 'flex', gap: '15px' }}>
            <input 
              type="number" 
              name="price" 
              value={price} 
              onChange={onChange} 
              placeholder="Precio" 
              min="0.01"
              step="0.01"
              required 
              style={{ flex: 1 }}
            />
            <input 
              type="number" 
              name="stock" 
              value={stock} 
              onChange={onChange} 
              placeholder="Stock" 
              min="0"
              required 
              style={{ flex: 1 }}
            />
          </div>

          <select name="category" value={category} onChange={onChange}>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <button type="submit" className="btn btn-primary">
            Guardar Cambios
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;