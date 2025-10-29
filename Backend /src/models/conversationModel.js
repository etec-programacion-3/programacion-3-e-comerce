import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }
}, {
  timestamps: true
});

// Ensure only 2 participants per conversation
conversationSchema.pre('save', function(next) {
  if (this.participants.length !== 2) {
    next(new Error('A conversation must have exactly 2 participants'));
  } else {
    next();
  }
});

// Create compound index to prevent duplicate conversations
conversationSchema.index({ participants: 1 });

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;
