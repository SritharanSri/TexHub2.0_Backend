const router = require('express').Router({ mergeParams: true });
const rating = require('../controllers/rating.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { createRatingSchema } = require('../utils/validators/rating.validator');

// POST /api/v1/orders/:orderId/ratings
router.post('/', authenticate, authorize('customer'), validate(createRatingSchema), rating.create);

module.exports = router;
