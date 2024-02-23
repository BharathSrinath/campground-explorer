const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);

// passportLocalMongoose
    // It extends your user schema (defined using Mongoose) with additional functionality related to local authentication.
    // Fields Added: Username, Hash and Salt
    // Methods Added: authenticate(), serializeUser(), deserializeUser(), register(user, password, cb), findByUsername() and createStrategy().