const express = require("express");
const router = express.Router();
//controllers campground routes
const campgrounds = require("../controllers/campgrounds");
//middleware function for errors in async f-ns
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");
//middleware to parse multiparts forms
const multer  = require('multer');
const {storage} = require("../cloudinary");
const upload = multer({storage});

const Campground = require("../models/campground");


router.route("/")
    //index page - display all campgrounds
    .get(catchAsync(campgrounds.index))
    //create new campground: 2- route to submit form "create new"
    .post(isLoggedIn, upload.array("image"), validateCampground, catchAsync(campgrounds.createCampground))
    


//create new campground: 1- page with form
router.get("/new", isLoggedIn, campgrounds.renderNewForm);

router.route("/:id")
    //show page - show one campground by id
    .get(catchAsync(campgrounds.showCampground))
    //edit existing campground: 2- find by id and update in db
    .put(isLoggedIn, isAuthor, upload.array("image"), validateCampground, catchAsync(campgrounds.updateCampground))
    //find by id and delete in db
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))

//edit existing campground: 1- find by id and form to edit
router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));


module.exports = router;