if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}
const express = require("express");
const app = express();

const mongoose = require("mongoose");
const path = require("path");

const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const session = require("express-session");
//const MongoStore=require('connect-mongo').default;
const flash = require("connect-flash");


const passport = require("passport");
const LocalStrategy = require("passport-local");

const User = require("./models/user.js");

const ExpressError = require("./utils/ExpressError.js");


// ================= DATABASE =================

// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl=process.env.ATLASDB_URL;
if (!dbUrl)
     { 
console.log("ERROR: ATLASDB_URL is not defined in .env"); process.exit(1);
 } 
 async function main() 
 { 
    await mongoose.connect(dbUrl); 
    console.log("connected to DB"); 
}
 main().catch((err) =>
     { console.log("MongoDB connection error:", err); });






// ================= APP CONFIGURATION =================

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.engine("ejs", ejsMate);

app.use(express.urlencoded({ extended: true }));

app.use(methodOverride("_method"));

app.use(express.static(path.join(__dirname, "public")));

// const store=MongoStore.create({
//     mongoUrl: dbUrl,
//     crypto:{
//         secret:"mysupersecretcode",
//     },
//     touchafter:24*3600,
// });
// store.on("error",(err)=>{
//     console.log("Error in Mongo Session Store:",err);
// });
// ================= SESSION =================

const sessionOptions = {
    // store,
    secret:process.env.SECRET ,
    resave: false,
    saveUninitialized: true
};


app.use(session(sessionOptions));

app.use(flash());


// ================= PASSPORT =================

app.use(passport.initialize());

app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());

passport.deserializeUser(User.deserializeUser());


// ================= GLOBAL VARIABLES =================

app.use((req, res, next) => {

    res.locals.success = req.flash("success");

    res.locals.error = req.flash("error");

    res.locals.currUser = req.user;

    next();
});


// ================= HOME ROUTE =================

//app.get("/", (req, res) => {
  //  res.send("Hi m root");
//});


// ================= ROUTES =================

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");


app.use("/listings", listingRouter);

app.use("/listings/:id/reviews", reviewRouter);

app.use("/", userRouter);


// ================= 404 ERROR =================

app.all("/{*splat}", (req, res, next) => {

    next(new ExpressError(404, "page not found!"));

});


// ================= ERROR HANDLER =================

app.use((err, req, res, next) => {

    let {
        statusCode = 500,
        message = "Wrong!"
    } = err;

    res.status(statusCode).render("error.ejs", {
        message
    });

});


// ================= SERVER =================

app.listen(8080, () => {

    console.log("server is listening to port 8080");

});