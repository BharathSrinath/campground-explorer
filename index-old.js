// Before restructuring with express-router

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const { destinationSchema, reviewSchema } = require('./schemas.js');
const catchAsync = require('./utils/catchAsync.js');
const ExpressError = require('./utils/ExpressError.js');
const methodOverride = require('method-override');
const Destination = require('./models/destination.js');
const Review = require('./models/review.js');

mongoose.connect('mongodb://localhost:27017/destinationDiaries');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

// mongoose.connect vs mongoose.connection
// mongoose.connect
    // mongoose.connect establishs a connection between Node.js application and a MongoDB database.
    // mongoose.connect is the entry point for establishing a connection.
    // It returns a promise that resolves when the connection is successful or rejects if there’s an error.
// mongoose.connection
    // mongoose.connection represents the active connection to the MongoDB server.
    // Unlike mongoose.connect that will throw an error/success message as configured by us when the server runs initially, mongoose.connection will thrown an error message as configured by us when the server is disconnected. (success message is required only at the initial stage)
    // To achieve this we are explictly using some eventhandlers. 'error' and 'open' are the events. 
// We cannot use 'addEventListener' because they are event listeners for DOM elements. But in Node.js, which is a server-side JS environment, the addEventListener method is not available because there is no DOM to interact with. 
// Node.js provides an EventEmmitter class, which allows objects to emit named events that cause functions ("listeners") to be called. Mongoose, being a MongoDB library for Node.js, uses this event-driven architecture to handle events such as connection errors, successful connections, etc.

// .bind(): Look below for detailed explanation

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// validating destination
const validateDestination = (req, res, next) => {
    const { error } = destinationSchema.validate(req.body);
    // Here the req.body means the body of the request that the client is making to the server. When the request is unsuccessful, we are destructuring the error property and writing logic based on that.
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        // In our destination Schema we have many fields that are made mandatory. Under error we have property called details. Detail properties will present under every place where the criteria is not met. It will have message regarding what went wrong. We are iterating over all of them and joning all the messages togther to display it on the screen. 
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

// validating review
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

// home page
app.get('/', (req, res) => {
    res.render('home')
});

// All destinations list
app.get('/destinations', async (req, res) => {
    const destinations = await Destination.find({});
    res.render('destinations/index', { destinations })
});

// Creating a new destination - user input
app.get('/destinations/new', (req, res) => {
    res.render('destinations/new');
})

// Creating a new destination - user sending request
app.post('/destinations', validateDestination, catchAsync(async (req, res, next) => {
    // if catch Async catches an error, next function will pass it to the next erro-handling middleware which is at the bottom
    const destination = new Destination(req.body.destination);
    await destination.save();
    res.redirect(`/destinations/${destination._id}`)
}))

// Shows the respective destination page when the user clicks on the destination
app.get('/destinations/:id', catchAsync(async (req, res,) => {
    const destination = await Destination.findById(req.params.id).populate('reviews');
    res.render('destinations/show', { destination });
}));

// Brings up the edit form with pre-populated values
app.get('/destinations/:id/editForm', catchAsync(async (req, res) => {
    const destination = await Destination.findById(req.params.id)
    res.render('destinations/editForm', { destination });
}))

// Post the edit form with updated values
app.put('/destinations/:id', validateDestination, catchAsync(async (req, res) => {
    const { id } = req.params;
    const destination = await Destination.findByIdAndUpdate(id, { ...req.body.destination });
    // In .ejs files, within forms we have given names as destination[location], destination[title], etc. We have never done that in the past. This is a way to structure the data being sent as an object. When the form is submitted, the data will be sent as an object named destination with properties title and location. So here we are using spread operator to expand that object and pass the updated values. This can be particularly useful when you’re dealing with a lot of form data, as it allows you to group related data together.
    res.redirect(`/destinations/${destination._id}`)
}));

// Deleting a destination
app.delete('/destinations/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Destination.findByIdAndDelete(id);
    res.redirect('/destinations');
}));

// Posting a review 
app.post('/destinations/:id/reviews', validateReview, catchAsync(async (req, res) => {
    const destination = await Destination.findById(req.params.id);
    const review = new Review(req.body.review);
    destination.reviews.push(review);
    await review.save();
    await destination.save();
    res.redirect(`/destinations/${destination._id}`);
}))

// Deleting a review
app.delete('/destinations/:id/reviews/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Destination.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
        // See review is in 2 places actually. At one place we have the actual reference. In another place we have the reference of that review. While the below line deletes the former, above line deletes the latter.
        // We have seen set operator already. But this is new. First argument is the id that we are trying to find (destination id) and then pull operator will look into reviews (which is an array by the way) to pull the reviewId out of it. (Here pull basically means to delete it)
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/destinations/${id}`);
}))
 
// .all('*') is similar to .use() interms of functionality. * means wildcard which means all the requests in this scenario (get, post, put, patch, delete, etc.). app.use() is like applying a rule to every case, while app.all('*') is like the default case that catches anything that hasn’t been caught by the specific cases. So the order of app.all(*) matters a lot. You have to place only after all the routes that are defined for the user to navigate.

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


// Note: While trying to understand bind(), I also came across call() and apply() all 3 of which are related together. Hence will take a look at all of them.
// All three of them involves a concept called function borrowing and all three methods allow you to control what the 'this' keyword refers to when invoking a function.
// They basically bind the function and the object with small differences between each of them
// They are called on the function with which we are going to bind the object. First argument to all of them refers to that object. 
    // For call, 2nd, 3rd, etc. are the arguments that we are passing to the function.
    // For apply, exactly same as call but there will be only one argument and that will be an array within which we can pass as many elements as we want.
    // For bind, it is similar to the call method in terms of passing an argument. But it differs from one aspect compared to the above two. While call and apply method is invoked/called directly (we dont need to separately call them like a normal function), bind method returns a copy of a function that binds the function and object. This function copy can be stored in a variable and invoked later. This is what we are doing when we pass them to an event handler. So rather than creating a new function everytime (like call/apply), we are just invoking this copy created by bind function. (so no new functions created). 
        // Neither call() nor apply() creates a new function. They directly execute the original function.
        // Unlike call() and apply(), bind() does not immediately invoke the function. Instead, it returns a new function. The new function can be called later, maintaining the specified context. Use bind() when you want to create a reusable function with a specific context.
        // When we use the bind() method in JS, it creates a new function called 'bound function' that is permanently bound to a particular object.
            // This bound function is created only once during initialization and then reused every time an error occurs (in our case). The key point is that the binding (association with the console object) happens once, not repeatedly for each error event.


// Lets look at the below example

        // let name = {
        //     firstName: 'Bharath',
        //     lastName: 'Srinath'
        // }

        // let printFullName = function(hometown, state){
        //     console.log(this.firstName + '' + this.lastName + " from " + hometown + ", " + state);
        // }

        // printFullName.call(name, 'Chennai', 'TamilNadu');

        // let name2 = {
        //     firstName: 'Aravind',
        //     lastName: 'Sundaresan'
        // }

        // printFullName.call(name2, 'Madurai', 'TamilNadu');
        // printFullName.apply(name2, ['Madurai', 'TamilNadu']);

        // let printMyName = printFullName.bind(name, 'Bharath', 'TamilNadu');
        // console.log(printMyName);
        // console.log(printMyName());

// Now lets look at our code - db.on("error", console.error.bind(console, "connection error:"));
    // Here console.error is the function with which we are going to bind an object called console.
    // "connection error:" is a string argument that will be passed to console.error function. 
    // First argument that we pass to the bind method is an object. This object is what 'this' keyword will refer to. But in our scenario, console.error doesn't have any 'this' keyword usage at all. But for better consistency of writing the code we are passing the console object which is the actual object under which "error" property is present. 
        // What you have to understand is in our scenario we are not using bind for associating 'this' keyword to an object. Rather we are using it for efficiency purpose as bound function is created once and recalled eveytime when an error occurs. 
    // We could have also used db.on("error", () => console.error("connection error:")); This would indeed work just as above. But there is an inefficiency aspect to it.
        // Whenever an "error" event is triggered, we will be creating a new anonymous function.
    // But when we use .bind(), we create a new function (called preset function) based on an existing function (in this case, console.error).
    // The new function is pre-set with specific arguments (such as the error message “connection error:”).
    // This pre-set function is stored and can be invoked later without re-creating it.
    // when the “error” event occurs (e.g., due to a database connection issue): 
        // The pre-set function (created by .bind()) is invoked directly.
        // It’s as if we called console.error("connection error:") directly.
        // The error message “connection error:” is logged to the console.
    // We create the pre-set function only once (usually during initialization). Later, when the event happens, we reuse this pre-set function. No additional function creation occurs during each event.