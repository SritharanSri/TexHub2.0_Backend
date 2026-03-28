const { Op } = require('sequelize');
const { Message, User, Order, Notification } = require('../models');

// Fetch messages for a specific order
exports.getMessagesByOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    // Support UUID or order number lookup safely
    const isUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(orderId);
    const order = await Order.findOne({
      where: isUUID ? { [Op.or]: [{ id: orderId }, { orderNumber: orderId }] } : { orderNumber: orderId }
    });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    console.log(`[Chat Access Check] Order: ${order.orderNumber} (ID: ${order.id})`);
    console.log(`[Chat Access Check] User Request ID: ${userId} (Role: ${req.user.role})`);
    console.log(`[Chat Access Check] Order Customer ID: ${order.customerId}`);
    console.log(`[Chat Access Check] Order Tailor ID: ${order.tailorId}`);

    // Allow: customer, assigned tailor, any party involved, or a tailor who has bid
    const isCustomer = String(order.customerId) === String(userId);
    const isTailor = String(order.tailorId) === String(userId);
    const isAdmin = req.user.role === 'admin';

    let isQuotedTailor = false;
    if (!isCustomer && !isTailor && !isAdmin && req.user.role === 'tailor') {
      const { Quotation } = require('../models');
      const quote = await Quotation.findOne({ where: { orderId: order.id, tailorId: userId } });
      isQuotedTailor = !!quote;
    }

    console.log(`[Chat Access Check] Permissions: isCustomer=${isCustomer}, isTailor=${isTailor}, isAdmin=${isAdmin}, isQuotedTailor=${isQuotedTailor}`);

    if (!isCustomer && !isTailor && !isAdmin && !isQuotedTailor) {
      return res.status(403).json({ message: 'You do not have access to this order chat' });
    }

    const messages = await Message.findAll({
      where: { orderId: order.id },
      order: [['createdAt', 'ASC']],
      logging: console.log,
      include: [
        { model: User, as: 'sender', attributes: ['id', 'name', 'role'] },
        { model: User, as: 'receiver', attributes: ['id', 'name', 'role'] }
      ]
    });

    console.log(`[Chat Fetch] Found ${messages.length} messages for order ${order.id}`);
    res.json({ success: true, data: messages });
  } catch (error) {
    console.error('Error in getMessagesByOrder:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Send a new message
exports.sendMessage = async (req, res) => {
  try {
    const { orderId, content, receiverId: explicitReceiverId } = req.body;
    const senderId = req.user.id;

    if (!orderId || !content) {
      return res.status(400).json({ message: 'orderId and content are required' });
    }

    // Support UUID or order number lookup safely
    const isUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(orderId);
    const order = await Order.findOne({
      where: isUUID ? { [Op.or]: [{ id: orderId }, { orderNumber: orderId }] } : { orderNumber: orderId }
    });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    console.log(`[Chat Message Send] Order: ${order.orderNumber} (ID: ${order.id})`);
    console.log(`[Chat Message Send] Sender ID: ${senderId} (Role: ${req.user.role})`);
    console.log(`[Chat Message Send] Order Tailor: ${order.tailorId}, Order Customer: ${order.customerId}`);

    const isCustomer = String(order.customerId) === String(senderId);
    const isTailor = String(order.tailorId) === String(senderId);

    // Also allow tailors who have quoted (pre-assignment bidding chat)
    let isQuotedTailor = false;
    if (!isCustomer && !isTailor && req.user.role === 'tailor') {
      const { Quotation } = require('../models');
      const quote = await Quotation.findOne({ where: { orderId: order.id, tailorId: senderId } });
      isQuotedTailor = !!quote;
    }

    console.log(`[Chat Message Send] Permissions: isCustomer=${isCustomer}, isTailor=${isTailor}, isQuotedTailor=${isQuotedTailor}`);

    if (!isCustomer && !isTailor && !isQuotedTailor) {
      return res.status(403).json({ message: 'Not allowed to send messages for this order' });
    }

    // Determine receiver:
    // 1. Use explicit receiverId if provided (pre-assignment)
    // 2. Fall back to order's assigned tailor / customer
    let receiverId;
    if (explicitReceiverId) {
      receiverId = explicitReceiverId;
    } else {
      receiverId = isCustomer ? order.tailorId : order.customerId;
    }

    if (!receiverId) {
      return res.status(400).json({ message: 'No recipient found. A tailor must be selected or a receiverId provided.' });
    }

    const message = await Message.create({
      orderId: order.id,
      senderId,
      receiverId,
      content,
    });

    console.log('Message saved to database:', message.id);

    const messageWithDetails = await Message.findByPk(message.id, {
      include: [
        { model: User, as: 'sender', attributes: ['id', 'name', 'role'] },
        { model: User, as: 'receiver', attributes: ['id', 'name', 'role'] }
      ]
    });

    // Real-time emission
    try {
      const io = req.app.get('io');
      const roomId = String(order.id);
      io.to(roomId).emit('new_message', messageWithDetails);
      console.log(`Socket emission for order ${roomId} sent to room. Message ID: ${message.id}`);

      // ─── Notification Logic ─────────────────────────────────────────
      // Create notification for receiver
      const notification = await Notification.create({
        userId: receiverId,
        type: 'new_message',
        title: 'New Message',
        message: `You received a new message from ${req.user.name} regarding order ${order.orderNumber || 'TEX-Order'}`,
        data: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          senderId: req.user.id,
          senderName: req.user.name,
          messageId: message.id
        }
      });

      // Emit notification to receiver's private room
      io.to(receiverId).emit('new_notification', notification);
      console.log(`Notification emitted to user ${receiverId}`);
    } catch (ioErr) {
      console.error('Socket emission failed:', ioErr);
    }

    res.status(201).json({ success: true, data: messageWithDetails });
  } catch (error) {
    console.error('Error in sendMessage:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

