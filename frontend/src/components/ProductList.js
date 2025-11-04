// src/components/ProductList.js (COMPLETAMENTE CORREGIDO)
import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';

const ProductList = ({ refreshTrigger }) => { // ← AGREGADO: refreshTrigger para actualizar
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    minPrice: '',
    maxPrice: ''
  });

  // ✅ CORREGIDO: Categorías según el backend
  const categories = ['Electrónica', 'Ropa', 'Hogar', 'Deportes', 'Libros', 'Juguetes', 'Alimentos', 'Otros'];
  
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      
      // Agregar filtros solo si tienen valor
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
      if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);
      
      const url = `http://localhost:4000/api/products?${queryParams.toString()}`; // ← Puerto 4000
      console.log('Fetching products from:', url);
      
      const res = await fetch(url);
      const data = await res.json();

      if (res.ok && data.success) {
        setProducts(Array.isArray(data.data) ? data.data : []); 
        console.log('Products loaded:', data.data.length);
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

  // ✅ NUEVO: Se ejecuta cuando refreshTrigger cambia (desde App.js)
  useEffect(() => {
    fetchProducts();
  }, [filters, fetchProducts, refreshTrigger]);

  const handleFilterChange = (e) => {
    setFilters({ 
      ...filters, 
      [e.target.name]: e.target.value 
    });
  };
  
  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      category: '',
      minPrice: '',
      maxPrice: ''
    });
  };

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

      {/* Formulario de Filtro y Búsqueda */}
      <form 
        onSubmit={handleSearchSubmit} 
        style={{ 
          display: 'flex', 
          gap: '10px', 
          flexWrap: 'wrap', 
          marginBottom: '20px', 
          padding: '15px', 
          border: '1px solid #61dafb', 
          borderRadius: '8px', 
          backgroundColor: '#f9f9f9' 
        }}
      >
        <input 
          type="text" 
          name="search" 
          value={filters.search} 
          onChange={handleFilterChange} 
          placeholder="Buscar (nombre o descripción)" 
          style={{ padding: '8px', flex: '2', minWidth: '200px' }}
        />
        
        <select 
          name="category" 
          value={filters.category} 
          onChange={handleFilterChange} 
          style={{ padding: '8px', flex: '1' }}
        >
          <option value="">Todas las categorías</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        
        <input 
          type="number" 
          name="minPrice" 
          value={filters.minPrice} 
          onChange={handleFilterChange} 
          placeholder="Precio Mín." 
          style={{ padding: '8px', width: '100px' }}
          min="0"
          step="0.01"
        />
        
        <input 
          type="number" 
          name="maxPrice" 
          value={filters.maxPrice} 
          onChange={handleFilterChange} 
          placeholder="Precio Máx." 
          style={{ padding: '8px', width: '100px' }}
          min="0"
          step="0.01"
        />
        
        <button 
          type="button" 
          onClick={handleClearFilters} 
          style={{ 
            padding: '8px 15px', 
            cursor: 'pointer', 
            backgroundColor: '#e74c3c', 
            color: 'white', 
            border: 'none',
            borderRadius: '5px' 
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
            {/* ✅ CORREGIDO: El backend usa 'image' (singular), no 'images' */}
            <img 
              src={product.image || 'https://via.placeholder.com/300x200?text=Sin+Imagen'} 
              alt={product.name} 
              style={{ 
                width: '100%', 
                height: '200px', 
                objectFit: 'cover', 
                borderRadius: '5px',
                marginBottom: '10px'
              }}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/300x200?text=Error+al+cargar';
              }}
            />
            <h3 style={{ margin: '10px 0' }}>{product.name}</h3>
            <p style={{ margin: '5px 0', fontSize: '0.9em', color: '#666' }}>
              {product.description.length > 100 
                ? `${product.description.substring(0, 100)}...` 
                : product.description
              }
            </p>
            <p style={{ margin: '5px 0' }}>
              <strong>Precio:</strong> ${parseFloat(product.price).toFixed(2)}
            </p>
            <p style={{ margin: '5px 0' }}>
              <strong>Categoría:</strong> {product.category}
            </p>
            <p style={{ margin: '5px 0' }}>
              <strong>Stock:</strong> {product.stock}
            </p>
            {/* ✅ CORREGIDO: El backend popula 'seller' con la información del vendedor */}
            <p style={{ margin: '5px 0' }}>
              <strong>Vendedor:</strong> {product.seller?.username || 'N/A'}
            </p>
            <button 
              style={{ 
                width: '100%', 
                padding: '10px', 
                backgroundColor: '#61dafb', 
                border: 'none', 
                color: '#333', 
                cursor: 'pointer', 
                marginTop: '10px',
                borderRadius: '5px',
                fontWeight: 'bold'
              }}
              onClick={() => toast.success(`Ver detalles de: ${product.name}`)}
            >
              Ver Detalles
            </button>
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