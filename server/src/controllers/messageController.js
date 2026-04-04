const mongoose = require('mongoose');
const Message = require('../models/Message');
const User = require('../models/User');
const { encrypt, decrypt, MAX_PLAINTEXT_LENGTH } = require('../utils/encryption');
const { isValidObjectId } = require('../utils/validate');

const getThreadId = (userA, userB) => {
  return [userA.toString(), userB.toString()].sort().join('_');
};

const getMessages = async (req, res, next) => {
  const otherUserId = req.params.userId;

  if (!isValidObjectId(otherUserId)) {
    res.status(400);
    return next(new Error('Identifiant utilisateur invalide'));
  }

  const threadId = getThreadId(req.user._id, otherUserId);

  try {
    const messages = await Message.find({ thread: threadId }).sort({ createdAt: 1 });
    const decryptedMessages = messages.map((msg) => ({
      ...msg._doc,
      content: decrypt(msg.content),
    }));
    res.json(decryptedMessages);
  } catch (error) {
    next(error);
  }
};

const sendMessage = async (req, res, next) => {
  const { content } = req.body;
  const receiverId = req.params.userId;

  if (!isValidObjectId(receiverId)) {
    res.status(400);
    return next(new Error('Destinataire invalide'));
  }

  if (receiverId === req.user._id.toString()) {
    res.status(400);
    return next(new Error('Vous ne pouvez pas vous envoyer un message a vous-meme'));
  }

  if (content == null || typeof content !== 'string') {
    res.status(400);
    return next(new Error('Message requis'));
  }

  if (content.length === 0 || content.length > MAX_PLAINTEXT_LENGTH) {
    res.status(400);
    return next(new Error('Message vide ou trop volumineux'));
  }

  const threadId = getThreadId(req.user._id, receiverId);

  try {
    const receiverExists = await User.exists({ _id: new mongoose.Types.ObjectId(receiverId) });
    if (!receiverExists) {
      res.status(404);
      return next(new Error('Utilisateur introuvable'));
    }

    let encryptedContent;
    try {
      encryptedContent = encrypt(content);
    } catch (e) {
      res.status(400);
      return next(e);
    }

    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      content: encryptedContent,
      thread: threadId,
    });

    const populated = await Message.findById(message._id).populate('sender', 'name');
    res.status(201).json({
      ...populated._doc,
      content,
    });
  } catch (error) {
    next(error);
  }
};

const getInbox = async (req, res, next) => {
  try {
    const threads = await Message.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
    })
      .sort({ createdAt: -1 })
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar');

    const inbox = [];
    const seenUsers = new Set();

    threads.forEach((msg) => {
      const otherUser =
        msg.sender && msg.sender._id.toString() === req.user._id.toString()
          ? msg.receiver
          : msg.sender;
      if (otherUser && !seenUsers.has(otherUser._id.toString())) {
        seenUsers.add(otherUser._id.toString());
        inbox.push({
          user: otherUser,
          lastMessage: decrypt(msg.content),
          createdAt: msg.createdAt,
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
  getInbox,
};
