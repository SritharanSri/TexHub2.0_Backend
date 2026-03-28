const router = require('express').Router();
const order = require('../controllers/order.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { uploadOrderImages } = require('../middlewares/uploadMiddleware');
const { createOrderSchema, progressSchema, statusSchema } = require('../utils/validators/order.validator');

router.use(authenticate);

router.post('/', authorize('customer'), uploadOrderImages, order.create);
router.get('/my', authorize('customer', 'tailor'), order.getMyOrders);
router.get('/open', authorize('tailor'), order.getOpenOrders);
router.get('/:id', order.getById);
router.put('/:id', authorize('tailor'), order.updateOrder);
router.put('/:id/progress', authorize('tailor'), validate(progressSchema), order.updateProgress);
router.put('/:id/status', authorize('tailor'), validate(statusSchema), order.updateStatus);
router.put('/:id/cancel', authorize('customer'), order.cancel);

module.exports = router;
