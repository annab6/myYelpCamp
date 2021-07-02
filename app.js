//access env variables
if(process.env.NODE_ENV !== "production"){
    require("dotenv").config();
}

const express = require("express");
const path = require("path");
const mongoose = require ("mongoose");
const ejsMate = require("ejs-mate"); 
const session = require("express-session");
const flash = require("connect-flash");
const ExpressError = require("./utils/ExpressError")
//to use PUT/PATCH/DELETE etc in HTML form we need this npm package
const methodOverrride = require("method-override");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const helmet = require("helmet");
const mongoSanitize = require('express-mongo-sanitize');
const userRoutes = require("./routes/users");
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");
const MongoDBStore = require('connect-mongo');

//connect with mongoose to mongo and set name of the db
const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/yelp-camp";

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex:true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

//check connection to mongo db and handle errors
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database Connected");
});

const app = express();

//use ejs-mate package
app.engine("ejs", ejsMate);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"))

//parse body(of req.body) to extract info from it (when sending form)
app.use(express.urlencoded({ extended: true }));
//use npm package method overrride
app.use(methodOverrride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(mongoSanitize({
    replaceWith: '_'
}));


const store = new MongoDBStore({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60
})

store.on("error", function(e){
    console.log("SESSION STORE ERROR", e)
})

const secret = process.env.SECRET || "thisshouldbeabettersecret!";

const sessionConfig = {
    store,
    name: "session",
    secret,
    resave: false,
    saveUninitialized: true,
    cookie:{
        httpOnly: true,
        // use only in production
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
//app.use(session has to be before passport.session)
app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());
// app.use(helmet({contentSecurityPolicy:false}));


//defining CSP for helmet. If I add some other source - need to add here links
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net"
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net"
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/"
];
const fontSrcUrls = [
    "https://cdn.jsdelivr.net"
];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dtirk48he/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


app.use(passport.initialize());
app.use(passport.session());
//telling passport to use LocalStrategy. The .authenticate() method for it is located on User model
passport.use((new LocalStrategy(User.authenticate())));

//how to serialize(store) users into the session
passport.serializeUser(User.serializeUser())
//how to unstore (deserialize) users from the session
passport.deserializeUser(User.deserializeUser())

//middleware to have access to messages on every request(if there is some message for action there)
app.use((req, res, next) => {
    //check from which page user came to login page
    if(!["/login", "/"].includes(req.originalUrl)) {
        //store the url that user requested
        req.session.returnTo = req.originalUrl;
    }
//have access to currrent user in all templates
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
})

// app.get("/fakeUser", async(req, res) => {
//     const user = new User({email: "aaannn@gmail.com", username: "ann"})
// //register(user, password) method registers new user instance with a given password. Checks if username is unique.
//     const newUser = await User.register(user, "1991");
//     res.send(newUser)
// })


app.use("/", userRoutes);
app.use("/campgrounds", campgroundRoutes)
app.use("/campgrounds/:id/reviews", reviewRoutes)



// // *******
// //route to delete reviews withut author
// app.get("/update", async(req, res) => {
//     // const allReviews = await Review.find({});
//     // console.log(allReviews);
//     // const reviewById = await Review.findById("6092fe85631bd017947d870a")
//     // console.log(reviewById.author);
//     const deleted = await Review.deleteMany({author: undefined})
//    console.log(deleted);
//     res.send("It worked")
// })
// // *******


app.get("/", (req, res) => {
    res.render("home")
})

//route for all wrong requests (404 - not found)
app.all("*", (req, res, next) => {
    next(new ExpressError("Page Not Found", 404))
});

//middleware for error handling
app.use((err, req, res, next) => {
    //destructure status code and message from error
    const {statusCode = 500} = err;
    //set default error message if we dont have it from mongoose
    if(!err.message) err.message = "Oh no, Something Went Wrong"
    //{err} - passing entire error to the template "error"
    res.status(statusCode).render("error", {err})
})


app.listen(3000, () => {
    console.log("Serving on port 3000")
})