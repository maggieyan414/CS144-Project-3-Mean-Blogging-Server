var express = require('express');
var router = express.Router();
var loginModel = require('../models/login.js');

/* GET home page */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'CS144. Project 3' });
});

/* Login routes */
router.get('/login', loginModel.getLogin);
router.post('/login', loginModel.loginUser);


module.exports = router;
