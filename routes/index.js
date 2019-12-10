var express = require('express');
var router = express.Router();
const mongoose = require("../models/bdd")
var userModel = require("../models/users")

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/signin', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/signup',async function(req, res, next) {
  const user = await userModel.findOne({
    email:req.body.email
  })
  if(user){
    console.log('We found a User with this email')
    res.json({user});
  }else{

    console.log('There is no user with this email ! So we need to add the user')
  
    const newUser = await new userModel({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      adress: req.body.adress,
      phone: req.body.phone,
      mail: req.body.mail,
      password: req.body.password,
    });

    newUser.save(function(error, user) {
      console.log("USER SAVED ---->", user)
      res.json({user});
    });
  } 
});

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
module.exports = router;
