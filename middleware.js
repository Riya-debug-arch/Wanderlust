const Listing = require("./models/listing");
const Review = require("./models/review");

const ExpressError = require("./utils/ExpressError");

const {
    listingSchema,
    reviewSchema
} = require("./schema");


// =====================================================
// AUTHENTICATION MIDDLEWARE
// =====================================================

// Check user is logged in or not
module.exports.isLoggedIn = (req, res, next) => {

    if (!req.isAuthenticated()) {

        // Save the URL user was trying to access
        req.session.redirectUrl = req.originalUrl;

        req.flash(
            "error",
            "You must be logged in!"
        );

        return res.redirect("/login");
    }

    next();
};


// =====================================================
// SAVE REDIRECT URL
// =====================================================

module.exports.saveRedirectUrl = (req, res, next) => {

    if (req.session.redirectUrl) {

        res.locals.redirectUrl =
            req.session.redirectUrl;
    }

    next();
};


// =====================================================
// OWNER CHECK
// =====================================================

module.exports.isOwner = async (req, res, next) => {

    const { id } = req.params;

    const listing = await Listing.findById(id);


    // Listing doesn't exist
    if (!listing) {

        req.flash(
            "error",
            "Listing does not exist!"
        );

        return res.redirect("/listings");
    }


    // Check current user is owner
    if (
        !listing.owner._id.equals(
            res.locals.currUser._id
        )
    ) {

        req.flash(
            "error",
            "You are not the owner of this listing!"
        );

        return res.redirect(`/listings/${id}`);
    }


    next();
};


// =====================================================
// REVIEW AUTHOR CHECK
// =====================================================

module.exports.isReviewAuthor = async (req, res, next) => {

    const { id, reviewId } = req.params;

    const review = await Review.findById(reviewId);


    // Review doesn't exist
    if (!review) {

        req.flash(
            "error",
            "Review does not exist!"
        );

        return res.redirect(`/listings/${id}`);
    }


    // Check current user is review author
    if (
        !review.author.equals(
            res.locals.currUser._id
        )
    ) {

        req.flash(
            "error",
            "You are not the author of this review!"
        );

        return res.redirect(`/listings/${id}`);
    }


    next();
};


// =====================================================
// LISTING VALIDATION
// =====================================================

module.exports.validateListing = (req, res, next) => {

    const { error } = listingSchema.validate(
        req.body
    );


    if (error) {

        const errMsg = error.details
            .map((el) => el.message)
            .join(",");


        throw new ExpressError(
            400,
            errMsg
        );
    }


    next();
};


// =====================================================
// REVIEW VALIDATION
// =====================================================

module.exports.validateReview = (req, res, next) => {

    const { error } = reviewSchema.validate(
        req.body
    );


    if (error) {

        const errMsg = error.details
            .map((el) => el.message)
            .join(",");


        throw new ExpressError(
            400,
            errMsg
        );
    }


    next();
};