const cloudinary = require('cloudinary').v2;
const config = require('../config');

if (config.cloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
    secure: true,
  });
}

const uploadBuffer = (buffer, folder = 'jmj-gallery') =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder, resource_type: 'image' }, (error, result) =>
      error ? reject(error) : resolve(result),
    );
    stream.end(buffer);
  });

const deleteImage = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error('Cloudinary delete failed:', err.message);
  }
};

module.exports = { cloudinary, uploadBuffer, deleteImage };
