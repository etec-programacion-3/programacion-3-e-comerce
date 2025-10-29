import Message from '../models/messageModel.js';
import Conversation from '../models/conversationModel.js';

// @desc    Get messages for a conversation
// @route   GET /api/messages/:conversationId
// @access  Private
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Verify user is part of the conversation
    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return res.status(404).json({ 
        success: false,
        message: 'Conversation not found' 
      });
    }

    const isParticipant = conversation.participants.some(
      p => p.toString() === req.user.id
    );

    if (!isParticipant) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to view this conversation' 
      });
    }

    // Get messages
    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'username avatar')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort('-createdAt');

    const count = await Message.countDocuments({ conversation: conversationId });

    res.status(200).json({
      success: true,
      data: messages.reverse(), // Send in chronological order
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching messages',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    const { conversationId, content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ 
        success: false,
        message: 'Message content is required' 
      });
    }

    // Verify conversation exists and user is participant
    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return res.status(404).json({ 
        success: false,
        message: 'Conversation not found' 
      });
    }

    const isParticipant = conversation.participants.some(
      p => p.toString() === req.user.id
    );

    if (!isParticipant) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to send messages in this conversation' 
      });
    }

    // Create message
    const newMessage = new Message({
      sender: req.user.id,
      content: content.trim(),
      conversation: conversationId
    });

    await newMessage.save();
    await newMessage.populate('sender', 'username avatar');

    // Update conversation's last message
    conversation.lastMessage = newMessage._id;
    await conversation.save();

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: newMessage
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error sending message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Mark messages as read
// @route   PUT /api/messages/:conversationId/read
// @access  Private
export const markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;

    // Verify user is part of the conversation
    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return res.status(404).json({ 
        success: false,
        message: 'Conversation not found' 
      });
    }

    const isParticipant = conversation.participants.some(
      p => p.toString() === req.user.id
    );

    if (!isParticipant) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized' 
      });
    }

    // Mark all unread messages from other users as read
    await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: req.user.id },
        isRead: false
      },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      message: 'Messages marked as read'
    });

  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error marking messages as read',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
