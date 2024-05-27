
const express = require('express')
const { hashPass, authenticateLogin, ensureLogin } = require("../controller/authController")
const { searchMovies, addMovieToWatchlist, getWatchlist, removeMovieFromWatchlist } = require('../controller/movieController')
const { createUser } = require("../controller/userController")
const db = require("../connection")

const router = express.Router()

// Handler for the register page
const registerPage = (req, res) => {
    console.log(`landing time: ${req.requestTime}`);
    res.status(200).render('register', {error:"", user: {}});
};

// handler for ligin page
const loginPage = (req, res) => {
    res.status(200).render('login.ejs', {error:"", user: {}})
}

const loginSuccess = (req, res) => {
    if(req.session.loggedin){
        console.log("redirecting to home.")
        console.log(req.session.user)
        // res.render("home", req.user)
        res.redirect(301, "home")
    }else{
        res.status(401).send({error: "Could not validate login."})
    }
}

const userHome = async (req, res) => {

    if( req.query['search-movie'] != null ){
        let movies = await searchMovies(req.query['search-movie'])

        if( movies.results.length > 0 ){
            // console.log(movies.results)
            return res.status(200).render('home', {user: req.session.user, movies: movies.results, message: ""})
        }
    }

    return res.status(200).render('home', {user: req.session.user, movies: [], message: ""})
}


router.get("/home/:id", addMovieToWatchlist, (req, res) => {
    res.redirect(301,"/user/home")
    // res.render("home", { user: req.session.user, movies: [], message: "Successfully added movie to watchlist." })
})

router.get("/watchlist/:id", removeMovieFromWatchlist, (req, res) => {
    res.redirect(301,"/user/watchlist")
    // res.render("home", { user: req.session.user, movies: [], message: "Successfully added movie to watchlist." })
})

router
    .route("home/:id")
    .get(addMovieToWatchlist)

router
    .route("watchlist/:id")
    .get(removeMovieFromWatchlist)

router
    .route("/home")
    .get(ensureLogin, userHome)

router
    .route("/register")
    .get(registerPage)
    .post(hashPass, createUser);

router
    .route("/login")
    .get(loginPage)
    .post(authenticateLogin, loginSuccess)

router
    .route("/watchlist")
    .get( ensureLogin, getWatchlist )

module.exports = router