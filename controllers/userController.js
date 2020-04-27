 
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
            res.redirect("users/loginScreen");
            
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
            let username = user.UserName;
            res.redirect("users/homepage"+ "/" + username); //To change the url, and route to homepage with help of render, written below
            //res.render("users/homepage");
        }else{
            console.log("Credentials Wrong");
            let invalidMessage = "Incorrect Username and Password";
            res.render("users/loginfailed", {msg : invalidMessage});
        }
    });
}


//index- Registration
router.get("/",(req, res) => {
    res.render('users/register');
});

router.post("/", (req, res) => {
    registration(req, res);
});


//LoginScreen
router.get("/loginScreen",(req,res) => {
    res.render('users/loginScreen');
});


router.post("/loginScreen", (req, res) => {
    verifyLogin(req, res);
});

//From Registration to Login Screen
router.get("/users/loginScreen",(req,res) => {
    res.render('users/loginScreen');
});


router.post("/users/loginScreen", (req, res) => {
    verifyLogin(req, res);
});


//Homepage Routing
router.get("/users/homepage/:username", (req, res) => {
    User.find((err, doc) => {
        if(!err){
            
            let uname = String(req.params.username);

            const  filteredUserData = {
                filteredUserRecords : doc.filter( record => {
                    return record.UserName != uname;
                })
            };
             console.log("Filterd Users: ");
             console.log(filteredUserData.filteredUserRecords);

            const  userData = {
                userRecords : filteredUserData.filteredUserRecords.map( record => {
                    return{
                        UserName: record.UserName,
                        Email: record.Email,
                        City: record.City,
                        Personal_Info: record.Personal_Info
                    };
                })
            };
            
            console.log(userData);
            res.render("users/homepage", { flist: userData.userRecords, MyName: uname, layout: false});
            

        }else{
            console.log("Error in fetching users data: "+ err);
            res.render("users/fetcherror");
        }
    })
});

//ViewUserRecords
router.get("/viewUserRecords", (req, res) => {

    User.find((err, doc) => {
        if(!err){
            
            const  userData = {
                userRecords : doc.map( record => {
                    return{
                        UserName: record.UserName,
                        Email: record.Email,
                        City: record.City,
                        Personal_Info: record.Personal_Info
                    }
                })
            };
            
            res.render("users/viewUserRecords", { list: userData.userRecords} );
            //console.log(doc);

        }else{
            console.log("Error in fetching users data: "+ err);
            res.render("users/fetcherror");
        }
    });
});

//View Profile
router.get("/users/viewProfile/:username", (req, res) => {

    console.log("Showing Users Profile");
    let userToFetch = String(req.params.username);

    console.log("User to fetch "+ userToFetch);

    //View User
    User.find({UserName: userToFetch},function(err, userFetched){

        if(err){
            console.log("Error Occured");
            res.render("users/fetcherror");
            res.json(err);
        }else{
            
            console.log("User Found");
            console.log(userFetched);
            // //convert mongoose model to json
            const  userDataArr = {
                userRecord : userFetched.map( record => {
                    return{
                        UserName: record.UserName,
                        Password: record.Password,
                        Email: record.Email,
                        City: record.City,
                        Personal_Info: record.Personal_Info
                    };
                })
            };

            console.log("User Data");
            let userData =userDataArr.userRecord[0];

            res.render("users/viewProfile", {udata: userData});
        }
    });
});

router.get("/users/viewProfile", (req, res) =>{
    res.render("users/viewProfile");
});


//Update Profile
router.post("/users/viewProfile", (req, res) => {

    console.log("Updating Users Profile ");
    let userToUpdate = req.params.userToUpdate;
    let valPassword = req.body.Password;
    let valEmail = req.body.Email;
    let valCity = req.body.City;
    let valMiddleName = req.body.MiddleName;
    let valLastName = req.body.LastName;

    console.log("UserName Updated"+ userToUpdate);

    let updateQuery = {UserName: userToUpdate};
    let changedValues = { $set: {
        Password: valPassword,
        Email: valEmail,
        City: valCity,
        MiddleName: valMiddleName,
        LastName: valLastName,
    } };


    //Update User
    User.updateOne( updateQuery, changedValues, function(err, success){
        if(err){
            res.json(err);
            res.render("/users/fetcherror");
        }else{
            //Now View the changed Profile
            res.redirect("users/viewProfile/"+userToUpdate);
        }
    });
});

router.get("/users/videocall/:callingPeer/:toCallPeer", (req, res) => {

    let callingPeer = req.params.callingPeer;
    let toCallPeer = req.params.toCallPeer;
    res.render("users/videocall", {localid: callingPeer, callpickerid: toCallPeer});
});


module.exports = router;