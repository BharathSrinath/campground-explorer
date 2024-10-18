// index-old.js has the contents before restructuring the routes with express router.
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const mongoSanitize = require('express-mongo-sanitize');
const helmet =  require('helmet');
const MongoStore = require('connect-mongo');

const ExpressError = require('./utils/ExpressError');
const User = require('./models/user');

const userRoutes = require('./routes/users');
const destinationRoutes = require('./routes/destinations');
const reviewRoutes = require('./routes/reviews');

mongoose.connect(process.env.DB_URL);

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
app.use(mongoSanitize());

// Kindly refer mongoDB notes
const store = MongoStore.create({
    mongoUrl: process.env.DB_URL,
    touchAfter: 24 * 60 * 60,
    // We are saying to the session be updated only one time in a period of 24 hours, does not matter how many request's are made (with the exception of those that change something on the session data)
    crypto: {
        secret: 'destinationDiaries2024'
    }
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})

const sessionConfig = {
    store: store,
    name: 'ddUser',
    secret: 'destinationDiaries2024',
    // This is the secret key used to sign the session ID cookie. The session ID is stored on the client-side in a cookie, and this secret is used to hash the session ID. This ensures that even if someone intercepts the session ID, they cannot modify it because they don't know the secret key used to sign it.
    resave: false,
    // This option controls whether the session should be saved back to the session store, even if it hasn't been modified during the request.
    saveUninitialized: true,
    // This option controls whether to save a session that is new but hasn't been modified yet (i.e., it hasn't been given any data).
    cookie: {
        httpOnly: true,
        // The httpOnly property, when set to true, ensures that the cookie can only be accessed via HTTP requests and cannot be accessed by client-side JavaScript running in the browser. This helps mitigate certain types of security vulnerabilities, such as cross-site scripting (XSS) attacks. I have attached cookie.js file just to understand how the details of a cookie can be retrieved using a JS code. When you type this code in console, the values can be accessed. 
        // Now a days, most of the frameworks set the default value of httpOnly : true.
        // secure: true means Cookie is accessible only with https. (In development (localhost) or when using http, the cookie cannot accessed)
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        // Date.now() is in milliseconds. We are adding an expiry of 1 week in ms
        
        maxAge: 1000 * 60 * 60 * 24 * 7
        // same as expiration (1 week)
    }
    // Also without specifying the cookie property, the session library will use default cookie settings. Typically, this means the cookie will be created with default values that are often browser-dependent. By default, if the cookie property is not set, the session cookie is usually a "session cookie," meaning it will expire when the browser session ends.
}

app.use(session(sessionConfig))
app.use(flash());
app.use(helmet());

const scriptSrcUrls = [
    "https://cdn.jsdelivr.net/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://cdn.jsdelivr.net/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/demq7ecpn/", //demq7ecpn is my cloudinary name 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

// Incorporating passport
// Just remember these steps
// Here passport.session() will just take care of session with only respect to authetication
app.use(passport.initialize());
app.use(passport.session()); // passport.session should always come after express-sessions  
passport.use(new LocalStrategy(User.authenticate()));
// What we are saying is that, we are using the strategy called local strategy for which the authenticaiton method is located in our User model which is called as authenticate (a method inbuilt within passport-local-mongoose). 

// Serialization is the process of converting the user object into a format that can be stored in the session.
// Deserialization is the process of reconstructing the user object from the stored session data. 
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// During authentication, Passport.js serializes the user object into the session, and for subsequent requests, it deserializes the user object based on the session data, allowing access to the authenticated user's information.

app.use((req, res, next) => {
    if(!['/login', '/'].includes(req.originalUrl)){
        req.session.returnTo = req.originalUrl;
    }
    // if we are coming from login to the login (clicking the login page by being in the login page) or coming to login page from the home page, we dont want to set that particular Url to returnTo value. Just imagine what will happen if you do so.
        // From home page, when someone logs-in we want them to show the list of all the destinations. Showing the home page again is not a good user experience.
        // Also when the user directly clicks the login link in the nav-bar to login, that route will get stored in the originalUrl and we will send them to log-in page again even after logging-in. 
    // The includes() method is used to determine if a specified value exists in an array or string.
    // In this case, it checks if req.originalUrl matches either '/login' or '/'. if it doesn't match, the condition evaluates to true.
    // You may wonder, we still have the session.returnTo here. Because we still haven't logged-in until this point. So the session exists. (passports new update will wipe away session data after successful login)
    res.locals.currentUser = req.user;
    // The above can be used for many things. We have initially set this up to know whether we are logged-in or not. If so, we will just display the logout in navbar. If not we will display login and register. Refer how this information has been used in views/partials/navbar.ejs
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


app.use('/', userRoutes);
app.use('/destinations', destinationRoutes)
app.use('/destinations/:id/reviews', reviewRoutes)


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

// Working of Passport
    // 1. passport.initialize()
        // When you call passport.initialize(), it returns a function that attaches some necessary properties to the req (request) object. For example, it attaches req._passport, which contains information about the strategies and session used by Passport.
        // This function is then passed to app.use() so that every incoming request passes through this middleware, ensuring that Passport is ready to handle authentication tasks.
    // 2. passport.session()
        // It integrates Passport with Express's session management, allowing Passport to deserialize the user from the session on every request.
        // When a user logs in, Passport serializes user information (often just the user ID) and stores it in the session.
        // On subsequent requests, passport.session() checks if the user information is stored in the session. If it is, Passport calls the deserialization function to load the full user object back into req.user.
        // This middleware relies on express-session, which is a separate library that handles the session storage.
    // 3. passport.use(new LocalStrategy(User.authenticate())):
        // Strategies are at the core of Passport. They define how authentication is handled i.e., a specific way to authenticate a user.
        // Each strategy in Passport is essentially a class that implements an authentication algorithm.
        // 'passport-strategy' is the base class, which all strategies inherit from. This base class provides methods like authenticate(), which must be overridden by each strategy that inherits. In our case we use local strategy. Hence it has to over-ride the authenticate() method.
            // Mind you we have separately installed passport-local. Based on the strategy that we want to use we have to instal that. 
            // Also, authenticate is not written by us. Each strategy has their own authenticate method that will over-ride the base class's authenticate method.
        // When passport.authenticate() is called, Passport looks up the strategy by name (e.g., "local") and calls its authenticate() method. 
        // The authenticate() method then executes the logic defined in your verification callback (User.authenticate()), which checks the credentials and returns the user object if successful.
            // The LocalStrategy constructor actually takes a 'verification callback' as an argument. That is User.authenticate() callback is where you define how to authenticate the user (e.g., checking the username and password against a database). It is not written by us. It is provided by 'passport-local-mongoose' which we have installed it as a separate package.  
        // When a user attempts to log in, the LocalStrategy extracts the username and password from the request and passes them to the verification callback. If the callback calls done(null, user), Passport considers the authentication successful and proceeds to serialize the user.
    // 4. passport.serializeUser():
        // When a user is authenticated, Passport needs to store some user information in the session. This is where serialization comes in. You decide what user data you want to store in the session (often just the user ID).
        // The serializeUser() method defines how the user object is turned into a piece of information that can be stored in the session.
            // Serialization in Passport.js is the process of converting the user object into a format that can be stored in the session. This is essential because storing an entire user object in the session is inefficient. Instead, you store a unique identifier (like the user's ID).
        // Passport stores this serialized user information in the session under the req.session.passport.user property.
    // 5. passport.deserializeUser():
        // When a request is made, Passport needs to load the user object back into req.user. Deserialization is the process of turning the serialized data from the session back into the full user object.
        // he deserializeUser() method defines how the serialized user ID from the session is converted back into the full user object.
        // Passport calls this method on every request that requires user information. It usually involves looking up the user in the database by ID.

// Comparing passport.js with user handled sessions for authentication.
// ------------------------------------------------------------------------------------------------
// | Aspect           | Developer-Handled Sessions            | Passport.js                       |
// |------------------|---------------------------------------|-----------------------------------|
// | Session          | // Initialize session                 | // Initialize Passport            |
// | Management       | req.session.userId =  user.id;        | app.use(passport.initialize());   |
// |                  |                                       | app.use(passport.session());      |
// |------------------|---------------------------------------|-----------------------------------|
// | User Login       | // Fetch user from DB                 | // Use Passport's Local Strategy  |
// | Request Handling | const user = await                    | passport.authenticate('local',    |
// |                  | db.getUserByUsername(                 |  { ... })(req, res, next);        |
// |                  | req.body.username);                   | 'local', { ... })(req,            |
// |------------------|---------------------------------------|-----------------------------------|
// | Password         | // Manually verify password           | // Passport verifies via          |
// | Verification     | const isMatch = await bcrypt.compare( | strategy callback                 |
// |                  | req.body.password, user.passwordHash);| passport.use(new LocalStrategy(   |
// |                  |                                       | User.authenticate()));            |
// |------------------|---------------------------------------|-----------------------------------|
// | User Session     | // Store user ID in session           | // Passport handles session       |
// | Storage          | req.session.userId = user.id;         | automatically                     |
// |                  |                                       | passport.serializeUser(           |
// |                  |                                       | User.serializeUser());            |
// |------------------|---------------------------------------|-----------------------------------|
// | Error            | // Custom error handling              | // Use Passport's built-in        |
// | Handling         | if (!user) { res.status(401)          | error handling                    |
// |                  |   .send('Authentication failed');     | passport.authenticate(            |
// |                  |                                       | 'local', { ... })(req, res, next);|
// ------------------------------------------------------------------------------------------------
