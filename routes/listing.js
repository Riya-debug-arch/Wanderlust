const express = require("express");

const router = express.Router();

const wrapAsync = require("../utils/wrapAsync.js");

const {
    isLoggedIn,
    isOwner
} = require("../middleware.js");

const {
    listingSchema
} = require("../schema.js");

const {
    validateListing
} = require("../middleware.js");

const listingController = require("../controller/listing.js");
const Listing = require("../models/listing.js");
const { storage } = require("../cloudConfig.js");

const multer = require("multer");

const upload = multer({ storage });


// ================= LISTING ROUTES =================


// Index Route
router.get(
    "/",
    wrapAsync(listingController.index)
);


// New Route
router.get(
    "/new",
    isLoggedIn,
    listingController.renderNewForm
);
//suggestion search route
router.get("/suggestions", async (req, res) => {

    const { q } = req.query;

    if (!q || q.trim().length < 1) {
        return res.json([]);
    }

    const regex = new RegExp(q.trim(), "i");

    const listings = await Listing.find({
        $or: [
            { location: regex },
            { country: regex }
        ]
    })
    .select("location country")
    .limit(8);

    const suggestions = [];

    listings.forEach((listing) => {

        if (
            listing.location &&
            !suggestions.includes(listing.location)
        ) {
            suggestions.push(listing.location);
        }

        if (
            listing.country &&
            !suggestions.includes(listing.country)
        ) {
            suggestions.push(listing.country);
        }

    });

    res.json(suggestions.slice(0, 8));
});
//search route
router.get("/search", wrapAsync(async (req, res) => {

    const { q } = req.query;

    const listings = await Listing.find({
        $or: [
            {
                location: {
                    $regex: q,
                    $options: "i"
                }
            },
            {
                country: {
                    $regex: q,
                    $options: "i"
                }
            }
        ]
    });

    if (listings.length === 0) {

        req.flash(
            "error",
            `No listing found for this location: ${q}`
        );

        return res.redirect("/listings");
    }

    res.render("listings/index.ejs", {
        allListings: listings
    });

}));
// Show Route
router.get(
    "/:id",
    wrapAsync(listingController.showListing)
);


// Create Route
router.post(
    "/",
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.createListing)
);


// Edit Route
router.get(
    "/:id/edit",
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.renderEditForm)
);


// Update Route
router.put(
    "/:id",
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.updateListing)
);


// Delete Route
router.delete(
    "/:id",
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.deleteListing)
);


module.exports = router;
