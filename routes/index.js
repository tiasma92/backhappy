var express = require('express');
var router = express.Router();
const mongoose = require("../models/bdd");
var userModel = require("../models/users");
var requestModel = require("../models/request");
var uniqid = require('uniqid');
var fs = require('fs');
var uid2 = require("uid2");
var SHA256 = require("crypto-js/sha256");
var encBase64 = require("crypto-js/enc-base64");
let request = require('async-request'),
  response;

var cloudinary = require('cloudinary');
cloudinary.config({
  cloud_name: 'duffn6wgk',
  api_key: 622783166962686,
  api_secret: 'aCA9naXtZUACy6YPOaaFf0_tNsc'
});

const apiKey = "4872ac082674453280a0f4b6f7f7a9bc"

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET SIGN-IN. */
router.get('/sign-in', async function (req, res, next) {
  console.log(req.query.email)
  const user = await userModel.findOne({
    email: req.query.email,
  })
  
  /* Test if the user exist */
  if (user) {
    var hash = SHA256(req.query.password + user.salt).toString(encBase64);
    if (hash === user.password) {
      isUserExist = true;
      console.log('We found a User with this email')
      res.json({ user, result: true });
    } else {
      res.json({ result: false })
    }
    /* Redirect to page Sign-up. */
  } else {
    console.log('There is no user with this email ! So we need to add the user')
    console.log(user)
    res.json({ result: false })
  }
});

/* For register */
router.post('/sign-up', async function (req, res, next) {
  /* Search if the user exist already. */
  const user = await userModel.findOne({
    email: req.body.email,
  })
  if (user) {
    console.log('We found a User with this email')
    res.json({ result: false });
    /* Register a new user */
  } else {
    var salt = uid2(32);
    console.log('There is no user with this email ! So we need to add the user')
    const newUser = await new userModel({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      address: req.body.address,
      phone: req.body.telephone,
      salt: salt,
      password: SHA256(req.body.password + salt).toString(encBase64),
      token: uid2(32),
      email: req.body.email,
      city: req.body.city,
    });

    newUser.save(function (error, user) {
      console.log("USER SAVED ---->", user)
      res.json({ user });
    });
  }
});

/* For find my user profil with my id */
router.get('/profil', async function (req, res, next) {
  const user = await userModel.findOne({
    token: req.query.token
  })
  res.json({ user });
});

router.get('/find_picture', async function (req, res, next) {
  console.log(req.query.id)
  const user = await userModel.findById({
    _id: req.query.id
  })
  console.log(user)
  res.json({ user });
})

/* Register a new request from someone who needs help */
router.post('/new_request', async function (req, res, next) {
  const user = await userModel.findOne({
    token: req.body.token
  })
  console.log(user)
  var addressUser = `${req.body.address} ${req.body.city}`;
  /* Use api from opencage for convert a real address in coordonate */
  var data = await request(`https://api.opencagedata.com/geocode/v1/json?q=${addressUser}&key=${apiKey}&language=fr&pretty=1`)
  var body = await JSON.parse(data.body);
  console.log(body)
  /* Save the request */
  if (body.status.code === 200) {
    const newRequest = await new requestModel({
      position: addressUser,
      longitude: body.results[0].geometry.lng,
      latitude: body.results[0].geometry.lat,
      category: req.body.category,
      description: req.body.description,
      statut: "En attente",
      idAsker: user._id,
    })
    newRequest.save(async function (error, requete) {
      console.log(error)
      console.log("Requete SAVED ---->", requete)
      /* Push the id from the request in the information of user */
      user.helpRequest.push(requete._id)
      user.save()
      console.log(user)
      res.json({ result: true });
    });
  } else {
    res.json({ result: false });
  }
});

/* For check all the request on the map */
router.get('/request', async function (req, res, next) {
  const request = await requestModel.find({
  })
  console.log(request)
  res.json({ request });
});

router.post('/update_profil', async function (req, res, next) {
  const user = await userModel.findOne({
    token: req.body.token
  })
  await user.update({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    phone: req.body.telephone,
    address: req.body.address,
    city: req.body.city,
    pictureName: req.body.image,
  })
  console.log(user)
  res.json({ user });
});

router.post('/upload', async function (req, res, next) {
  var photoPath = `./public/images/picture-${uniqid()}.jpg`
  console.log(req.files)
  console.log(req.files.picture);
  await req.files.picture.mv(photoPath,
    function (err) {
      if (err) {
        res.json({ result: false, message: err });
      } else {
        cloudinary.v2.uploader.upload(photoPath,
          function (error, result) {
            if (result) {
              console.log(result)
              res.json({ data: result.secure_url })
              fs.unlinkSync(photoPath)
            } else {
              console.log('this is the error --->', error)
              res.json({ result: false, message: 'File not uploaded!' });
            }
          })
      }
    })
});

/* For take a request */
router.get('/valid_request', async function (req, res, next) {
  const request = await requestModel.findById({
    _id: req.query.id_request
  })
  /* For change the statut */
  await request.updateOne({ statut: "En cours" }, function (error, raw) {
  })

  const user = await userModel.findOne({ token: req.query.token_user })
  await request.updateOne({ idHelper: user._id }, function (error, raw) {
  })
  user.helperRequest.push(request._id)
  user.save()
  console.log("------------------", request)
  console.log(user)
  res.json({ result: true });
});

/* For check all the help request. */
router.get('/myhistory', async function (req, res, next) {
  await userModel.findOne({
    token: req.query.token
  }).populate("helpRequest").exec(function (err, user) {
    console.log("--------", user)
    res.json({ user });
  });
});

/* For check all the request taken by a helper */
router.get('/myhelp', async function (req, res, next) {
  await userModel.findOne({
    token: req.query.token
  }).populate("helperRequest").exec(function (err, user) {
    console.log("my help", user)
    res.json({ user });
  });
});

/* For find the user who needs help from his request */
router.get('/find_request', async function (req, res, next) {
  await requestModel.findById({ _id: req.query.id_request }).populate("idAsker").exec(function (err, request) {
    console.log(err)
    console.log("--------", request)
    res.json({ request });
  });
});

/* For finish the request and actualize his statut. */
router.get('/end_request', async function (req, res, next) {
  const request = await requestModel.findById({
    _id: req.query.id_request
  })
  await request.updateOne({ statut: "Terminé" }, function (error, raw) {
  })
  res.json({ result: true });
});

module.exports = router;
