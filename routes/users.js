const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");
const users = require("../controllers/users");
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn } = require("../middleware");

router.route("/register")
    .get(users.renderRegister)
    .post(catchAsync(users.register))

router.route("/login")
    .get(users.renderLogin)
    .post(passport.authenticate("local", {failureFlash: true, failureRedirect: "/login"}), users.login)

router.get("/logout", users.logout);


// $$$
// router.get("/profile", catchAsync, isLoggedIn(users.profile));
router.get("/profile", catchAsync(users.profile));
// $$$


module.exports = router;