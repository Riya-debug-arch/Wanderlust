const Listing = require("../models/listing.js");


// ================= INDEX =================

module.exports.index = async (req, res) => {

    const allListings = await Listing.find({});

    res.render("listings/index.ejs", {
        allListings
    });

};


// ================= NEW FORM =================

module.exports.renderNewForm = (req, res) => {

    res.render("listings/new.ejs");

};


// ================= SHOW =================

module.exports.showListing = async (req, res) => {

    const { id } = req.params;

    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author"
            }
        })
        .populate("owner");


    if (!listing) {

        req.flash(
            "error",
            "listing you requested for does not exist"
        );

        return res.redirect("/listings");

    }


    res.render("listings/show.ejs", {
        listing
    });

};


// ================= CREATE =================
module.exports.createListing = async (req, res) => {

    // console.log("BODY:", req.body);
    // console.log("FILE:", req.file);

    const newListing = new Listing(req.body.listing);

    newListing.owner = req.user._id;

    // Agar new image upload hui hai
    if (req.file) {
        newListing.image = {
            filename: req.file.filename,
            url: req.file.path
        };
    }

    await newListing.save();

    req.flash(
        "success",
        "New listing created!"
    );

    res.redirect("/listings");
};



// ================= EDIT FORM =================

module.exports.renderEditForm = async (req, res) => {

    const { id } = req.params;

    const listing = await Listing.findById(id);


    if (!listing) {

        req.flash(
            "error",
            "Listing you requested for does not exist!"
        );

        return res.redirect("/listings");

    }


    res.render("listings/edit.ejs", {
        listing
    });

};


// ================= UPDATE =================

module.exports.updateListing = async (req, res) => {

    const { id } = req.params;

    const listing = await Listing.findById(id);


    if (!listing) {

        req.flash(
            "error",
            "Listing does not exist!"
        );

        return res.redirect("/listings");

    }


    listing.title = req.body.listing.title;

    listing.description = req.body.listing.description;

    listing.price = req.body.listing.price;

    listing.country = req.body.listing.country;

    listing.location = req.body.listing.location;


    // New image selected
    if (req.file) {

        listing.image = {

            filename: req.file.filename,

            url: req.file.path

        };

    }


    await listing.save();


    req.flash(
        "success",
        "Listing updated successfully!"
    );


    res.redirect(`/listings/${listing._id}`);

};


// ================= DELETE =================

module.exports.deleteListing = async (req, res) => {

    const { id } = req.params;

    await Listing.findByIdAndDelete(id);


    req.flash(
        "success",
        "Listing deleted!"
    );


    res.redirect("/listings");

};