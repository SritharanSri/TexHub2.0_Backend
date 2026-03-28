const router = require('express').Router({ mergeParams: true });
const escrow = require('../controllers/escrow.controller');
const authenticate = require('../middlewares/authenticate');

router.use(authenticate);
router.get('/', escrow.getByOrder);

module.exports = router;
