const router = require('express').Router();
const tailor = require('../controllers/tailor.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { uploadNic } = require('../middlewares/uploadMiddleware');
const { tailorProfileSchema } = require('../utils/validators/tailor.validator');

// Public routes
router.get('/:tailorId/public', tailor.getPublicProfile);
router.get('/:tailorId/stats', tailor.getStats);

// Protected tailor routes
router.get('/me/profile', authenticate, authorize('tailor'), tailor.getMyProfile);
router.put('/me/profile', authenticate, authorize('tailor'), validate(tailorProfileSchema), tailor.updateProfile);
router.post('/me/nic', authenticate, authorize('tailor'), uploadNic, tailor.uploadNic);

module.exports = router;
