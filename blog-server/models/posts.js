let jwt = require('jsonwebtoken');
let client = require('../db');

// errors
let authErr = {
    message: '401 - Unauthorized', 
    error: {
        status: '',
        stack: 'You are not authorized to access this page'
    }
};

let notFoundErr = {
    message: '404 - Not Found', 
    error: {
        status: '',
        stack: 'What you requested does not exist'
    }
};

let badReqErr = {
    message: '400 - Bad Request',
    error: {
        status: '',
        stack: 'Missing parameters'
    }
}


//////////////////////
//     middleware   //
//////////////////////

function getCookiePayload(req, res, next) {
    // get jwt
    let token = req.cookies.jwt;
    if(!token) {
        res.status(401).render('error', authErr);
        return;
    }
    let secret = 'C-UFRaksvPKhx1txJYFcut3QGxsafPmwCY6SCly3G6c';
    jwt.verify(token, secret, function(err, payload) {
        if(err) {
            next(err);
        } else {
            req.cookie_payload = payload;
            next();
        }
    });
}

function checkAuth(req, res, next) {
    let cookie_username = req.cookie_payload.usr;
    let exp = req.cookie_payload.exp;

    let username;
    if(req.method == "POST") {
        username = req.body.username;
    } else {
        username = req.query.username;
    } 

    if(!username) {
        res.status(400).render('error', badReqErr);
        return;
    }

    // check payload
    if(username != cookie_username || Date.now() >= exp*1000) {
        res.status(401).render('error', authErr);
    } else {
        next();
    }
}

async function getPosts(req, res) {
    let postsCollection = client.db('BlogServer').collection('Posts');
    let username = req.query.username;
    let postid = parseInt(req.query.postid);

    if(!postid) {
        let posts = await postsCollection.find({ "username":username });
        posts.toArray((err, docs) => {
            if(err) {
                res.render('error', err);
            } else {
                res.setHeader('Content-Type', 'application/json');
                res.status(200).json(docs);
            }
        });
    } else {
        let post = await postsCollection.findOne({ "username":username, "postid":postid });
        if(!post) {
            res.status(404).render('error', notFoundErr);
        } else {
            res.setHeader('Content-Type', 'application/json');
            res.status(200).json(post);
        }
    }
}

async function deletePost(req, res) {
    let username = req.query.username;
    let postid = parseInt(req.query.postid);
    if(!postid) {
        res.status(400).render('error', badReqErr);
        return;
    }

    let postsCollection = client.db('BlogServer').collection('Posts');
    let result = await postsCollection.deleteOne({ "username":username, "postid":postid })
    if(result.deletedCount === 0) {
        res.status(404).render('error', notFoundErr);
    } else {
        res.sendStatus(204);
    }
}

async function createPost(req, res) {
    let username = req.body.username;
    let postid = req.body.postid;
    let title = req.body.title;
    let body = req.body.body;

    // check request
    if(!postid || !title || !body) {
        res.status(400).render('error', badReqErr);
        return;
    }

    let time = Date.now();
    let postsCollection = client.db('BlogServer').collection('Posts');

    if(postid == 0) {
        let usersCollection = client.db('BlogServer').collection('Users');
        let user = await usersCollection.findOne({ 'username': username });
        if(!user) {
            res.status(404).render('error', notFoundErr);
        } else {
            let newpost = {
                username: username,
                title: title,
                body: body,
                postid: user.maxid+1,
                created: time,
                modified: time
            };
            postsCollection.insertOne(newpost)
            .then(() => usersCollection.updateOne({ 'username': username }, { $inc: { 'maxid': 1 } }))
            .then(() => res.sendStatus(201))
            .catch(err => res.render('error', err));
        }
    } else {
        let filter = { username: username, postid: parseInt(postid) };
        let changes = { $set: { title: title, body: body, modified: time } };
        console.log(changes);
        console.log(title);
        let options = { returnOriginal: false };
        postsCollection.findOneAndUpdate(filter, changes, options)
        .then(updatedpost => {
            if(!updatedpost.value) {
                res.status(404).render('error', notFoundErr);
            } else {
                res.status(200).json({modified: updatedpost.value})
            }
        })
        .catch(err => res.render('error', err));
    }
}

module.exports = {
    getCookiePayload,
    checkAuth,
    getPosts,
    deletePost,
    createPost
};