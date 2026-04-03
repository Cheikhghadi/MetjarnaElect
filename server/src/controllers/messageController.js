const Message = require('../models/Message');
const { encrypt, decrypt } = require('../utils/encryption');

// Helper to get thread ID
const getThreadId = (userA, userB) => {
  return [userA.toString(), userB.toString()].sort().join('_');
};

// @desc    Get messages thread with a user
// @route   GET /api/messages/:userId
const getMessages = async (req, res, next) => {
  const otherUserId = req.params.userId;
  const threadId = getThreadId(req.user._id, otherUserId);

  try {
    const messages = await Message.find({ thread: threadId }).sort({ createdAt: 1 });
    const decryptedMessages = messages.map(msg => ({
      ...msg._doc,
      content: decrypt(msg.content)
    }));
    res.json(decryptedMessages);
  } catch (error) {
    next(error);
  }
};

// @desc    Send a message
// @route   POST /api/messages/:userId
const sendMessage = async (req, res, next) => {
  const { content } = req.body;
  const receiverId = req.params.userId;
  const threadId = getThreadId(req.user._id, receiverId);

  try {
    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      content: encrypt(content),
      thread: threadId
    });

    const populated = await Message.findById(message._id).populate('sender', 'name');
    res.status(201).json({
      ...populated._doc,
      content: content // Send back raw content for immediate UI update
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all unique conversation partners
// @route   GET /api/messages/inbox/all
const getInbox = async (req, res, next) => {
  try {
    // Finds unique 'other' users in messages where current user is sender or receiver
    const threads = await Message.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }]
    })
    .sort({ createdAt: -1 })
    .populate('sender', 'name avatar')
    .populate('receiver', 'name avatar');

    const inbox = [];
    const seenUsers = new Set();

    threads.forEach(msg => {
      const otherUser = msg.sender && msg.sender._id.toString() === req.user._id.toString() ? msg.receiver : msg.sender;
      if (otherUser && !seenUsers.has(otherUser._id.toString())) {
        seenUsers.add(otherUser._id.toString());
        inbox.push({
          user: otherUser,
          lastMessage: decrypt(msg.content),
          createdAt: msg.createdAt
        });
      }
    });

    res.json(inbox);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMessages,
  sendMessage,
  getInbox
};
