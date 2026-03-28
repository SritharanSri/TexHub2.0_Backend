const router = require('express').Router();
const complaint = require('../controllers/complaint.controller');
const authenticate = require('../middlewares/authenticate');
const validate = require('../middlewares/validate');
const { uploadEvidence } = require('../middlewares/uploadMiddleware');
const { createComplaintSchema } = require('../utils/validators/complaint.validator');

router.use(authenticate);

router.post('/', uploadEvidence, complaint.create);
router.get('/my', complaint.getMine);
router.get('/:id', complaint.getById);

module.exports = router;
