const mongoose = require ("mongoose");
const Review = require("./review");
//variable for not need to type all time mongose schema
const Schema = mongoose.Schema;
const {cloudinary} = require("../cloudinary");

const ImageSchema = new Schema ({
    url: String,
    filename: String
})

//mongoose virtual, to create image thumbnail on editing campground form
ImageSchema.virtual("thumbnail").get(function() {
    return this.url.replace("/upload", "/upload/w_200");
});

const opts = { toJSON: { virtuals: true } };

//create campground model
const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: {
      type: {
        type: String,
        enum: ['Point'],
        required: true
      },
      coordinates: {
        type: [Number],
        required: true
      }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ]
}, opts);


//mongoose virtual, to follow geoJson format for mapbox dataset
CampgroundSchema.virtual("properties.popUpMarkup").get(function () {
  return `
  <strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
  <p>${this.description.substring(0,20)}...</p>`
});


// //mongoose middleware to delete  reviews that belong to camp when deleting camp
// CampgroundSchema.post("findOneAndDelete", async function (doc) {
//    //if there is a deleted campground
//     if(doc){
// //remove all reviews that, ... 
//        await Review.deleteMany({
// //...where id of camp is in doc()
//            _id: {
//                $in: doc.reviews  
//            }
//        })
//    }
// })


//delete reviews in db and images in cloudinary when deleting campground
CampgroundSchema.post('findOneAndDelete', async function(
    campground
  ) {
    if (campground.reviews) {
      await Review.deleteMany({
        _id : { $in: campground.reviews }
      });
    }
    if (campground.images) {
      for (const img of campground.images) {
        await cloudinary.uploader.destroy(img.filename);
      }
    }
  });



//export campground model
module.exports = mongoose.model("Campground", CampgroundSchema);