const db = require("../connection")
const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken")



// route specific login middleware
const authenticateLogin = (req, res, next)=>{

    let {l_username, l_pass} = req.body

    if( ! l_username || ! l_pass ){
        res.status(400).render('login', {error: "Fields cannot be blank"})
    }
    db.serialize(()=>{
        db.get('SELECT * FROM users WHERE username = ?', [l_username], (err, row)=>{
            if( err ){
                return res.status(400).render('login',{error: "Failed to retrieve user"}) 
            }
            if( ! row ){
                return res.status(404).render('login',{error: "User does not exist"}) 
            }
            req.user = row
            bcrypt.compare(l_pass, row.password, (bcryptErr, result) => {
                if (bcryptErr) {
                    console.error('Error comparing passwords:', bcryptErr.message);
                    return res.status(500).render( 'login' ,{error: 'Internal Server Error'});
                }
    
                if ( ! result) {
                    return res.status(401).render('login', { error: "Invalid Credentials" });
                }
                const token = jwt.sign({ userId: row.id }, process.env.JWT_SECRET_KEY, { expiresIn: '24h' });
                console.log("Password is correct: " + result)
                req.session.loggedin = true;
				req.session.user = row;
                res.cookie('jwt', token, { maxAge: 24 * 60 * 60 * 1000 });
                next();
            });
        })
    })
}

const ensureLogin = (req, res, next) => {
    if (!req.session.loggedin || !req.session.user) {
        return res.status(401).render("login", { error: "Unauthorized session" });
    }

    const token = req.cookies.jwt;
    if (!token) {
        return res.status(401).render("login", { error: "Unauthorized token" });
    }

    // console.log(process.env.JWT_SECRET_KEY)
    // console.log(token)
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).render("login", { error: "Unauthorized token" });
        }
        req.userId = decoded.userId;
        console.log(`Decoded ID: ${req.userId}`);
        next();
    });
};

// Middleware to hash the password
let hashPass = (req, res, next) => {
    let { r_pass, r_pass_conf } = req.body;

    if (r_pass !== r_pass_conf) {
        return res.status(400).render('register', { error: "Passwords do not match" });
    }

    bcrypt.hash(r_pass, 8, (err, hash) => {
        if (err) {
            return res.status(400).render('register', { error: err.message });
        }
        req.hashedPass = hash;
        next();
    });
};

module.exports = { hashPass, authenticateLogin, ensureLogin } 