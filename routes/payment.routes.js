const router = require('express').Router({ mergeParams: true });
const payment = require('../controllers/payment.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { uploadSlip } = require('../middlewares/uploadMiddleware');
const { bankDepositSchema, cardPaymentSchema } = require('../utils/validators/payment.validator');

router.use(authenticate);

router.post('/bank-deposit', authorize('customer'), uploadSlip, payment.createBankDeposit);
router.post('/card', authorize('customer'), validate(cardPaymentSchema), payment.createCard);
router.get('/', payment.getByOrder);

module.exports = router;
