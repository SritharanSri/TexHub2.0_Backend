const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authenticate = require('../middlewares/authenticate');

router.use(authenticate);

// Get messages for an order
router.get('/order/:orderId', messageController.getMessagesByOrder);

// Send message
router.post('/', messageController.sendMessage);

module.exports = router;
