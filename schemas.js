const Joi = require('joi');

module.exports.campgroundSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required(),
        price: Joi.number().required().min(0),
        image: Joi.string().required(),
        location: Joi.string().required(),
        description: Joi.string().required()
    }).required()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required()
    }).required()
})

// There are two types of validation - Client side and server side
// "required" attribute in the form (of many .ejs files) deals with client side validation. When used, a user cannot get to the next page without entering those datas. But when someone uses a tool like postman, they can send a request without entering those details. 
// Now as a developer our code would be based on the input given by the user. When that input is not available, our entire code will break.
// To avoid this we need server-side validation. To achieve this we are using a library called 'joi'.
    // https://joi.dev/api/?v=17.12.0#introduction