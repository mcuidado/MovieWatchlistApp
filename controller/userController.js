const db = require("../connection")

// Handler for creating a user
const createUser = (req, res) => {
    let { r_username, r_email } = req.body;

    try {

        db.serialize(() => {
            db.run('INSERT INTO users (username, email, password, watchlist) VALUES (?, ?, ?, ?)',
            [r_username, r_email, req.hashedPass, '[]'],
            (err) => {
                if (err) {
                    return res.status(400).render('register', { error: "Error Creating Users. Possible duplicates." });
                }
                console.log('User created successfully');
                res.redirect(301, "login")
            });
        })
    } catch (error) {
        console.error('Error creating user:', error);
        return res.status(500).send('Internal Server Error');
    }
};

module.exports = {createUser}