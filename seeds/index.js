const mongoose = require ("mongoose");
// import array of cities 
const cities = require("./cities");
//import places and descriptors
const {places, descriptors} = require("./seedHelpers");
//require Campground model
const Campground = require("../models/campground");

//connect with mongoose to mongo and set name of the db
mongoose.connect("mongodb://localhost:27017/yelp-camp", {
    useNewUrlParser: true,
    useCreateIndex:true,
    useUnifiedTopology: true
});

//check connection to mongo db and handle errors
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database Connected");
});

//f to pick a random item from array
const sample = array => array[Math.floor(Math.random() * array.length)];

//f to delete everything from db and seed it
const seedDB = async () => {
    //delete everything
    await Campground.deleteMany({});
    for(let i=0; i<300; i++){
        //create a random number untill 1000
        const random1000 = Math.floor(Math.random() * 1000);
        //create random price:
        const price = Math.floor(Math.random() * 20) + 10;
        //pick city and state from random city from cities array + pick random descriptor and place from seedHelpers
        const camp = new Campground({
            //MY user id (username: tom, password: tom)
            author: "60a6c9ea296a4f1458684c38",
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Reprehenderit nam architecto modi, doloremque voluptas nemo ipsam illo dolores odit sunt. Quisquam voluptas velit nesciunt assumenda quam iste illo nobis dolore!",
            price,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },
            images: [
                {
                  url: 'https://res.cloudinary.com/dtirk48he/image/upload/v1623746855/YelpCamp/cjilz9bdksqdgowbglru.jpg',
                  filename: 'YelpCamp/cjilz9bdksqdgowbglru'
                },
                {
                  url: 'https://res.cloudinary.com/dtirk48he/image/upload/v1623746854/YelpCamp/lddfddrvgvsknnyhzu3z.jpg',
                  filename: 'YelpCamp/lddfddrvgvsknnyhzu3z'
                }
              ]             
        })
        await camp.save();
    }
}
//call f and it will return a promise
seedDB().then(() => {
    //after saving it will vlose in our terminal
    mongoose.connection.close();
})

