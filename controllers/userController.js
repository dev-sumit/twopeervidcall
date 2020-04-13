
const express = require("express");
let router = express.Router();
const mongoose = require("mongoose");
const User = mongoose.model("users");

function registration(req, res){
    
    let user = new User();

    user.UserName = req.body.UserName;
    user.Password = req.body.Password;
    user.Email = req.body.Email;
    user.City = req.body.City;
    user.Personal_Info.FirstName = req.body.FirstName;
    user.Personal_Info.MiddleName = req.body.MiddleName;
    user.Personal_Info.LastName = req.body.LastName;

    user.save((err, doc) => {
        if(!err){
            res.render("users/loginScreen");
        }else{
            console.log("Error during insertion: " + err);
        }
    });
}

function verifyLogin(req, res){

    console.log("verifying login credentials");
    
    User.findOne({ UserName: req.body.UserName}, function(err, user){
        console.log("User Found, login success");

        if(err){
            console.log("Error Occured");
            res.render("users/loginfailed");
            res.json(err);
        }

        if(user && user.Password === req.body.Password){
            console.log("Username and Password correct");
            res.redirect("users/homepage"); //To change the url, and rote to homepage with help of render, written below
            //res.render("users/homepage");
        }else{
            console.log("Credentials Wrong");
            let invalidMessage = "Incorrect Username and Password";
            res.render("users/loginfailed", {msg : invalidMessage});
        }
    });
}

router.get("/",(req, res) => {
    res.render('users/register');
});

router.post("/", (req, res) => {
    registration(req, res);
});

router.get("/loginScreen",(req,res) => {
    res.render('users/loginScreen');
});


router.post("/loginScreen", (req, res) => {
    verifyLogin(req, res);
});

//Homepage Routing
router.get("/users/homepage", (req, res) => {
    res.render("users/homepage");
});


router.get("/viewUserRecords", (req, res) => {

    User.find((err, doc) => {
        if(!err){
            res.render("users/viewUserRecords", { list: docs} );
        }else{
            console.log("Error in fetching users data: "+ err);
            res.render("users/fetcherror");
        }
    });
});

module.exports = router;