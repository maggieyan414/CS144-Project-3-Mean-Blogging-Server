let client = require('../db');
let commonmark = require('commonmark')

function getPosts(req, res, next) {
    // get potential start postid
    let startid = parseInt(req.query.start);
    if(!startid) {
        startid = 1;
    }

    // get posts
    let postsCollection = client.db('BlogServer').collection('Posts');
    let posts = postsCollection.find({ 'username':req.params.username, 'postid':{ $gte:startid } });
    posts.toArray((err, docs) => {
        if(err || docs.length == 0) {
            next(err);
        } else {
            let parser = new commonmark.Parser();
            let writer = new commonmark.HtmlRenderer();
            for(let i = 0; i < 5 && i < docs.length; i++) {
                let curr = docs[i];
                docs[i].title = writer.render(parser.parse(curr.title));
                docs[i].body = writer.render(parser.parse(curr.body));
                docs[i].created = Date(curr.created).toString();
                docs[i].modified = Date(curr.modified).toString();
            }
            let data = {
                user: req.params.username,
                posts: docs,
                nextstartid: startid + 5
            };
            res.render('posts', data);
        }
    });
}

async function getPost(req, res) {
    let username = req.params.username;
    let postid = parseInt(req.params.postid);
    
    let posts = client.db('BlogServer').collection('Posts');
    let post = await posts.findOne({ 'username':username, 'postid':postid });
    if(!post) {
        let err = {
            message: '404 - Not Found', 
            error: {
                status: '',
                stack: 'Cannot find post with specified username and postid'
            }
        }
        res.status(404).render('error', err);
    } else {
        let parser = new commonmark.Parser();
        let writer = new commonmark.HtmlRenderer();
        let data = {
            title: writer.render(parser.parse(post.title)),
            body: writer.render(parser.parse(post.body)),
            created: Date(post.created).toString(),
            modified: Date(post.modified).toString()
        };
        res.render('post', data);
    }
}

module.exports = {
    getPosts,
    getPost
};