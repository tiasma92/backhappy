var express = require('express');
var router = express.Router();
const mongoose = require("../models/bdd");
var userModel = require("../models/users");
var requestModel = require("../models/request");
let request = require('async-request'),
    response;


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/sign-in',async function(req, res, next) {
  console.log(req.query.email)
  const user = await userModel.findOne({
    email: req.query.email,
    password: req.query.password
  })
  if(user){
    console.log('We found a User with this email')
    res.json({user, result: true});
  }else{
      console.log('There is no user with this email ! So we need to add the user')
      console.log(user)
    res.json({result: false})
  }});

router.post('/sign-up',async function(req, res, next) {
  const user = await userModel.findOne({
    email:req.body.email,
    password: req.body.password
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

router.get('/profil',async function(req, res, next) {
  const user = await userModel.findById({
    _id: req.query.id
  })
  res.json({user});
});

router.post('/new_request',async function(req, res, next) {
  const user = await userModel.findById({
    _id: req.body.id
  })
  console.log(user)
  var addressUser = user.address;
  var data = await request("https://api.opencagedata.com/geocode/v1/json?q="+addressUser+"&key=4872ac082674453280a0f4b6f7f7a9bc&language=fr&pretty=1")
  body = JSON.parse(data.body);
  console.log(body.results[0].geometry)
  const newRequest = await new requestModel({
      position: addressUser,
      longitude: body.results[0].geometry.lng,
      latitude: body.results[0].geometry.lat,
      category: req.body.category,
      description: req.body.description,
      image: req.body.image,
  })
  // userModel.findOne({ _id: req.body.id }).populate('helpRequest').exec(function (err, user) {
  //   console.log("---------"+user);
  // });
  newRequest.save(async function(error, requete) {
    console.log("Requete SAVED ---->", requete)
    user.helpRequest.push(requete._id)
    user.save()
    console.log(user)
    res.json({result: true});
  });
});

router.get('/request',async function(req, res, next) {
  const request = await requestModel.find({
  })
  console.log(request)
  res.json({request});
});

router.get('/valid_request',async function(req, res, next) {
  const request = await requestModel.findById({_id: req.query.id_request
  })
  const user = await userModel.findById({_id: req.query.id_user})
  user.helperRequest.push(request._id)
  user.save()
  console.log("------------------",request)
  console.log(user)
  res.json({result:true});
});


router.get('/myhistory',async function(req, res, next) {
   await userModel.findById({
    _id: req.query.id
  }).populate("helpRequest").exec(function (err, user) {
    console.log("--------",user)
    res.json({user});
  });
});

router.get('/myhelp',async function(req, res, next) {
  await userModel.findById({
   _id: req.query.id
 }).populate("helperRequest").exec(function (err, user) {
   console.log("--------",user)
   res.json({user});
 });
});

module.exports = router;
