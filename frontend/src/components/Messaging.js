// src/components/Messaging.js
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import ConversationList from './ConversationList';
import ChatWindow from './ChatWindow';
import './Messaging.css'; // Importar el nuevo CSS

const Messaging = () => {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [loading, setLoading] = useState(true);
  const PORT = 4000;

  useEffect(() => {
    // 1. Revisar si sessionStorage tiene un ID para abrir
    const autoOpenId = sessionStorage.getItem('openConversationId');
    if (autoOpenId) {
      setActiveConversationId(parseInt(autoOpenId));
      sessionStorage.removeItem('openConversationId'); // Limpiar para que no se abra siempre
    }

    // 2. Cargar la lista de todas las conversaciones
    const fetchConversations = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`http://localhost:${PORT}/api/conversations`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setConversations(data.data);
        } else {
          throw new Error(data.message || 'Error al cargar conversaciones');
        }
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  return (
    <div className="messaging-container">
      <div className="conversation-list-col">
        <div className="conversation-list-header">Mensajes</div>
        {loading ? (
          <p style={{ padding: '20px' }}>Cargando...</p>
        ) : (
          <ConversationList
            conversations={conversations}
            onSelectConversation={setActiveConversationId}
            activeConversationId={activeConversationId}
          />
        )}
      </div>
      
      <ChatWindow conversationId={activeConversationId} />
    </div>
  );
};

export default Messaging;