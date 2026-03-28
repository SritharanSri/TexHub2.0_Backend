const router = require('express').Router();
const user = require('../controllers/user.controller');
const authenticate = require('../middlewares/authenticate');
const validate = require('../middlewares/validate');
const { uploadAvatar } = require('../middlewares/uploadMiddleware');
const { updateProfileSchema, changePasswordSchema } = require('../utils/validators/user.validator');

router.use(authenticate);

router.get('/me', user.getProfile);
router.put('/me', validate(updateProfileSchema), user.updateProfile);
router.put('/me/avatar', uploadAvatar, user.uploadAvatar);
router.put('/me/password', validate(changePasswordSchema), user.changePassword);
router.get('/me/settings', user.getSettings);
router.put('/me/settings', user.updateSettings);

module.exports = router;
