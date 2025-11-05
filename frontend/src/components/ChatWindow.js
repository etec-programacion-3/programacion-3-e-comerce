// src/components/ChatWindow.js
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Función para obtener los mensajes
  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;
    
    setLoading(true);
    const token = localStorage.getItem('token');
    
    try {
      // 1. Obtener los detalles de la conversación (para saber con quién hablamos)
      const convRes = await fetch(`http://localhost:${PORT}/api/conversations/${conversationId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const convData = await convRes.json();
      if (convRes.ok) {
        setConversation(convData.data);
      } else {
        throw new Error(convData.message || 'Error al cargar conversación');
      }

      // 2. Obtener los mensajes
      const msgRes = await fetch(`http://localhost:${PORT}/api/conversations/${conversationId}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const msgData = await msgRes.json();
      if (msgRes.ok) {
        setMessages(msgData.data);
      } else {
        throw new Error(msgData.message || 'Error al cargar mensajes');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

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