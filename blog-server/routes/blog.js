var express = require('express');
var router = express.Router();
var blogModel = require('../models/blog')

/* GET 5 blog posts */
router.get('/:username', blogModel.getPosts);

/* GET blog post */
router.get('/:username/:postid', blogModel.getPost);

module.exports = router;
