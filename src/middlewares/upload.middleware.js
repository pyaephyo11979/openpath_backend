const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
const s3 = require('#utils/s3.js');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'src/public/uploads');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const s3Storage = multerS3({
  s3: s3,
  bucket: process.env.BUCKET_NAME,
  metadata: (req, file, cb) => {
    cb(null, { fieldName: file.fieldname });
  },
  key: (req, file, cb) => {
    cb(null, Date.now().toString() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: s3Storage });

module.exports = upload;
