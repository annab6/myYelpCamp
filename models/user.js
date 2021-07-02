const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique : true
    }
});

//Passport-Local Mongoose will add a username, hash and salt field to store the username, the hashed password and the salt value
UserSchema.plugin(passportLocalMongoose);

// handling the unique email error
UserSchema.post('save', function (error, doc, next) {
    if (error.name === 'MongoError' && error.code === 11000 && error.keyValue.email) {
        next(new Error('Email address was already taken, please choose a different one.'));
    } else {
        next(error);
    }
});

module.exports = mongoose.model("User", UserSchema);