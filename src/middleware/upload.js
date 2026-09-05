const multer = require("multer");
const cloudinary = require("../config/cloudinary");

// Keep the file in memory and stream it to Cloudinary ourselves — nothing
// touches disk, and nothing but a URL + public_id ever reaches PostgreSQL.
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB per image
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed."));
    }
    cb(null, true);
  },
});

// Streams a buffer (from multer memoryStorage) up to Cloudinary.
// `folder` groups uploads in the Cloudinary media library, e.g. "arss/films".
function uploadBufferToCloudinary(buffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result); // result.secure_url, result.public_id
      }
    );
    stream.end(buffer);
  });
}

async function destroyCloudinaryImage(publicId) {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    // Non-fatal: the DB record is the source of truth for what the site shows.
    console.error("Cloudinary delete failed for", publicId, err.message);
  }
}

module.exports = { upload, uploadBufferToCloudinary, destroyCloudinaryImage };
