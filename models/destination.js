const mongoose = require('mongoose');
const Review = require('./review')
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});

const opts = { 
    toJSON: { virtuals: true },
    timestamps: true
};

const DestinationSchema = new Schema({
    title: String,
    images: [ImageSchema],
   // In a GeoJSON object, a Point represents a single geographic position or location on the Earth's surface. It is defined using latitude and longitude coordinates in a GeoJSON format, following a specific structure.
    // The GeoJSON object for a point consists of a type and coordinates property:
    // Below is the way by which the geoJSON types are set. (Just know the pattern)
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
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
}, opts);


// Whenever a destination is deleted, we need to delete the reviews asscoiated with it too. So whenever a destination is deleted using 'findByIdAndDelete', 'findOneAndDelete' will be triggered. 
// Most challenging prospect about mongoose is that, name of the CRUD operation is not similar to the name of the hook/middlware.
// https://mongoosejs.com/docs/middleware.html
    
DestinationSchema.post('findOneAndDelete', async function (doc) {
    // When findOneAndDelete is triggered, delete destination will be passed as an argument to the async(). If successfully deleted, if condition will be true and we will delete all the reviews under that destination which was deleted.
    if (doc) {
        await Review.deleteMany({ _id: { $in: doc.reviews } })
        // Here _id refers to every review that exists in our database (of all the destinations). So we are checking and deleting the reviews if they are present in the deleted destination.  
    }
})

DestinationSchema.virtual('properties.popUpMarkup').get(function() {
    return `<a href="/destinations/${this._id}" style="text-decoration: none; font-weight: bold; color: black">${this.title}</a>`;
})

module.exports = mongoose.model('Destination', DestinationSchema);

// About different usage of id syntax:
// In MongoDB, the unique identifier for each document is automatically named _id. So when we're working directly with the database or Mongoose, we will use _id to refer to the document’s identifier.
// On the other hand, when we are working with Express routes and middleware, id is just a parameter name that we have chosen in our route definition. 