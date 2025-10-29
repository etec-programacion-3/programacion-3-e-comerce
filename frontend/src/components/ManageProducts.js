// src/components/ManageProducts.js
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import './ProductManagement.css';
// Helper function para decodificar JWT (necesario para obtener el ID del usuario)
const decodeToken = (token) => {
    try {
        // La decodificación básica de Base64 del payload del JWT
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
};

const ManageProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sellerId, setSellerId] = useState(null);
    const PORT = 5000;

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const decoded = decodeToken(token);
            // El backend usa 'id' para el campo del token (revisado en authController.js)
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
            // Usa la ruta pública GET /api/products/seller/:sellerId
            const res = await fetch(`http://localhost:${PORT}/api/products/seller/${id}`);
            const data = await res.json();

            if (res.ok && data.success) {
                setProducts(data.data);
            } else {
                toast.error(data.message || 'Error al cargar tus productos.');
                setProducts([]);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            toast.error('Error de conexión al servidor.');
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
        // Confirmación para el soft delete
        if (!window.confirm("¿Estás seguro de que quieres desactivar (eliminar) este producto?")) return;

        const token = localStorage.getItem('token');
        try {
            // Usa la ruta protegida DELETE /api/products/:id
            const res = await fetch(`http://localhost:${PORT}/api/products/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await res.json();

            if (res.ok && data.success) {
                toast.success('Producto desactivado exitosamente.');
                // Refrescar lista
                fetchSellerProducts(sellerId); 
            } else {
                toast.error(data.message || 'No se pudo eliminar el producto.');
            }

        } catch (error) {
            toast.error('Error de conexión al eliminar.');
        }
    };
    
    if (loading) return <p className="loading-message">Cargando tus productos...</p>;
    if (!sellerId) return <p className="error-message">Error: No se pudo verificar la identidad del vendedor.</p>;

    return (
        <div className="manage-products-container">
            <h2>Administrar Productos ({products.length})</h2>
            <button onClick={() => fetchSellerProducts(sellerId)} className="btn btn-primary btn-small" style={{ marginBottom: '20px' }}>
                Refrescar Lista
            </button>
            
            <div className="product-management-list">
                {products.length === 0 ? (
                    <p>Aún no has publicado productos activos.</p>
                ) : (
                    products.map(product => (
                        <div key={product._id} className="product-management-card">
                            <img 
                                src={product.image || 'https://via.placeholder.com/400x300?text=Producto'} 
                                alt={product.name} 
                                className="product-image-thumb"
                            />
                            <div className="product-details">
                                <h4>{product.name}</h4>
                                <p>Categoría: {product.category}</p>
                                <p>Precio: ${parseFloat(product.price).toFixed(2)}</p>
                                <p>Stock: {product.stock}</p>
                            </div>
                            <div className="product-actions">
                                <button className="btn btn-warning btn-small">Editar</button>
                                <button onClick={() => handleDelete(product._id)} className="btn btn-danger btn-small">Eliminar (Soft)</button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ManageProducts;