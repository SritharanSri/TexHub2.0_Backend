const router = require('express').Router({ mergeParams: true });
const quotation = require('../controllers/quotation.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { createQuotationSchema } = require('../utils/validators/quotation.validator');

router.use(authenticate);

router.post('/', authorize('tailor'), validate(createQuotationSchema), quotation.create);
router.get('/', quotation.getForOrder);

module.exports = router;
