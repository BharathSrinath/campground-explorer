// index-old.js has the contents before restructuring the routes with express router.

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');


const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

mongoose.connect('mongodb://localhost:27017/yelp-camp');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')))

const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // The httpOnly property, when set to true, ensures that the cookie can only be accessed via HTTP requests and cannot be accessed by client-side JavaScript running in the browser. This helps mitigate certain types of security vulnerabilities, such as cross-site scripting (XSS) attacks. I have attached cookie.js file just to understand how the details of a cookie can be retrieved using a JS code. When you type this code in console, the values can be accessed. 
        // Now a days, most of the frameworks set the default value of httpOnly : true.

        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        // Date.now() is in milliseconds. We are adding an expiry of 1 week in ms
        
        maxAge: 1000 * 60 * 60 * 24 * 7
        // same as expiration (1 week)
    }
}

app.use(session(sessionConfig))
app.use(flash());

// Incorporating passport
// Just remember these steps
// Here passport.session() will just take care of session with only respect to authetication
app.use(passport.initialize());
app.use(passport.session()); // passport.session should always come aftr express-sessions  
passport.use(new LocalStrategy(User.authenticate()));
// What we are saying is that, we are using the strategy called local strategy for which the authenticaiton method is located in out User model which is called as autheticate (a method inbuilt within passport-local-mongoose). 

// Serialization is the process of converting the user object into a format that can be stored in the session.
// Deserialization is the process of reconstructing the user object from the stored session data. 
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// During authentication, Passport.js serializes the user object into the session, and for subsequent requests, it deserializes the user object based on the session data, allowing access to the authenticated user's information.

app.use((req, res, next) => {
    if(!['/login', '/'].includes(req.originalUrl)){
        req.session.returnTo = req.originalUrl;
    }
    // if we are coming from login to the login (clicking the login page by being in the login page) or coming to login page from the home page, we dont want the to set that particular Url to returnTo value. Just imagine what will happen if you do so.
        // From home page, when someone logs-in we want them to show the list of all the campgrounds. Showing the home page again is not a good user experience.
        // Also when the user directly clicks the login link in the nav-bar to login, that route will get stored in the originalUrl and we will send them to log-in page again even after logging-in. 
    // The includes() method is used to determine if a specified value exists in an array or string.
    // In this case, it checks if req.originalUrl matches either '/login' or '/'. if it doesn't match, the condition evaluates to true.
    // You may wonder, we still have the session.returnTo here. Because we have still haven't logged-in until this point. So the session exists.
    res.locals.currentUser = req.user;
    // The above can be use for many things. We have initially set this up to know whether we are logged-in or not. If so, we will just display the logout in navbar. If not we will display login and register. Refer how this information has been used in views/partials/navbar.ejs
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)


app.get('/', (req, res) => {
    res.render('home')
});


app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})

app.listen(3000, () => {
    console.log('Serving on port 3000')
})


