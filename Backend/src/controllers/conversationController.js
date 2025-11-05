// Backend/src/controllers/conversationController.js
import { Conversation, Message, User, Product } from '../config/db.js';
import { Op } from 'sequelize';

// Opciones de Inclusión (Populate) para Sequelize
const includeOptions = [
  {
    model: User,
    as: 'participants',
    attributes: ['_id', 'username', 'avatar', 'email'],
    through: { attributes: [] } // No incluir la tabla intermedia
  },
  {
    model: Message,
    as: 'lastMessage',
    include: [{ model: User, as: 'sender', attributes: ['_id', 'username', 'avatar'] }]
  },
  {
    model: Product,
    as: 'product',
    attributes: ['_id', 'name', 'price', 'image']
  }
];

// @desc    Get user's conversations
// @route   GET /api/conversations
// @access  Private
export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Encontrar todas las conversaciones donde el usuario es participante
    const conversations = await Conversation.findAll({
      include: [
        {
          model: User,
          as: 'participants',
          where: { _id: userId }, // Filtrar por el usuario actual
          attributes: [] // No necesitamos los datos del usuario aquí
        },
        // ...includeOptions // <-- BUG ORIGINAL: Esto causaba doble include
        // Definimos los includes aquí mismo para evitar el bug de doble 'as'
        {
          model: User,
          as: 'participants',
          attributes: ['_id', 'username', 'avatar', 'email'],
          through: { attributes: [] }
        },
        {
          model: Message,
          as: 'lastMessage',
          include: [{ model: User, as: 'sender', attributes: ['_id', 'username', 'avatar'] }]
        },
        {
          model: Product,
          as: 'product',
          attributes: ['_id', 'name', 'price', 'image']
        }
      ],
      order: [['updatedAt', 'DESC']]
    });

    // 2. Obtener el conteo de no leídos (similar a la lógica original)
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await Message.count({
          where: {
            conversationId: conv._id,
            senderId: { [Op.ne]: userId },
            isRead: false
          }
        });
        
        // --- LA LÍNEA DEL BUG FUE ELIMINADA ---
        // Ya no filtramos los participantes aquí.
        // El frontend (ConversationList.js) se encargará de esto.
        // const filteredConv = conv.toJSON();
        // filteredConv.participants = filteredConv.participants.filter(p => p._id !== userId); 
        // --- FIN DE LA LÍNEA ELIMINADA ---

        return {
          ...conv.toJSON(), // Devolvemos la conversación COMPLETA
          unreadCount
        };
      })
    );

    res.status(200).json({
      success: true,
      data: conversationsWithUnread,
      count: conversationsWithUnread.length
    });

  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conversations',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ... (El resto del archivo, createConversation, getConversationById, etc., sigue igual) ...


// @desc    Get or create conversation
// @route   POST /api/conversations
// @access  Private
export const createConversation = async (req, res) => {
  try {
    // --- 1. CORRECCIÓN: Convertir a Enteros ---
    const { participantId: participantIdStr, productId: productIdStr } = req.body;
    const userId = req.user._id; // Ya es un entero

    if (!participantIdStr) {
      return res.status(400).json({
        success: false,
        message: 'Participant ID is required'
      });
    }

    const participantId = parseInt(participantIdStr);
    const productId = productIdStr ? parseInt(productIdStr) : null;
    // ------------------------------------------

    if (participantId === userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot create conversation with yourself'
      });
    }
    
    // 1. Buscar si ya existe una conversación
    const userConversations = await Conversation.findAll({
      include: [{
        model: User,
        as: 'participants',
        where: { _id: userId },
        attributes: ['_id']
      }]
    });

    let existingConversation = null;
    if (userConversations.length > 0) {
      const conv = await Conversation.findOne({
        where: {
          _id: { [Op.in]: userConversations.map(c => c._id) }
        },
        include: [{
          model: User,
          as: 'participants',
          // --- 2. CORRECCIÓN: Usar la variable de entero ---
          where: { _id: participantId }, 
          attributes: ['_id']
        }, 
        // Usamos el includeOptions aquí
        ...includeOptions]
      });
      existingConversation = conv;
    }

    if (existingConversation) {
       // El frontend ya filtra, pero es bueno hacerlo aquí también
       const filteredConv = existingConversation.toJSON();
       filteredConv.participants = filteredConv.participants.filter(p => p._id !== userId);

      return res.status(200).json({
        success: true,
        message: 'Conversation already exists',
        data: filteredConv
      });
    }

    // 2. Crear nueva conversación
    const newConversation = await Conversation.create({
      // --- 3. CORRECCIÓN: Usar la variable de entero ---
      productId: productId || null 
    });

    // 3. Asociar participantes
    await newConversation.setParticipants([userId, participantId]); // Ya son enteros

    // 4. Obtener la conversación completa para devolverla
    const fullConversation = await Conversation.findByPk(newConversation._id, {
      include: includeOptions
    });

    // Filtramos la data enviada en la *creación*
    const filteredConv = fullConversation.toJSON();
    filteredConv.participants = filteredConv.participants.filter(p => p._id !== userId);

    res.status(201).json({
      success: true,
      message: 'Conversation created successfully',
      data: filteredConv
    });

  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating conversation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get conversation by ID
// @route   GET /api/conversations/:id
// @access  Private
export const getConversationById = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const conversation = await Conversation.findByPk(id, {
      include: includeOptions
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Verificar que el usuario sea participante
    const isParticipant = conversation.participants.some(
      p => p._id === userId
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this conversation'
      });
    }

    // Contar no leídos
    const unreadCount = await Message.count({
      where: {
        conversationId: conversation._id,
        senderId: { [Op.ne]: userId },
        isRead: false
      }
    });
    
    // Excluir al usuario actual de la lista de participantes
    const filteredConv = conversation.toJSON();
    filteredConv.participants = filteredConv.participants.filter(p => p._id !== userId);

    res.status(200).json({
      success: true,
      data: {
        ...filteredConv,
        unreadCount
      }
    });

  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conversation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete conversation
// @route   DELETE /api/conversations/:id
// @access  Private
export const deleteConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findByPk(id, {
      include: [{ model: User, as: 'participants', attributes: ['_id'] }]
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Verificar que el usuario sea participante
    const isParticipant = conversation.participants.some(
      p => p._id === userId
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this conversation'
      });
    }

    await conversation.destroy();

    res.status(200).json({
      success: true,
      message: 'Conversation deleted successfully'
    });

  } catch (error)
 {
    console.error('Delete conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting conversation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};