const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const uuidv4 = () => crypto.randomUUID();

const makeStorage = (destination) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '..', 'uploads', destination));
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${file.fieldname}-${uuidv4()}${ext}`);
    },
  });

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp|pdf/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, gif, webp) and PDFs are allowed.'));
  }
};

const maxSize = (parseInt(process.env.UPLOAD_MAX_SIZE_MB, 10) || 10) * 1024 * 1024;

const uploadAvatar = multer({
  storage: makeStorage('avatars'),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single('avatar');

const uploadNic = multer({
  storage: makeStorage('nic'),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).fields([
  { name: 'nicFront', maxCount: 1 },
  { name: 'nicBack', maxCount: 1 },
]);

const uploadOrderImages = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const dest = file.fieldname.startsWith('designImage') ? 'designs' : 'references';
      cb(null, path.join(__dirname, '..', 'uploads', dest));
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${file.fieldname}-${uuidv4()}${ext}`);
    },
  }),
  fileFilter,
  limits: { fileSize: maxSize },
}).any();

const uploadSlip = multer({
  storage: makeStorage('slips'),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single('slipImage');

const uploadEvidence = multer({
  storage: makeStorage('evidence'),
  fileFilter,
  limits: { fileSize: maxSize },
}).array('evidence', 5);

module.exports = {
  uploadAvatar,
  uploadNic,
  uploadOrderImages,
  uploadSlip,
  uploadEvidence,
};
