// src/components/ChatWindow.js (MODIFICADO)
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import './Messaging.css'; // Usa el CSS compartido

const ChatWindow = ({ conversationId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const PORT = 4000;
  
  // Usamos una referencia para evitar que el loading del polling sea intrusivo
  const initialLoadRef = useRef(true); 

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Función para obtener los mensajes
  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;
    
    // Solo mostrar "Cargando..." en la carga inicial
    if (initialLoadRef.current) {
      setLoading(true);
    }
    
    const token = localStorage.getItem('token');
    
    try {
      // 1. Obtener los detalles de la conversación (solo en la carga inicial)
      if (initialLoadRef.current) {
        const convRes = await fetch(`http://localhost:${PORT}/api/conversations/${conversationId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const convData = await convRes.json();
        if (convRes.ok) {
          setConversation(convData.data);
        } else {
          throw new Error(convData.message || 'Error al cargar conversación');
        }
      }

      // 2. Obtener los mensajes (esto se hace en cada polling)
      const msgRes = await fetch(`http://localhost:${PORT}/api/conversations/${conversationId}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const msgData = await msgRes.json();
      if (msgRes.ok) {
        // Comparamos si los mensajes son diferentes antes de actualizar
        // para evitar re-renders innecesarios
        setMessages(prevMessages => {
          if (JSON.stringify(prevMessages) !== JSON.stringify(msgData.data)) {
            return msgData.data;
          }
          return prevMessages;
        });
      } else {
        throw new Error(msgData.message || 'Error al cargar mensajes');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      if (initialLoadRef.current) {
        setLoading(false);
        initialLoadRef.current = false; // Marcar que la carga inicial terminó
      }
    }
  }, [conversationId]); // Depende solo de conversationId

  // --- MODIFICACIÓN CLAVE: useEffect con setInterval ---
  useEffect(() => {
    if (!conversationId) return;

    // Reseteamos la carga inicial al cambiar de chat
    initialLoadRef.current = true;
    
    // 1. Cargar mensajes inmediatamente al seleccionar
    fetchMessages(); 

    // 2. Establecer el polling (ej. cada 5 segundos)
    const intervalId = setInterval(() => {
      fetchMessages();
    }, 5000); // 5000ms = 5 segundos

    // 3. Limpiar el intervalo cuando el componente se desmonte
    // o cuando el 'conversationId' cambie
    return () => {
      clearInterval(intervalId);
    };
    
  }, [conversationId, fetchMessages]); // El 'fetchMessages' está en la dependencia
  // ---------------------------------------------------

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:${PORT}/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: newMessage })
      });

      const data = await res.json();

      if (res.ok) {
        setMessages(prevMessages => [...prevMessages, data.data]); // Añadir nuevo mensaje
        setNewMessage(''); // Limpiar input
      } else {
        throw new Error(data.message || 'Error al enviar mensaje');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (!conversationId) {
    return <div className="chat-placeholder">Selecciona una conversación para empezar a chatear.</div>;
  }

  if (loading && !conversation) {
    return <div className="chat-placeholder">Cargando...</div>;
  }

  // Encontrar al otro participante
  const otherParticipant = conversation?.participants?.find(p => p._id !== user._id);
  const headerTitle = otherParticipant ? otherParticipant.username : 'Chat';
  const headerAvatar = otherParticipant ? otherParticipant.avatar : 'https://via.placeholder.com/50';

  return (
    <div className="chat-window-col">
      <div className="chat-window-header">
        <img src={headerAvatar} alt="avatar" className="conversation-avatar" />
        <h4>{headerTitle}</h4>
      </div>
      
      <div className="chat-messages">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`message ${msg.sender._id === user._id ? 'sent' : 'received'}`}
          >
            <span className="message-sender">{msg.sender.username}</span>
            <div className="message-content">{msg.content}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="chat-input-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Escribe un mensaje..."
        />
        <button type="submit" className="btn btn-primary">Enviar</button>
      </form>
    </div>
  );
};

export default ChatWindow;