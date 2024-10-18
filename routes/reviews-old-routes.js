const express = require('express');
const router = express.Router({ mergeParams: true });
// IMPORTANT: express-router generally keeps the parameters separate. Our review routes need a destination id to create a review so that that particular review can be associated with a particular destination. Since express-router keeps the params separate we, the review will not have access to that id unless we specify "mergerParams: true" 
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');
const Destination = require('../models/destination');
const Review = require('../models/review');
const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');

router.post('/', isLoggedIn, validateReview, catchAsync(async (req, res) => {
    const destination = await Destination.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    destination.reviews.push(review);
    await review.save();
    await destination.save();
    req.flash('success', 'Submitted your review!');
    res.redirect(`/destinations/${destination._id}`);
}))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Destination.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review')
    res.redirect(`/destinations/${id}`);
}))

module.exports = router;