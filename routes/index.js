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

/* GET SIGN-IN. */
router.get('/sign-in',async function(req, res, next) {
  console.log(req.query.email)
  const user = await userModel.findOne({
    email: req.query.email,
    password: req.query.password
  })
  /* Test if the user exist */
  if(user){
    console.log('We found a User with this email')
    res.json({user, result: true});
    /* Redirect to page Sign-up. */
  }else{
      console.log('There is no user with this email ! So we need to add the user')
      console.log(user)
    res.json({result: false})
  }});

  /* For register */
router.post('/sign-up',async function(req, res, next) {
  /* Search if the user exist already. */
  const user = await userModel.findOne({
    email:req.body.email,
    password: req.body.password
  })
  if(user){
    console.log('We found a User with this email')
    res.json({user});
    /* Register a new user */
  }else{
    console.log('There is no user with this email ! So we need to add the user')
    const newUser = await new userModel({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      address: req.body.address,
      phone: req.body.telephone,
      email: req.body.email,
      city: req.body.city,
      password: req.body.password,
    });

    newUser.save(function(error, user) {
      console.log("USER SAVED ---->", user)
      res.json({user});
    });
  } 
});

/* For find my user profil with my id */
router.get('/profil',async function(req, res, next) {
  const user = await userModel.findById({
    _id: req.query.id
  })
  res.json({user});
});

/* Register a new request from someone who needs help */
router.post('/new_request',async function(req, res, next) {
  const user = await userModel.findById({
    _id: req.body.id
  })
  console.log(user)
  var addressUser = user.address;
  /* Use api from opencage for convert a real address in coordonate */
  var data = await request("https://api.opencagedata.com/geocode/v1/json?q="+addressUser+"&key=4872ac082674453280a0f4b6f7f7a9bc&language=fr&pretty=1")
  body = JSON.parse(data.body);
  console.log(body)
  console.log(body.results[0].geometry)
  /* Save the request */
  const newRequest = await new requestModel({
      position: addressUser,
      longitude: body.results[0].geometry.lng,
      latitude: body.results[0].geometry.lat,
      category: req.body.category,
      description: req.body.description,
      statut: "En attente",
      idAsker: req.body.id,
  })
  // userModel.findOne({ _id: req.body.id }).populate('helpRequest').exec(function (err, user) {
  //   console.log("---------"+user);
  // });
  newRequest.save(async function(error, requete) {
    console.log("Requete SAVED ---->", requete)
    /* Push the id from the request in the information of user */
    user.helpRequest.push(requete._id)
    user.save()
    console.log(user)
    res.json({result: true});
  });
});

/* For check all the request on the map */
router.get('/request',async function(req, res, next) {
  const request = await requestModel.find({
  })
  console.log(request)
  res.json({request});
});

/* For take a request */
router.get('/valid_request',async function(req, res, next) {
  const request = await requestModel.findById({_id: req.query.id_request
  })
  /* For change the statut */
  await request.updateOne({statut: "En cours"}, function(error, raw) {
  })

  const user = await userModel.findById({_id: req.query.id_user})
  user.helperRequest.push(request._id)
  user.save()
  console.log("------------------",request)
  console.log(user)
  res.json({result:true});
});

/* For check all the help request. */
router.get('/myhistory',async function(req, res, next) {
   await userModel.findById({
    _id: req.query.id
  }).populate("helpRequest").exec(function (err, user) {
    console.log("--------",user)
    res.json({user});
  });
});

/* For check all the request taken by a helper */
router.get('/myhelp',async function(req, res, next) {
  await userModel.findById({
   _id: req.query.id
 }).populate("helperRequest").exec(function (err, user) {
   console.log("--------",user)
   res.json({user});
 });
});

/* For find the user who needs help from his request */
router.get('/find_request',async function(req, res, next) {
  await requestModel.findById({_id:req.query.id_request}).populate("idAsker").exec(function (err, request) {
    console.log("--------",request)
    res.json({request});
  });
});

/* For finish the request and actualize his statut. */
router.get('/end_request',async function(req, res, next) {
  const request = await requestModel.findById({_id: req.query.id_request
  })
  await request.updateOne({statut: "Terminé"}, function(error, raw) {
  })
    res.json({result: true});
});

module.exports = router;
