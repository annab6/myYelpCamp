const express = require("express");
const router = express.Router({mergeParams:true});
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware");
const Campground = require("../models/campground");
const Review = require("../models/review");
const reviews = require("../controllers/reviews");
const ExpressError = require("../utils/ExpressError");
const catchAsync = require("../utils/catchAsync");


//submit a review for campground by id
router.post("/", isLoggedIn, validateReview, catchAsync(reviews.createReview))

//route to delete a review by id
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))


module.exports = router;