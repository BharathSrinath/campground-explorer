const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp');

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '65d4944abe32dc41894defab',
            // for all the campgrounds this person (tom) will be the author. 
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: 'https://source.unsplash.com/collection/483251',
            // This is an unsplash resource where everytime you reload a new image will appear despite the URL being the same
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!',
            price
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})
// See at the production level, seeding of data happens only once during the deployment of our website. But in testing, we will seed the data everytime we run the server. Before running 'node index.js' we will run node seeds/index.js to seed the data and close the server (above line automatically does that for us). You could also see that we have this line of code "Campground.deleteMany({});". What we are trying to achieve is everytime we seed the data we don't want any existing data in the database so that our test environment is always the same.

// Random number generation:
// Why we have a function to generate random numbers and a separate variable that also stores a random number? Why can' we just use one?
// With respect to title we need different combinations. Like 'forest flats', 'forest village', etc. When we use a variable, both descriptor and the place will be same always. Like forest will always be associated with flats and nothing else. 
// But that is not the case with respct to cit and state. A particular cannot be different states. It has to be from the same state always.