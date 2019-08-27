const router = require('express').Router();
let User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const joi = require('@hapi/joi');
const verify = require('./verifyToken');

//validation
const registerSchema = {
    username : joi.string().required(),
    name     : joi.string().required(),
    password : joi.string().min(6).required(),
    address : joi.string().required(),
    email : joi.string().min(6).required().email()
};

const loginSchema = {
  username : joi.string().min(6).required(),
  password : joi.string().min(6).required()
};

router.get( ('/auth'), verify , async (req, res) => {
  console.log(req.user);
  const user = await User.findOne({
    _id : req.user_id
  });
  if(user){
    res.send({
      id: user_id,
      name:user.name
    })
  }
  else{
    res.send({
      error: "error"
    })
  }
});

//registeration module
router.route('/register').post( async (req, res) => {

  const {error} = joi.validate(req.body,registerSchema);
    if(error){
        return res.status(400).send(error.details[0].message);
    }
  
  //check for same users
  const usernameExist = await User.findOne({
    username : req.body.username
  });
  const emailExists = await User.findOne({
    email : req.body.email
  });
  if(usernameExist){
    return res.status(400).send("Username Already Exists");
  }
  if(emailExists){
    return res.status(400).send("Email Already Exists");
  }

  //register user
  const username = req.body.username;
  const name = req.body.name;
  const address = req.body.address;
  const email = req.body.email;

  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(req.body.password, salt);

  const newUser = new User({
    username,
    name,
    email,
    address,
    password : hashPassword
  });

  const savedUser = await newUser.save();
  
  const token = jwt.sign({
    _id : savedUser._id
  }, process.env.TOKEN_SECRET);
  res.send({
    //"user" : "registered succesfully"
    user: {
      id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
      username: savedUser.username,
      address: savedUser.address
    },
    token,    
  });
});

//login module
router.route('/login').post(async (req,res) => {

    //check validation
    const {error} = joi.validate(req.body,loginSchema);
    if(error){
        return res.status(400).send(error.details[0].message);
    }

    //check if username exists
    const user = await User.findOne({
      username : req.body.username
    });
    if(!user) {
      return res.status(400).send("username incorrect");
    }

    //check password is correct or not
    const validPass = await bcrypt.compare(req.body.password,user.password);
    if(!validPass) {
      return res.status(400).send("Password Incorrect");
    }

    //create and assign token
    const token = jwt.sign({
      _id : user._id
    }, process.env.TOKEN_SECRET);

    res.header('auth-token',token).send({
      user:{
        id: user._id,
        name : user.name,
        email: user.email,
        username: user.username,
        address: user.address

    },token});

});

router.route('/update/:id').post((req, res) => {
  console.log(req.body);
  console.log(req.params.id);
  User.findById(req.params.id)
    .then(user => {
      if(req.body.username !== undefined) {
        console.log('username');
        user.username = req.body.username;
      }
      else {
        console.log('else username')        
        user.username = user.username;        
      }
      if(req.body.name !== undefined) {
        user.name = req.body.name;
      }
      else {
        user.name = user.name;        
      }
      if(req.body.email !== undefined) {
        user.email = req.body.email;
      }
      else {
        user.email = user.email;        
      }
      if(req.body.address !== undefined) {
        console.log('address')
        user.address = req.body.address;
      }
      else {
        console.log('else address');
        user.address = user.address;        
      }
      user.save()
        .then(() => {
            res.json(user)
          })
        .catch(err => res.status(400).json('Error: ' + err));
    })
    .catch(err => res.status(400).json('Error: ' + err));

    
});



module.exports = router;