let client = require('../db');
let bcrypt = require('bcryptjs');
let jwt = require('jsonwebtoken');

function getLogin(req, res) {
    // get optional redirect query
    let redirect = req.query.redirect;

    res.render('login', { redirect:redirect, error:'' })
}

async function loginUser(req, res) {
    let username = req.body.username;
    let pwd = req.body.password;
    let redirect = req.body.redirect;

    if(!username || !pwd) {
        res.status(401).render('login', { redirect:redirect, error:'Username and password are required' });
        return;
    }

    // search collections for user
    let userCollection = client.db('BlogServer').collection('Users');
    let user = await userCollection.findOne({ 'username':username });

    // check passwords
    if(!user || !bcrypt.compareSync(pwd, user.password)) {
        res.status(401).render('login', { redirect:redirect, error:'Incorrect username and/or password' });
        return;
    }

    // send JWT
    let payload = {
        "exp": Math.floor(Date.now() / 1000) + (60 * 60 * 2), // 2 hours
        "usr": user.username
    };
    let secret = 'C-UFRaksvPKhx1txJYFcut3QGxsafPmwCY6SCly3G6c';
    let options = {
        header: {
            "alg": "HS256",
            "typ": "JWT"
        }
    };
    let token = jwt.sign(payload, secret, options);
    res.cookie('jwt', token);

    if(!redirect) {
        res.status(200).send('Authentication successful! Welcome ' + user.username);
    } else {
        res.redirect(redirect);
    }
}

module.exports = {
    getLogin,
    loginUser
};