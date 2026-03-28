const router = require('express').Router();
const authenticate = require('../middlewares/authenticate');
const notification = require('../controllers/notification.controller');

router.use(authenticate);

router.get('/',             notification.getAll);
router.get('/unread-count', notification.unreadCount);
router.put('/read-all',     notification.markAllRead);
router.put('/:id/read',     notification.markRead);

module.exports = router;
