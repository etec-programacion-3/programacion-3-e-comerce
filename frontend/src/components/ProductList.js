// src/components/ProductList.js (MODIFICADO)
import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext'; // <-- 1. IMPORTAR useAuth

// 2. AÑADIR 'setView' A LOS PROPS
const ProductList = ({ refreshTrigger, setView }) => { 
  const { user, isLoggedIn } = useAuth(); // <-- 3. OBTENER USUARIO
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    minPrice: '',
    maxPrice: ''
  });

  const categories = ['Electrónica', 'Ropa', 'Hogar', 'Deportes', 'Libros', 'Juguetes', 'Alimentos', 'Otros'];
  
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
      if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);
      
      const url = `http://localhost:4000/api/products?${queryParams.toString()}`;
      const res = await fetch(url);
      const data = await res.json();

      if (res.ok && data.success) {
        setProducts(Array.isArray(data.data) ? data.data : []); 
      } else {
        setProducts([]);
        throw new Error(data.message || 'Error al obtener productos');
      }
    } catch (err) {
      console.error('Fetch products error:', err);
      setError(err.message);
      setProducts([]); 
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProducts();
  }, [filters, fetchProducts, refreshTrigger]);

  const handleFilterChange = (e) => {
    setFilters({ 
      ...filters, 
      [e.target.name]: e.target.value 
    });
  };
  
  const handleSearchSubmit = (e) => { e.preventDefault(); };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      category: '',
      minPrice: '',
      maxPrice: ''
    });
  };

  // --- 4. AÑADIR FUNCIÓN PARA CONTACTAR VENDEDOR ---
  const handleContactSeller = async (sellerId, productId) => {
    if (!isLoggedIn) {
      toast.error('Debes iniciar sesión para contactar al vendedor.');
      setView('login');
      return;
    }

    if (user._id === sellerId) {
      toast.error('No puedes contactarte a ti mismo.');
      return;
    }

    const token = localStorage.getItem('token');
    const toastId = toast.loading('Iniciando conversación...');

    try {
      const res = await fetch('http://localhost:4000/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          participantId: sellerId,
          productId: productId
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success('Conversación iniciada. Redirigiendo...', { id: toastId });
        // Guardar el ID en sessionStorage para que Messaging.js lo abra
        sessionStorage.setItem('openConversationId', data.data._id);
        setView('messages');
      } else {
        throw new Error(data.message || 'Error al crear la conversación');
      }
    } catch (error) {
      toast.error(error.message, { id: toastId });
    }
  };
  // -------------------------------------------------

  const productStyle = {
    border: '1px solid #ccc',
    padding: '10px',
    margin: '10px',
    borderRadius: '5px',
    width: '300px',
    textAlign: 'left',
    backgroundColor: '#fff',
    color: '#333'
  };

  return (
    <div style={{ marginTop: '20px', width: '90%', margin: '20px auto' }}>
      <h2>Catálogo de Productos ({products.length})</h2>

      {/* Formulario de Filtro (sin cambios) */}
      <form 
        onSubmit={handleSearchSubmit} 
        style={{ 
          display: 'flex', 
          gap: '10px', 
          flexWrap: 'wrap', 
          marginBottom: '20px', 
          padding: '15px', 
          border: '1px solid #3498db', 
          borderRadius: '8px', 
          backgroundColor: '#f9f9f9' 
        }}
      >
        <input 
          type="text" name="search" value={filters.search} onChange={handleFilterChange} 
          placeholder="Buscar (nombre o descripción)" 
          style={{ padding: '8px', flex: '2', minWidth: '200px' }}
        />
        <select 
          name="category" value={filters.category} onChange={handleFilterChange} 
          style={{ padding: '8px', flex: '1' }}
        >
          <option value="">Todas las categorías</option>
          {categories.map(cat => ( <option key={cat} value={cat}>{cat}</option> ))}
        </select>
        <input 
          type="number" name="minPrice" value={filters.minPrice} onChange={handleFilterChange} 
          placeholder="Precio Mín." style={{ padding: '8px', width: '100px' }}
          min="0" step="0.01"
        />
        <input 
          type="number" name="maxPrice" value={filters.maxPrice} onChange={handleFilterChange} 
          placeholder="Precio Máx." style={{ padding: '8px', width: '100px' }}
          min="0" step="0.01"
        />
        <button 
          type="button" onClick={handleClearFilters} 
          style={{ 
            padding: '8px 15px', cursor: 'pointer', backgroundColor: '#e74c3c', 
            color: 'white', border: 'none', borderRadius: '5px' 
          }}
        >
          Limpiar Filtros
        </button>
      </form>
      
      {loading && <p style={{color: '#333', textAlign: 'center'}}>Cargando productos...</p>}
      {error && <p style={{ color: 'red', textAlign: 'center' }}>Error: {error}</p>}

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
        {products && products.map(product => (
          <div key={product._id} style={productStyle}>
            <img 
              src={product.image || 'https://via.placeholder.com/300x200?text=Sin+Imagen'} 
              alt={product.name} 
              style={{ 
                width: '100%', height: '200px', objectFit: 'cover', 
                borderRadius: '5px', marginBottom: '10px'
              }}
              onError={(e) => { e.target.src = 'https://via.placeholder.com/300x200?text=Error+al+cargar'; }}
            />
            <h3 style={{ margin: '10px 0' }}>{product.name}</h3>
            <p style={{ margin: '5px 0', fontSize: '0.9em', color: '#666' }}>
              {product.description.length > 100 
                ? `${product.description.substring(0, 100)}...` 
                : product.description
              }
            </p>
            <p style={{ margin: '5px 0' }}><strong>Precio:</strong> ${parseFloat(product.price).toFixed(2)}</p>
            <p style={{ margin: '5px 0' }}><strong>Categoría:</strong> {product.category}</p>
            <p style={{ margin: '5px 0' }}><strong>Vendedor:</strong> {product.seller?.username || 'N/A'}</p>
            
            {/* --- 5. AÑADIR BOTÓN DE CONTACTO --- */}
            {isLoggedIn && user._id !== product.seller._id && (
              <button 
                style={{ 
                  width: '100%', padding: '10px', backgroundColor: '#3498db', 
                  border: 'none', color: 'white', cursor: 'pointer', 
                  marginTop: '10px', borderRadius: '5px', fontWeight: 'bold'
                }}
                onClick={() => handleContactSeller(product.seller._id, product._id)}
              >
                Contactar Vendedor
              </button>
            )}
            {/* ---------------------------------- */}
          </div>
        ))}
        
        {products.length === 0 && !loading && !error && (
          <p style={{color: '#666', textAlign: 'center', width: '100%', padding: '40px'}}>
            No se encontraron productos con estos criterios.
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductList;