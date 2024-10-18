const mongoose = require('mongoose');
const destinationsData = require('./destinationsData');
const Destination = require('../models/destination');
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

mongoose.connect(process.env.DB_URL);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});


const seedDB = async () => {
    await Destination.deleteMany({});
    for (let i = 0; i < destinationsData.length; i++) {
        const price = Math.floor(Math.random() * 7000) + 599;
        const destination = new Destination({
            author: '670f700eef2a9cfbe9d197c3',
            location: `${destinationsData[i].address}`,
            title: `${destinationsData[i].title}`,
            description: `${destinationsData[i].description}`,
            price: price,
            geometry: {
                type: "Point",
                coordinates: [
                    destinationsData[i].longitude,
                    destinationsData[i].latitude
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/demq7ecpn/image/upload/v1708786247/cld-sample-2.jpg',
                    filename: 'cld-sample-2.jpg'
                },
                {
                    url: 'https://res.cloudinary.com/demq7ecpn/image/upload/v1708786249/cld-sample-5.jpg',
                    filename: 'cld-sample-5.jpg'
                }
                // They are sample images from cloudinary. While updating the code with cloudinary, we want to make use of the uploaded images properties (provided by cloudinary) so that we can access the images to perform CRUD operations. 
            ]
        })
        await destination.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})

// See at the production level, seeding of data happens only once during the deployment of our website. But in testing, we will seed the data everytime we run the server. Before running 'node index.js' we will run node seeds/index.js to seed the data and close the server (above line automatically does that for us). You could also see that we have this line of code "Destination.deleteMany({});". What we are trying to achieve is everytime we seed the data we don't want any existing data in the database so that our test environment is always the same.

// Random number generation:
// Why we have a function to generate random numbers and a separate variable that also stores a random number? Why can' we just use one?
// With respect to title we need to have different combinations. Like 'forest flats', 'forest village', etc. When we use a variable, both descriptor and the place will be same always. Like forest will always be associated with flats and nothing else. 
// But that is not the case with respct to city and state. A particular city cannot be from different states. It has to be from the same state always.