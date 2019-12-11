var express = require('express');
var router = express.Router();
const mongoose = require("../models/bdd")
var userModel = require("../models/users")

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/sign-in',async function(req, res, next) {
  console.log(req.query.email)
  const user = await userModel.findOne({
    email: req.query.email
  })
  if(user){
    console.log('We found a User with this email')
    res.json({user});
  }else{
      console.log('There is no user with this email ! So we need to add the user')
      console.log(user)
    res.json({result: false})
  }});

router.post('/sign-up',async function(req, res, next) {
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
      address: req.body.address,
      phone: req.body.telephone,
      email: req.body.email,
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
