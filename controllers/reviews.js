const Destination = require('../models/destination');
const Review = require('../models/review');
const dayjs = require('dayjs');
const relativeTime = require('dayjs/plugin/relativeTime');
dayjs.extend(relativeTime);

module.exports.createReview = async (req, res) => {
    const destination = await Destination.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if(!destination){
        req.flash('error', 'Destination not available');
        return res.redirect("/destinations");
    }
    const existingReview = destination.reviews.find((review) => {
        return review.author.equals(req.user._id)
    });
    if (existingReview) {
        req.flash('error', 'You have already submitted a review for this destination!');
        return res.redirect(`/destinations/${destination._id}`);
    }
    const review = new Review(req.body.review);
    review.author = req.user._id;
    destination.reviews.push(review);
    await review.save();
    await destination.save();
    req.flash('success', 'Submitted your review!');
    res.redirect(`/destinations/${destination._id}`);
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Destination.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review')
    res.redirect(`/destinations/${id}`);
}

module.exports.renderEditReview = async (req, res) => {
    const { id, reviewId } = req.params;
    const destination = await Destination.findById(id);
    const review = await Review.findById(reviewId);
    if (!review) {
        req.flash('error', 'Cannot find the review');
        return res.redirect(`/destinations/${id}`);
    }
    res.render('destinations/editReview', { destination, review });
};

module.exports.updateReview = async (req, res) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to edit this review.');
        return res.redirect(`/destinations/${id}`);
    }
    review.body = req.body.review.body; 
    review.rating = req.body.review.rating; 
    await review.save();
    req.flash('success', 'Review updated successfully!');
    res.redirect(`/destinations/${id}`);
};