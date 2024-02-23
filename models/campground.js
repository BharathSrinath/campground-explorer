const mongoose = require('mongoose');
const Review = require('./review')
const Schema = mongoose.Schema;

const CampgroundSchema = new Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

// Whenever a campground is deleted, we need to delete the reviews asscoiated with it too. So whenever a campground is deleted using 'findByIdAndDelete', 'findOneAndDelete' will be triggered. 
// Most challenging prospect about mongoose is that, name of the CRUD operation is not similar to the name of the hook/middlware.
// https://mongoosejs.com/docs/middleware.html
    
CampgroundSchema.post('findOneAndDelete', async function (doc) {
    // When findOneAndDelete is triggered, delete campground will be passed as an argument to the async(). If successfully deleted, if condition will be true and we will delete all the reviews under that campground which was deleted.
    if (doc) {
        await Review.deleteMany({ _id: { $in: doc.reviews } })
        // Here _id refers to every review that exists in our database (of all teh campgrounds). So we are checking and deleting the reviews if they are present in the deleted campground.  
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema);

// About different usage of id syntax:
// In MongoDB, the unique identifier for each document is automatically named _id. So when we're working directly with the database or Mongoose (which is a MongoDB object modeling tool), you’ll use _id to refer to the document’s identifier.
// On the other hand, when you’re working with Express routes and middleware, id is just a parameter name that you’ve chosen in your route definition 