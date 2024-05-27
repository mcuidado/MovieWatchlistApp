const sqlite3 = require('sqlite3').verbose()


// Create a new database or open an existing one
let db = new sqlite3.Database('./db/movieApp.db', (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Connected to the movieApp database.');
    }
});

// Create a users table
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY,
            username TEXT NOT NULL UNIQUE,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            watchlist TEXT
        )
    `, (err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log('Users table created successfully.');
        }
    });
});

// Close the database connection
// db.close((err) => {
//     if (err) {
//         console.error(err.message);
//     } else {
//         console.log('Database connection closed.');
//     }
// });

module.exports = db