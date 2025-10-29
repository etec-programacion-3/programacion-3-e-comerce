import Conversation from '../models/conversationModel.js';
import Message from '../models/messageModel.js';

// @desc    Get user's conversations
// @route   GET /api/conversations
// @access  Private
export const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id
    })
    .populate('participants', 'username avatar email')
    .populate('lastMessage')
    .populate('product', 'name price images')
    .sort('-updatedAt');

    // Get unread count for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await Message.countDocuments({
          conversation: conv._id,
          sender: { $ne: req.user.id },
          isRead: false
        });

        return {
          ...conv.toObject(),
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
    const { participantId, productId } = req.body;

    if (!participantId) {
      return res.status(400).json({ 
        success: false,
        message: 'Participant ID is required' 
      });
    }

    // Don't allow conversation with self
    if (participantId === req.user.id) {
      return res.status(400).json({ 
        success: false,
        message: 'Cannot create conversation with yourself' 
      });
    }

    // Check if conversation already exists between these two users
    const existingConversation = await Conversation.findOne({
      participants: { $all: [req.user.id, participantId] }
    })
    .populate('participants', 'username avatar email')
    .populate('lastMessage')
    .populate('product', 'name price images');

    if (existingConversation) {
      return res.status(200).json({
        success: true,
        message: 'Conversation already exists',
        data: existingConversation
      });
    }

    // Create new conversation
    const newConversation = new Conversation({
      participants: [req.user.id, participantId],
      product: productId || null
    });

    await newConversation.save();
    
    await newConversation.populate('participants', 'username avatar email');
    if (productId) {
      await newConversation.populate('product', 'name price images');
    }

    res.status(201).json({
      success: true,
      message: 'Conversation created successfully',
      data: newConversation
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
    const conversation = await Conversation.findById(req.params.id)
      .populate('participants', 'username avatar email')
      .populate('lastMessage')
      .populate('product', 'name price images');

    if (!conversation) {
      return res.status(404).json({ 
        success: false,
        message: 'Conversation not found' 
      });
    }

    // Verify user is participant
    const isParticipant = conversation.participants.some(
      p => p._id.toString() === req.user.id
    );

    if (!isParticipant) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to view this conversation' 
      });
    }

    // Get unread count
    const unreadCount = await Message.countDocuments({
      conversation: conversation._id,
      sender: { $ne: req.user.id },
      isRead: false
    });

    res.status(200).json({
      success: true,
      data: {
        ...conversation.toObject(),
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
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({ 
        success: false,
        message: 'Conversation not found' 
      });
    }

    // Verify user is participant
    const isParticipant = conversation.participants.some(
      p => p.toString() === req.user.id
    );

    if (!isParticipant) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to delete this conversation' 
      });
    }

    // Delete all messages in conversation
    await Message.deleteMany({ conversation: req.params.id });

    // Delete conversation
    await conversation.deleteOne();

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
