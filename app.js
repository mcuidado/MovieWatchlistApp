require('dotenv').config({ path: "./config.env" });
const port = process.env.PORT || 3000;
const express = require('express')
const path = require('path')
const morgan = require('morgan')
const sqlite3 = require('sqlite3').verbose()
const connection = require('./connection')
const session = require('express-session')
const xss = require("xss-clean")
const cookieParser = require('cookie-parser');


// Mounting new routers
const userRouter = require("./routes/userRoute")

const app = express()

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true,
    cookie: {
        httpOnly: true,
        maxAge: 60*60*24*1000 // age in milliseconds
    }
}));

app.use(express.urlencoded({ extended:true }))
app.use(express.static(path.join(__dirname, "public")))
app.use(express.json())
app.use(morgan('dev'))
app.use(xss())
app.use(cookieParser());
app.set("views", path.join(__dirname, "views/pages"))
app.set("view engine", "ejs")


// middleware must come before mounting the route. This is global middleware applied to all routes
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString()
    console.log("Hello from middleware")
    next()
})

app.use('/user', userRouter)



app
.route("/")
.get((req, res) => {
    req.session.destroy((err) => {
        if(err){
            res.status(500).send("Failed to logout.")
        }
    })
    console.log(`landing time: ${req.requestTime}`)
    res.status(200).render('index', {user: {}})
})

// app
// .route("/404")
// .get((req, res) => {
//     res.status(200).render('404', {user: {}} )
// })


// catch any non-existent routes or internal server errors middleware
app.all("*", (req, res, next)=> {

    const err = new Error(`ERROR: ${req.originalUrl} does not exist on this server`)
    err.status = 'fail'
    err.statusCode = 404
    next(err)
})

app.use((err, req, res, next) =>{
    err.statusCode = err.statusCode || 500
    err.status = err.status || "error"

    res.status(err.statusCode).render("404", { user: {} })
    // res.status(err.statusCode).json({
    //     status: err.status,
    //     message: err.message
    // })
})

app.listen(port , ()=>{
    console.log(`Listening on port ${ port }`)
})

