const multer = require('multer');
const ApiError = require('../utils/ApiError');

// Use memory storage so we can upload buffers to Cloudinary via streams
const storage = multer.memoryStorage();

// File filter to allow only specific image formats
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Unsupported file format. Please upload JPEG, PNG, or WEBP.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

module.exports = upload;
