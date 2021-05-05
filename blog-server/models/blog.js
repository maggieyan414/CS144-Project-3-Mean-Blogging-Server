let client = require('../db');
let commonmark = require('commonmark')

function getPosts(req, res) {
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
            let data = {
                status: '404 - Not Found',
                message: 'Cannot find username'
            };
            res.status(404).render('error', data);
        } else {
            res.send(docs)
        }
    });
}

async function getPost(req, res) {
    let posts = client.db('BlogServer').collection('Posts');
    let username = req.params.username;
    let postid = parseInt(req.params.postid);
    let post = await posts.findOne({ 'username':username, 'postid':postid });
    if(!post) {
        let data = {
            status: '404 - Not Found',
            message: 'Cannot find username or postid'
        };
        res.status(404).render('error', data);
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