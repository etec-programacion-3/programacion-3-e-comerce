// src/components/Messaging.js (ARREGLADO)
import React, { useState, useEffect, useCallback } from 'react'; // AGREGADO useCallback
import ConversationList from './ConversationList';
import ChatWindow from './ChatWindow';
import Spinner from './Spinner';
import './Messaging.css';

const Messaging = () => {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [loading, setLoading] = useState(true);
  const PORT = 4000;

  // Función para refrescar conversaciones
  const fetchConversations = useCallback(async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:${PORT}/api/conversations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setConversations(data.data);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  }, []);

  useEffect(() => {
    const autoOpenId = sessionStorage.getItem('openConversationId');
    if (autoOpenId) {
      setActiveConversationId(parseInt(autoOpenId));
      sessionStorage.removeItem('openConversationId');
    }

    // Carga inicial
    const initialFetch = async () => {
      setLoading(true);
      await fetchConversations();
      setLoading(false);
    };
    
    initialFetch();

    // Polling para actualizar la lista cada 10 segundos
    const intervalId = setInterval(fetchConversations, 10000);

    return () => clearInterval(intervalId);
  }, [fetchConversations]);

  return (
    <div className="messaging-container">
      <div className="conversation-list-col">
        <div className="conversation-list-header">Mensajes</div>
        {loading ? (
          <Spinner size="medium" message="Cargando conversaciones..." /> 
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