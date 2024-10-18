const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateDestination } = require('../middleware');

const Destination = require('../models/destination');

router.get('/', catchAsync(async (req, res) => {
    const destinations = await Destination.find({});
    res.render('destinations/index', { destinations })
}));

router.get('/new', isLoggedIn, (req, res) => {
    res.render('destinations/new');
})


router.post('/', isLoggedIn, validateDestination, catchAsync(async (req, res, next) => {
    const destination = new Destination(req.body.destination);
    destination.author = req.user._id;
    // With the help of passport.js we have user property being to added to req object. 
    // We are extracting that and assigned to author so that we can use the value display the author name wherever we want.
    await destination.save();
    req.flash('success', 'Successfully made a new destination!');
    res.redirect(`/destinations/${destination._id}`)
}))

router.get('/:id', catchAsync(async (req, res,) => {
    const destination = await Destination.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    console.log(destination);
    if (!destination) {
        req.flash('error', 'Cannot find that destination!');
        return res.redirect('/destinations');
    }
    res.render('destinations/show', { destination });
}));

// populate
// Syntax: simple populate
    // .populate('path') // Populate a single path
    // .populate('path1 path2') // Populate multiple paths
// Syntax: nested populate
    // .populate({
    //   path: 'nestedPath',
    //   populate: {
    //     path: 'deeplyNestedPath'
    //   }
    // })
// With simple populate, we can directly specify the path name without using the property name ('path'). 
// However, with nested populate, we specify the path as an object where the key is 'path' and the value is the name of the path to populate.
// Inside the nested populate object, you can use the 'populate' property to further specify nested paths to populate.

router.get('/:id/editForm', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    const destination = await Destination.findById(id)
    if (!destination) {
        req.flash('error', 'Cannot find that destination!');
        return res.redirect('/destinations');
    }
    res.render('destinations/editForm', { destination });
}))

router.put('/:id', isLoggedIn, isAuthor, validateDestination, catchAsync(async (req, res) => {
    const { id } = req.params;
    const destination = await Destination.findByIdAndUpdate(id, { ...req.body.destination });
    req.flash('success', 'Successfully updated destination!');
    res.redirect(`/destinations/${destination._id}`)
}));

router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Destination.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted destination')
    res.redirect('/destinations');
}));

module.exports = router;