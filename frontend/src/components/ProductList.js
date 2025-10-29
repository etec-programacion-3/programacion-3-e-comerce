// src/components/ProductList.js
import React, { useState, useEffect } from 'react';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Estados para gestionar los filtros de búsqueda
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    sort: '-createdAt' // Ordenamiento por defecto: más reciente
  });

  const categories = ['electronics', 'clothing', 'books', 'home', 'sports', 'toys', 'other'];

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      // Construir la cadena de consulta (query string) a partir de los filtros
      const queryParams = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          queryParams.append(key, filters[key]);
        }
      });
      
      const url = `http://localhost:4000/api/products?${queryParams.toString()}`;
      
      const res = await fetch(url);
      const data = await res.json();

      if (res.ok && data.success) {
        setProducts(data.data);
      } else {
        throw new Error(data.message || 'Error al obtener productos');
      }
    } catch (err) {
      console.error('Fetch products error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Vuelve a llamar a fetchProducts cada vez que los filtros cambian
  useEffect(() => {
    fetchProducts();
  }, [filters]); 

  const handleFilterChange = (e) => {
    setFilters({ 
      ...filters, 
      [e.target.name]: e.target.value 
    });
  };
  
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // La búsqueda se activa automáticamente al cambiar el estado de 'filters'
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
      <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px', padding: '10px', border: '1px solid #61dafb', borderRadius: '8px', backgroundColor: '#333' }}>
        
        <input 
          type="text" 
          name="search" 
          value={filters.search} 
          onChange={handleFilterChange} 
          placeholder="Buscar (nombre o descripción)" 
          style={{ padding: '8px', flex: '2', minWidth: '200px' }}
        />
        
        <select name="category" value={filters.category} onChange={handleFilterChange} style={{ padding: '8px', flex: '1' }}>
          <option value="">Todas las categorías</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
          ))}
        </select>
        
        <input 
          type="number" 
          name="minPrice" 
          value={filters.minPrice} 
          onChange={handleFilterChange} 
          placeholder="Precio Mín." 
          style={{ padding: '8px', width: '100px' }}
        />
        
        <input 
          type="number" 
          name="maxPrice" 
          value={filters.maxPrice} 
          onChange={handleFilterChange} 
          placeholder="Precio Máx." 
          style={{ padding: '8px', width: '100px' }}
        />
        
        <select name="sort" value={filters.sort} onChange={handleFilterChange} style={{ padding: '8px', flex: '1' }}>
          <option value="-createdAt">Más Reciente</option>
          <option value="price">Precio: Más bajo</option>
          <option value="-price">Precio: Más alto</option>
          <option value="name">Nombre (A-Z)</option>
        </select>
        
        <button type="button" onClick={() => setFilters({ search: '', category: '', minPrice: '', maxPrice: '', seller: '', sort: '-createdAt' })} style={{ padding: '8px', cursor: 'pointer', backgroundColor: '#e74c3c', color: 'white', border: 'none' }}>
          Limpiar Filtros
        </button>
        
      </form>
      
      {loading && <p style={{color: 'white'}}>Cargando productos...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
        {products.map(product => (
          <div key={product._id} style={productStyle}>
            {/* Si no hay imagen, muestra un placeholder con un color diferente para distinguirlo */}
            {product.images.length > 0 && 
              <img src={product.images[0].replace('https://via.placeholder.com/300', 'https://via.placeholder.com/280/0000FF/FFFFFF?text=PRODUCT+IMAGE')} alt={product.name} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '5px 5px 0 0' }} />
            }
            <h3>{product.name}</h3>
            <p style={{ margin: '5px 0' }}><strong>Precio:</strong> ${product.price.toFixed(2)}</p>
            <p style={{ margin: '5px 0' }}><strong>Categoría:</strong> {product.category}</p>
            <p style={{ margin: '5px 0' }}><strong>Stock:</strong> {product.stock}</p>
            {/* El backend popula la información del vendedor */}
            <p style={{ margin: '5px 0' }}><strong>Vendedor:</strong> {product.seller ? product.seller.username : 'N/A'}</p> 
            <button style={{ width: '100%', padding: '10px', backgroundColor: '#61dafb', border: 'none', color: '#333', cursor: 'pointer', marginTop: '10px' }}>Ver Detalles</button>
          </div>
        ))}
        {products.length === 0 && !loading && !error && <p style={{color: 'white'}}>No se encontraron productos con estos criterios.</p>}
      </div>
    </div>
  );
};

export default ProductList;