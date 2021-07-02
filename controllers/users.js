const User = require("../models/user");
const Campground = require("../models/campground");

module.exports.renderRegister = (req, res) => {
    res.render("users/register");
}

module.exports.register = async(req, res, next) => {
    try{
        const {email, username, password} = req.body;
        const user = new User({email, username});
        const registeredUser = await User.register(user, password);
        //login this registered user
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash("success", "Welcome to Yelp Camp!");
            res.redirect("/campgrounds");
        })
    } catch(e) {
        req.flash("error", e.message);
        res.redirect("/register")
    }
}

module.exports.renderLogin = (req, res) => {
    res.render("users/login");
}

module.exports.login = (req, res) => {
    req.flash("success", "Welcome back");
    const redirectUrl = req.session.returnTo || "/campgrounds";
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res) => {
    req.logout();
    req.flash("success", "Goodbye")
    res.redirect("/campgrounds");
}


// $$$ user profile
module.exports.profile = async (req, res) => {
    const currentUser = req.user;
    if(!currentUser){
        req.flash("error", "You must be signed in first!");
        return res.redirect("/login");
    }
    const currentUserCampgrounds = await Campground.find().where('author').equals(currentUser._id)
    res.render("users/profile", {currentUserCampgrounds, currentUser})
}
