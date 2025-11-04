// Frontend/src/components/CreateProduct.js (CON SUBIDA DE IMÁGENES)
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import ImageUploader from './ImageUploader';
import './Forms.css';

const categories = ['Electrónica', 'Ropa', 'Hogar', 'Deportes', 'Libros', 'Juguetes', 'Alimentos', 'Otros']; 

const CreateProduct = ({ onProductCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: categories[0],
    image: '' // Se llenará desde ImageUploader
  });

  const { name, description, price, stock, category, image } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ NUEVO: Callback cuando se sube una imagen
  const handleImageUploaded = (imageUrl) => {
    setFormData({ ...formData, image: imageUrl });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (!token) {
      toast.error('Debes iniciar sesión como vendedor para crear productos.');
      return;
    }

    // Validación: La imagen es requerida
    if (!image) {
      toast.error('Debes subir una imagen del producto');
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
      const res = await fetch(`http://localhost:4000/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(`Producto "${data.data.name}" creado con éxito.`);
        
        // Limpiar formulario
        setFormData({
          name: '',
          description: '',
          price: '',
          stock: '',
          category: categories[0],
          image: ''
        });

        // Notificar al componente padre
        if (onProductCreated) {
          onProductCreated(data.data);
        }
      } else {
        const errorMessage = data.errors 
          ? data.errors.map(err => err.msg || err.message).join(', ') 
          : data.message || 'Error desconocido.';
        
        toast.error(`Error al crear producto: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Create product error:', error);
      toast.error('Error de conexión con la API.');
    }
  };

  return (
    <form onSubmit={onSubmit} className="form-container" style={{maxWidth: '600px'}}>
      <h2>Crear Nuevo Producto</h2>
      
      {/* ✅ NUEVO: Componente de subida de imágenes */}
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
        Publicar Producto
      </button>
    </form>
  );
};

export default CreateProduct;