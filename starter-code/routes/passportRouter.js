const express        = require("express");
const router         = express.Router();
// User model
const User           = require("../models/user");
// Bcrypt to encrypt passwords
const bcrypt         = require("bcrypt");
const bcryptSalt     = 10;
const ensureLogin = require("connect-ensure-login");
const passport      = require("passport");


router.get("/signup", (req, res, next) => {
  res.render("passport/signup"); 
});

// Route to handle signup form submission
router.post("/signup", (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  
  // Validation 1 - Checking that the user has provided
  // a username and a password
   if (username === "" || password === "") {
      res.render("passport/signup", { message: "Indicate username and password" });
      return;
   }

   User.findOne({ username }, "username", (err, user) => {
       if (user != null) {
           res.render("passport/signup", { message: "The username already exists"});
       }

       const salt = bcrypt.genSaltSync(bcryptSalt);
       const hashPass = bcrypt.hashSync(password, salt);

       // Generating the user with the encrypted following the 
       //two lines before performing the encryption
       const newUser = new User ({
          username,
          password: hashPass

       });

       newUser.save((err) => {
          if (err) {
            res.render("passport/signup", { message: "Something went wrong" });
          } else {
            res.redirect("/");
          }
          
        });
   });
});

router.get("/login", (req, res, next) => {
  res.render("passport/login", { "message": req.flash("error") });
});

router.post("/login", passport.authenticate("local", {
  successRedirect: "/private-page",
  failureRedirect: "/login",
  failureFlash: true,
  passReqToCallback: true

}));



router.get("/private-page", ensureLogin.ensureLoggedIn(), (req, res) => {
  res.render("passport/private", { user: req.user });
});

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/login");
});




module.exports = router;
