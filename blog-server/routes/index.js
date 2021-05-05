var express = require('express');
var router = express.Router();
var loginModel = require('../models/login.js');
var postsModel = require('../models/posts');

/* GET home page */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'CS144. Project 3' });
});

/* Login routes */
router.get('/login', loginModel.getLogin);
router.post('/login', loginModel.loginUser);

/* Blog management routes */
router.get('/api/posts', postsModel.getCookiePayload, postsModel.checkAuth, postsModel.getPosts);
router.post('/api/posts', postsModel.getCookiePayload, postsModel.checkAuth, postsModel.createPost);
router.delete('/api/posts', postsModel.getCookiePayload, postsModel.checkAuth, postsModel.deletePost);

module.exports = router;