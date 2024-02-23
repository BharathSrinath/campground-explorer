const { campgroundSchema, reviewSchema } = require('./schemas.js');
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground');
const Review = require('./models/review');

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
          // When not authenticated, we are trying to remember from where we were redirected to the login page and once logged-in we will again send the user to that particular url. Here we are just storing the value into session under a name called returnTo.
    // This value will be first accessed at the login page (routes/users.js). Please visit there for further clarification. 
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
}
// isLogged will be added as a middlware in every request where teh CRUD operations are allowed to perform like adding, updating, deleting campgrounds and reviews.
// isAuthenticated()
    // isAuthenticated is a passport method which is added to the req object. 
    // Without the above line, our check for authentication will still wortk absolutely fine. But, lets say that you are trying to edit a campground without being logged-in. When you click the edit button, you will be redirected to the login page right? Now when you login you will be redirected to the campgrounds page (ofcourse based on our code). But in this scenario we want to directly be redirected to the edit page of that particular campground which we have clicked before logging-in. This gives the better user experience. 
    // To achieve this we are accessing a property called orginalUrl within req object.
    // When you console.log req.path and req.originalUrl, you will see that path is relative and url represents the entire path.
        // If you log req.path for the URL www.example.com/products/new, the output will be /new.
        // If you log req.originalUrl for the URL www.example.com/products/new, the output will be www.example.com/products/new.
    // So we are using the originalUrl

module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}
// storeReturnTo()
    // This function didn't exist in the first place. But owing to passport.js update we have to incorporate this.
    // When user successfully login, the new update clears the session which wipes out session.returnTo information also (on which we are relying to redirect the user upon log-in)

module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}
// isAuthor will run only after isLoggedIn is checked. 
// Eventhough the edit and delete buttons are hidden, we need to protect the route itself (so that nobody could directly go to edit or delete route)
// If the user who is trying to edit/delete the campground is not the author of the campground, we will flash the above message and redirect them to the campgrounds show page. 

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}
// Same as isAuthor. 

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}



