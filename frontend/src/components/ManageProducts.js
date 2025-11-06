// src/components/ManageProducts.js (ACTUALIZADO)
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import './ProductManagement.css';
import EditProductModal from './EditProductModal'; // <-- 1. Importar el modal
import './Modal.css'; // <-- 2. Importar CSS del modal

// Helper function para decodificar JWT
const decodeToken = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sellerId, setSellerId] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null); // <-- 3. Estado para el producto en edición
  const PORT = 4000; 

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = decodeToken(token);
      if (decoded && decoded.id) {
        setSellerId(decoded.id);
      } else {
        toast.error('Token inválido. No se puede obtener el ID del vendedor.');
        setLoading(false);
      }
    } else {
      toast.error('No hay sesión activa.');
      setLoading(false);
    }
  }, []);

  const fetchSellerProducts = async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:${PORT}/api/products/seller/${id}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setProducts(data.data);
        toast.success(`${data.data.length} productos cargados`);
      } else {
        toast.error(data.message || 'Error al cargar tus productos.');
        setProducts([]);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Error de conexión al servidor.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sellerId) {
      fetchSellerProducts(sellerId);
    }
  }, [sellerId]);

  const handleDelete = async (productId) => {
    if (!window.confirm("¿Estás seguro de que quieres desactivar (eliminar) este producto?")) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:${PORT}/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success('Producto desactivado exitosamente.');
        fetchSellerProducts(sellerId); 
      } else {
        toast.error(data.message || 'No se pudo eliminar el producto.');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Error de conexión al eliminar.');
    }
  };

  // 4. Actualizar handleEdit para abrir el modal
  const handleEdit = (product) => {
    setEditingProduct(product);
  };

  // 5. Handler para cerrar el modal
  const handleCloseModal = () => {
    setEditingProduct(null);
  };

  // 6. Handler para actualizar la lista después de editar
  const handleProductUpdated = (updatedProduct) => {
    setProducts(prevProducts =>
      prevProducts.map(p => (p._id === updatedProduct._id ? updatedProduct : p))
    );
    handleCloseModal(); // Cierra el modal
  };
  
  if (loading) return <p className="loading-message">Cargando tus productos...</p>;
  if (!sellerId) return <p className="error-message">Error: No se pudo verificar la identidad del vendedor.</p>;

  return (
    <div className="manage-products-container">
      <h2>Administrar Productos ({products.length})</h2>
      <button 
        onClick={() => fetchSellerProducts(sellerId)} 
        className="btn btn-primary btn-small" 
        style={{ marginBottom: '20px' }}
      >
        🔄 Refrescar Lista
      </button>
      
      <div className="product-management-list">
        {products.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            Aún no has publicado productos activos.
          </p>
        ) : (
          products.map(product => (
            <div key={product._id} className="product-management-card">
              <img 
                src={product.image || 'https://via.placeholder.com/80x60?text=Sin+Imagen'} 
                alt={product.name} 
                className="product-image-thumb"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/80x60?text=Error';
                }}
              />
              <div className="product-details">
                <h4>{product.name}</h4>
                <p>Categoría: {product.category}</p>
                <p>Precio: ${parseFloat(product.price).toFixed(2)}</p>
                <p>Stock: {product.stock}</p>
              </div>
              <div className="product-actions">
                <button 
                  onClick={() => handleEdit(product)} // <-- Llamada actualizada
                  className="btn btn-warning btn-small"
                >
                  ✏️ Editar
                </button>
                <button 
                  onClick={() => handleDelete(product._id)} 
                  className="btn btn-danger btn-small"
                >
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 7. Renderizar el modal condicionalmente */}
      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={handleCloseModal}
          onProductUpdated={handleProductUpdated}
        />
      )}
    </div>
  );
};

export default ManageProducts;