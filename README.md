Create a new folder and cd git bash to that path of the folder

npm install express mongoose ejs method-override express-router express-session joi connect-flash

setup the basic code in index.js
create seeds folder and setup the basic required data
create schema and models in models folder

come back to index.js and start creating routes and the corresponding pages to display when they render
routes. First npm i method-override for POST requests.
    1. '/' - home 
    2. '/campgrounds', - index 
    3. '/campgrounds/new' - new
    4. '/campgrounds/:id' - show
    5. '/campgrounds/:id/edit' - edit

Styling:
npm i ejs-mate
require that and update app.engine
cleanup the template codes in .ejs files by creating a layout folder within which we will have biolerplate.ejs
So now if we want to anything that is common to all the pages, we can do it in biolerplate.ejs (Example: navbar)
add bootsrap link in boilerplate.ejs
Now copy and paste the respective stylings from bootstrap and edit it based on our needs.
In some places we have used grid system. I hope you remember that with grid system in bootstrap,  the unit of measurement is divided into 12 equal parts, which are referred to as columns. This means that the width of each column is expressed as a fraction of the total width available in the grid system, with the entire width being divided into 12 parts.

Repeat everything for review model

Incorporate error handling

Add cookies, sessions and flash

Now restructure the code using express-router 

Now add authentication
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
    # It isn't something. We already have model and views. Now we will just add controller folder.
    # We have already restructured the routes using express-router. Now we will further restructure by moving all the logic under routes to controller folder.
    # Now this can be further simplified with router.route where you can group the similar paths route but different http routes. 
        # Ex: router.route('/')
                    .get(catchAsync(campgrounds.index))
                    .post(isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground))
            # here both has the path of '/'
    # But while grouping make sure that the change of orders doesn't affect the code.

# Star rating:
    # We can make use of entity code (HTML basics - They are special symbols which are represented by characters). Filled star - &#9733; and an empty star - &#9734;
    # But they are not good for accessibility. Imagine the screen reader reading the above symbols.
    # We are just going to include a starability.css file  