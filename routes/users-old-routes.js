const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const { storeReturnTo } = require('../middleware');

router.get('/register', (req, res) => {
    res.render('users/register');
});

router.post('/register', catchAsync(async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        // register() is offered my passport.
        // Now once registered we dont want to request the user to login immediately after they register as it is not a good user experience. To achieve the passport offers a method called login which is availabel to the req object.
        req.login(registeredUser, err => {
            // This is a syntax given by passport. So we have to make use of exactly as it is. Because we are not exactly sure how there is a possibility of an error occurinh here. But still we have to go with this.
            if (err) return next(err);
            req.flash('success', 'Welcome to Yelp Camp!');
            res.redirect('/campgrounds');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
}));

router.get('/login', (req, res) => {
    res.render('users/login');
})

router.post('/login', storeReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    // Here, when the credentials are wrong we are specifying what to do. Obviously that is going to happen only in the login page.
    // first argument is strategy name and second argument is an object within we specify what to do.
    // We are asking it to flash an inbuilt failure message due unsuccessful login and the redirecting it to the login page itself.
    req.flash('success', 'welcome back!');
    const redirectUrl = res.locals.returnTo || '/campgrounds';
    // We are coming from middleware.js. Now we may have a returnTo value or we may not. Lets look at the scenarios.
    // If we try to edit a campground without being logged-in, we will be redirected to login page. So whenever we are redirected to a login page, returnTo will have a value. 
    // But when a user directly clicks the login, the authentication check (in middlware.js) will not happen in the first place. So in this scenario, returnTo will be empty. In that scenario, we are sending them to /campgrounds.
    // Initially we had 'res.session.returnTo' instead of 'locals' Since the session is cleared by passport update upon successful authentication, we have stored that in res.locals.returnTo under storeReturnTo() which is now passed before authenticate().
    delete req.session.returnTo;
    // We dont want that url information anymore. So just clearning that.
    res.redirect(redirectUrl);
})

router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        // Previously it was just logout() and thats it. But after passport's update, logout requires a callback() to handle errors.
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
});

module.exports = router;