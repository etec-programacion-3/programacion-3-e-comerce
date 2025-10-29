// src/components/CreateProduct.js (MODIFICADO)
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

// Categorías actualizadas según productValidation.js
const categories = ['Electrónica', 'Ropa', 'Hogar', 'Deportes', 'Libros', 'Juguetes', 'Alimentos', 'Otros']; 

const CreateProduct = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: categories[0],
    image: 'https://via.placeholder.com/400x300?text=Producto' // Campo de imagen único
  });

  const { name, description, price, stock, category, image } = formData;
  const PORT = 5000; // Puerto del backend

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (!token) {
      toast.error('Debes iniciar sesión como vendedor para crear productos.');
      return;
    }

    // Convertir precio y stock a tipos numéricos para el backend
    const productData = {
        ...formData,
        price: parseFloat(price),
        stock: parseInt(stock)
    };

    try {
      const res = await fetch(`http://localhost:${PORT}/api/products`, {
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
          image: 'https://via.placeholder.com/400x300?text=Producto'
        });
      } else {
        // Manejo de errores detallado (incluyendo validación de express-validator)
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
      
      <input 
        type="text" 
        name="name" 
        value={name} 
        onChange={onChange} 
        placeholder="Nombre del Producto (3-100 caracteres)" 
        required 
      />
      
      <textarea 
        name="description" 
        value={description} 
        onChange={onChange} 
        placeholder="Descripción del Producto (10-2000 caracteres)" 
        rows="4"
        required 
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

      <input 
        type="url" 
        name="image" 
        value={image} 
        onChange={onChange} 
        placeholder="URL de la Imagen (Opcional)" 
      />
      
      <p style={{fontSize: '0.8em', color: '#666', textAlign: 'center'}}>*El sistema utiliza el puerto 5000 para el backend.</p>

      <button type="submit" className="btn btn-primary">
        Publicar Producto
      </button>
    </form>
  );
};

export default CreateProduct;