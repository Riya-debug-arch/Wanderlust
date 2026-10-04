const Listing = require("../models/listing.js");

const Review = require("../models/review.js");


// ================= CREATE REVIEW =================

module.exports.createReview = async (req, res) => {

    const { id } = req.params;


    const listing = await Listing.findById(id);


    const newReview = new Review(req.body.review);


    // Logged-in user ko author banana
    newReview.author = req.user._id;


    listing.reviews.push(newReview);


    await newReview.save();

    await listing.save();


    req.flash(
        "success",
        "Review added successfully!"
    );


    res.redirect(`/listings/${listing._id}`);

};


// ================= DELETE REVIEW =================

module.exports.deleteReview = async (req, res) => {

    const { id, reviewId } = req.params;


    await Listing.findByIdAndUpdate(
        id,
        {
            $pull: {
                reviews: reviewId
            }
        }
    );


    await Review.findByIdAndDelete(reviewId);


    req.flash(
        "success",
        "Review deleted!"
    );


    res.redirect(`/listings/${id}`);

};