require('dotenv').config({ path: "../config.env" });
const db = require("../connection")
const axios = require('axios');

let searchMovies = async (query) => {
    const url = `${process.env.QUERY_URI}?include_adult=false&language=en-US&page=1&query=${query}`;
    const headers = {
        'accept': 'application/json',
        'Authorization': `Bearer ${ process.env.TOKEN}`
    };

    try {
        const response = await axios.get(url, { headers });
        console.log(response)
        return response.data; // Return the JSON data
    } catch (error) {
        console.error('Error:', error);
        throw error; // Rethrow the error to be handled by the caller
    }
};

let findMovie = async (movieId) => {
    const url = `${ process.env.MOVIE_URI }/${movieId}`;
    const headers = {
        'accept': 'application/json',
        'Authorization': `Bearer ${process.env.TOKEN}`
    };

    try {
        const response = await axios.get(url, { headers });
        return response.data; // Return the JSON data
    } catch (error) {
        console.error('Error:', error);
        throw error; // Rethrow the error to be handled by the caller
    }
}

const fetchUserWatchlist = (req) => {
    return new Promise((resolve, reject) => {
        let email = req.session.user.email;

        db.serialize(() => {
            db.get('SELECT watchlist FROM users WHERE email = ?', [email], async (err, row) => {
                if (err) {
                    console.error('Error fetching user watchlist:', err);
                    reject(err);
                } else {
                    try {
                        let movieIds = JSON.parse(row['watchlist']);
                        let watchlist = await Promise.all(movieIds.map(id => findMovie(id)));
                        resolve(watchlist);
                    } catch (parseError) {
                        console.error('Error parsing watchlist:', parseError);
                        reject(parseError);
                    }
                }
            });
        });
    });
}

const getMovies = (req, res, next) => {
    let email = req.session.user.email;
    db.serialize(() => {
        db.get('SELECT watchlist FROM users WHERE email = ?', [email], (err, row) => {
            if (err) {
                console.error('Error fetching user watchlist:', err);
                return res.status(400).render('home', { user: req.session.user, movies: [], message: "Error fetching watchlist." });
            }
            // if watchlsit has a value, parse a javascript array
            return row.watchlist;
        })
    })
}

const updateMovies = (req, res, next, watchlist) => {
    db.serialize(()=>{
        db.run('UPDATE users SET watchlist = ? WHERE email = ?', [JSON.stringify(watchlist), email], (err) => {
            if (err) {
                console.error('Error adding movie to watchlist:', err);
                return res.status(400).render('home', { user: req.session.user, movies: [], message: "Error adding movie to watchlist." });
            }

            console.log('Movie successfully added to watchlist');
            next();
        });
    })
}

const addMovieToWatchlist = (req, res, next) => {
    let movieId = req.params.id;
    let email = req.session.user.email;
    // console.log(movieId);
    // console.log(email);

    db.serialize(() => {
        db.get('SELECT watchlist FROM users WHERE email = ?', [email], (err, row) => {
            if (err) {
                console.error('Error fetching user watchlist:', err);
                return res.status(400).render('home', { user: req.session.user, movies: [], message: "Error fetching watchlist." });
            }
            // if watchlsit has a value, parse a javascript array
            let watchlist = JSON.parse(row.watchlist);
            // console.log(watchlist)
            if (!watchlist.includes(movieId)) {
                watchlist.push(movieId);
            }

            db.run('UPDATE users SET watchlist = ? WHERE email = ?', [JSON.stringify(watchlist), email], (err) => {
                if (err) {
                    console.error('Error adding movie to watchlist:', err);
                    return res.status(400).render('home', { user: req.session.user, movies: [], message: "Error adding movie to watchlist." });
                }

                console.log('Movie successfully added to watchlist');
                next();
            });
        });
    });
};

const removeMovieFromWatchlist = (req, res, next)=>{

    let movieId = req.params.id
    let email = req.session.user.email

    db.serialize(()=>{
        db.get('SELECT watchlist FROM users WHERE email = ?', [email], (err, row) => {
            if (err) {
                console.error('Error fetching user watchlist:', err);
                return res.status(400).render('watchlist', { user: req.session.user, movies: [], message: "Error fetching watchlist." });
            }
    
            if ( row.watchlist.includes(movieId) ) {

                let watchlist = JSON.parse(row.watchlist);
                let newWatchlist = watchlist.filter((id) => id != movieId )
                console.log(`New watchlist: ${newWatchlist}`)

                db.run('UPDATE users SET watchlist = ? WHERE email = ?', [JSON.stringify(newWatchlist), email], (err) => {
                    if (err) {
                        console.error("Error removing movie from watchlist: ", err);
                        return res.status(400).render('watchlist', { user: req.session.user, movies: [], message: "Error removing movie from watchlist." });
                    }
    
                    console.log('Movie successfully removed from watchlist');
                    next();
                });
            }else{
                next()
            }
        })
    })
}
 
const getWatchlist = async (req, res) =>{
    try {
        let watchlist = await fetchUserWatchlist(req);

        if (watchlist.length > 0) {
            return res.status(200).render("watchlist", {
                user: req.session.user,
                movies: watchlist,
                message: "Fetched watchlist."
            });
        } else {
            return res.status(200).render("home", {
                user: req.session.user,
                movies: [],
                message: "No movies found in your watchlist..."
            });
        }
    } catch (error) {
        console.error('Error rendering user watchlist:', error);
        return res.status(400).render("home", {
            user: req.session.user,
            movies: [],
            message: "Error fetching watchlist."
        });
    }
}


module.exports = { searchMovies, findMovie, addMovieToWatchlist, getWatchlist, removeMovieFromWatchlist }

// const url = 'https://api.themoviedb.org/3/search/movie?query=lord&include_adult=false&language=en-US&page=1';