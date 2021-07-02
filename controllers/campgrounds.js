const Campground = require("../models/campground");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken: mapBoxToken});
const {cloudinary} = require("../cloudinary");

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", {campgrounds})
}

module.exports.renderNewForm = (req, res) => {
    res.render("campgrounds/new");
}

module.exports.createCampground = async(req, res, next) => { 
    //geocoding API
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    //creating new campground from form
    const campground = new Campground(req.body.campground);
    //add geometry to campground
    campground.geometry = geoData.body.features[0].geometry;
    //loop over array of files and create array of objects. Each includes path and url to image
    campground.images = req.files.map(f => ({url: f.path, filename: f.filename}))  
    //to track who is the author of campground
    campground.author = req.user._id;
    await campground.save();
    req.flash("success", "Successfully made a new campground!");
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.showCampground = async (req, res) => {
    // find campground
    const campground = await Campground.findById(req.params.id).populate({
        // populate reviews
        path: "reviews",
        // populate on each of them author
        populate: {
            path: "author"
        }
    // populate one author to this one campground
    }).populate("author");
    if(!campground){
        req.flash("error", "Cannot find that campground!");
        return res.redirect("/campgrounds");
    }
    res.render("campgrounds/show", {campground})
}

module.exports.renderEditForm = async(req, res) =>{
    const {id} = req.params;
    //find to prepopulate the form
    const campground = await Campground.findById(req.params.id);
    if(!campground){
        req.flash("error", "Cannot find that campground!");
        return res.redirect("/campgrounds");
    }
    res.render("campgrounds/edit", {campground})
}

module.exports.updateCampground = async(req, res) => {
    const {id} = req.params;
    //finding campground in db by id and using spread operator(...) to add req.body object to existing object
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    const imgs = req.files.map(f => ({url: f.path, filename: f.filename}));  
    campground.images.push(...imgs);
    // ****
    //update geocoding API
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    campground.geometry = geoData.body.features[0].geometry;
    // ****
    await campground.save();
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({$pull: { images: { filename: {$in: req.body.deleteImages} }}})
    }
    req.flash("success", "Successfully updated campground!");
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCampground = async(req, res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted campground");
    res.redirect(`/campgrounds/`);
}