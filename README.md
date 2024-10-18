# setup the basic code in index.js
    # require the libraries - express, mongoose, path, ejs-mate/react, ExpressError, method-override, (passport, passport-local, express-session and connect-flash) => if it involves authentication. 
    # Add basic routes (which are later restructured using express-router) and its corresponding pages for destinations.
        1. '/' - home 
        2. '/destinations', - index 
        3. '/destinations/new' - new
        4. '/destinations/:id' - show
        5. '/destinations/:id/editForm' - edit
        5. '/destinations/:id/editReview' - edit
        6. biolerplate.js will have the common elements like navbar, flash, footer and bootstrap links.
    # Similarly for users
        1. login.ejs
        2. register.ejs
    # A common error file called error.ejs

# create seeds folder and setup the basic required data
    # require mongoose and models
    # create schema and models in models folder

# create models:
    # require mongoose
    # create destinations, review and users models

# routes folder:
    # This is where you will have all the routes and validation but their definition exists elsewhere.

# controllers:
    # routes definition for destinations.js, reviews.js and users.js

# schema.js
    # For validations to work, we are using a library called joi. It provides a method called 'validate'.
    # So we will be setting up the schema for destinations and reviews here. For other validations we are using the normal logic (like comparing id's) or using passport (for authentication). 

# middlware.js
    # validations (isLoggedIn, isAuthor, validateDestination) definition
    # This definition will make use of validate method that is defined in schema.js

# client vs server-side validation:
    We have already used joi right? That is a server side validation. 'required' attribute in the form is the client side validaiton. To customise the client side validation (like for giving a wrong input or an empty input), we are adding a JS provided along with bootstrap form in validateForm.js under public/javascripts folder.

# views folder:
    # when request for a particulat route we have redirect to a particular page

# Incorporate error handling in routes
    # catchAsync - Incorporate with all of your routes
    # ExpressError - For every other route (that doesn't fall above), will have this error

# Add sessions and flash
    # npm i cookie-parser, express-seesion connect-flash
    # sessions config is added in the index.js and flash messages are defined in partials under views.
    # Restructure the code using express-router 

# Adding authentication
    # We have used a node library called passport.js rather than building it from scratch
    # passport takes care of login, logout, sessions for authentication (not all the sessions), hashing (pbkdf2 algorithm) and storing, etc.
    # npm i passport 
    # There are many strategies (libraries) that can be installed along with the requirements. We are installing passport-local and passport-local-mongoose. To install any such strategies we need passport installed first.

# Passport library:
    # passport-local: When you use passport-local, you’re authenticating users against credentials stored within your app (not external services like OAuth providers).
    # Passport-local-mongoose: It is a Mongoose plugin that simplifies local authentication specifically for Mongoose models. It adds fields like username, hash, and salt to your user model.

# Just remember to include these lines when you are using passport.js
    const passport = require('passport');
    const variableName = require('strategy-name');

    app.use(passport.initialize());
    app.use(passport.session());
    passport.use(new variableName(User.authenticate()));

    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());


# Restructuring using MVC architecture:
    # It isn't something new. We already have model and views. Now we will just add controller folder.
    # We have already restructured the routes using express-router. Now we will further restructure by moving all the logic under routes to controller folder.
    # Now this can be further simplified with router.route where you can group the similar paths route but different http routes. 
        # Ex: router.route('/')
                    .get(catchAsync(destinations.index))
                    .post(isLoggedIn, validateDestination, catchAsync(destinations.createDestination))
            # here both has the path of '/'
    # But while grouping make sure that the change of orders doesn't affect the code.

# Star rating:
    # We can make use of entity code (HTML basics - They are special symbols which are represented by characters). Filled star - &#9733; and an empty star - &#9734;
    # But they are not good for accessibility. Imagine the screen reader reading the above symbols.
    # We are just going to include a starability.css file under public/stylesheets folder

# Uploading images:
    # HTML forms will not be able to send files like images to the server. So we need to update our current form.
    # Also we have to store them. But we can't store them in Mongo. Because the BSON size limit is 16MB
    # We will be using a tool called cloudinary to store them.
    # cloudinary's configuration is made under cloudinary.js file. 
    # Working of cloudinary:
        # Once we submit the form, the image will be sent to cloudinary and it will send a response with a url of stored image.
        # We will use this url to perform CRUD operations.
    # Now we have to include an attribute in the form called as enctype = "multipart/form-data" which replaces the default url encoding. This data cannot be parsed on its own before submitting. To parse multipart/form-data we are going to use an external library called multer.

# multer:
    # To install: npm i multer
    # It adds a 'body' object and 'file/files' object to the req object. Here body will hold the value of the text fields of the form and file/files will hold the files uploaded via form.
    # https://github.com/expressjs/multer
    # middelwares: upload.single('name') for single file and upload.array('name', 12) for multiple files
    # Now we will install another package called multer-storage-cloudinary. The difference between both of them is Multer focuses on handling file uploads and storing them on the server's disk, multer-storage-cloudinary extends Multer's functionality by allowing direct uploads to Cloudinary. 
        # To use multer-storage-cloudinary, we need to install multer too.

# cloudinary transformation API: 
    # We are using this feature to shrink the image by appending the width to the url so that the shrunk image is displayed as a thumbnail when we are tryting to update the destination.

# dotenv:
    # There are varaibles that we can't put it inside the code (like password or key). We have to store them separately.
    # .env is the filename within which we will store the secrets and require them wherever we need with the help of dotenv package
        npm i dotenv
    # if (process.env.NODE_ENV !== "production") {
        require('dotenv').config();
        }
            This code says that when we are in development mode, we will require that dotenv file and configure them accordingly. If we are in production mode, we won't be storing them in a file like this.

# map:
    # To include maps, we are using a library called mapbox.  
    # When a user types a place, mapbox-sdk can convert it to lattitude and longitude (a process known as geocoding). 
        # mapbox also provides a way where we can do that manually. (Like we can write a code to fetch lat and long). Even for that we need mapbox. But mapbox-sdk (for node.js) can do that automatically for us.
            # https://github.com/mapbox/mapbox-sdk-js
            # https://github.com/mapbox/mapbox-sdk-js/blob/main/docs/services.md
    # Copy-paste the token in .env and npm i @mapbox/mapbox-sdk
    # We will be adding them in destination controllers as that is the place where we are creating them. Also require them at the top. There are many features in mapbox. We want to require only geocoding (specifically forward geocode). 
        # mapbox documentation says that "To create a service client, import the service's factory function from '@mapbox/mapbox-sdk/services/{service}' and provide it with your access token."
        # const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');