// Backend/src/controllers/conversationController.js
import { Conversation, Message, User, Product } from '../config/db.js';
import { Op } from 'sequelize';

// Opciones de Inclusión (Populate) para Sequelize
const includeOptions = [
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
];

// @desc    Get user's conversations
// @route   GET /api/conversations
// @access  Private
export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    // Buscar conversaciones del usuario
    const userWithConversations = await User.findByPk(userId, {
      include: [{
        model: Conversation,
        as: 'conversations',
        include: [
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
        ]
      }]
    });

    if (!userWithConversations || !userWithConversations.conversations) {
      return res.status(200).json({
        success: true,
        data: [],
        count: 0
      });
    }

    const conversations = userWithConversations.conversations;

    // Ordenar por updatedAt
    conversations.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    // Obtener conteo de no leídos
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await Message.count({
          where: {
            conversationId: conv._id,
            senderId: { [Op.ne]: userId },
            isRead: false
          }
        });

        return {
          ...conv.toJSON(),
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

// @desc    Get or create conversation
// @route   POST /api/conversations
// @access  Private
export const createConversation = async (req, res) => {
  try {
    const { participantId: participantIdStr, productId: productIdStr } = req.body;
    const userId = req.user._id;

    if (!participantIdStr) {
      return res.status(400).json({
        success: false,
        message: 'Participant ID is required'
      });
    }

    const participantId = parseInt(participantIdStr);
    const productId = productIdStr ? parseInt(productIdStr) : null;

    if (participantId === userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot create conversation with yourself'
      });
    }
    
    // Buscar conversaciones del usuario
    const userWithConversations = await User.findByPk(userId, {
      include: [{
        model: Conversation,
        as: 'conversations',
        include: [{
          model: User,
          as: 'participants',
          attributes: ['_id']
        }]
      }]
    });

    // Buscar si ya existe conversación con ambos participantes
    let existingConversation = null;
    if (userWithConversations && userWithConversations.conversations) {
      for (const conv of userWithConversations.conversations) {
        const participantIds = conv.participants.map(p => p._id);
        if (participantIds.includes(participantId) && participantIds.length === 2) {
          existingConversation = conv;
          break;
        }
      }
    }

    if (existingConversation) {
      // Cargar conversación completa
      const fullConv = await Conversation.findByPk(existingConversation._id, {
        include: includeOptions
      });

      return res.status(200).json({
        success: true,
        message: 'Conversation already exists',
        data: fullConv
      });
    }

    // Crear nueva conversación
    const newConversation = await Conversation.create({
      productId: productId || null
    });

    // Asociar participantes
    await newConversation.setParticipants([userId, participantId]);

    // Obtener conversación completa
    const fullConversation = await Conversation.findByPk(newConversation._id, {
      include: includeOptions
    });

    res.status(201).json({
      success: true,
      message: 'Conversation created successfully',
      data: fullConversation
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

    const isParticipant = conversation.participants.some(
      p => p._id === userId
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this conversation'
      });
    }

    const unreadCount = await Message.count({
      where: {
        conversationId: conversation._id,
        senderId: { [Op.ne]: userId },
        isRead: false
      }
    });

    res.status(200).json({
      success: true,
      data: {
        ...conversation.toJSON(),
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

  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting conversation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
