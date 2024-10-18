const express = require('express');
const router = express.Router();
const destinations = require('../controllers/destinations');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateDestination } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

router.route('/')
    .get(catchAsync(destinations.index))
    .post(isLoggedIn, upload.array('image'), validateDestination, catchAsync(destinations.createDestination))

router.get('/new', isLoggedIn, destinations.renderNewForm)

router.route('/:id')
    .get(catchAsync(destinations.showDestination))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateDestination, catchAsync(destinations.updateDestination))
    .delete(isLoggedIn, isAuthor, catchAsync(destinations.deleteDestination));

router.get('/:id/editForm', isLoggedIn, isAuthor, catchAsync(destinations.renderEditForm))

module.exports = router;