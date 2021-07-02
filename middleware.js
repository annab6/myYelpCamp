//validation schema for campgrounds and forms from Joi
const { campgroundSchema, reviewSchema } = require("./schemas.js");
const ExpressError = require("./utils/ExpressError");
const Campground = require("./models/campground");
const Review = require("./models/review");
// const User = require("./models/user");

//middleware to check if the user is loggedin
module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()){
        req.flash("error", "You must be signed in first!");
        return res.redirect("/login");
    }
    next();
}

//middleware to validate campground data from form
module.exports.validateCampground = (req, res, next) => {
    //pass our data through this schema(to validate it) and destructure error
    const {error} = campgroundSchema.validate(req.body);
    //check if there is error - throw express error and pass to error handling middleware
    if(error){
        const msg = error.details.map(el => el.message).join(",")
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

//authorization middleware(for only campground owner can change and delete)
module.exports.isAuthor = async (req, res, next) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash("error", "You do not have permission to do that");
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

//middleware to validate review and rating data from form
module.exports.validateReview = (req, res, next) => {
    const {error} = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(",")
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

//authorization middleware(for only review owner can delete it)
module.exports.isReviewAuthor = async (req, res, next) => {
    const {id, reviewId} = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash("error", "You do not have permission to do that");
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}
