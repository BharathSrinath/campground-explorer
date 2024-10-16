// https://cloudinary.com/documentation/node_integration
// https://cloudinary.com/documentation/node_quickstart

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// https://github.com/motdotla/dotenv

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});


const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'Explorer',
        allowedFormats: ['jpeg', 'png', 'jpg']
    }
});

module.exports = {
    cloudinary,
    storage
}