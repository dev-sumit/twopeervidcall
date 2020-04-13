const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/videoconf", {useNewUrlParser: true, useUnifiedTopology: true}, (err) => {
    if(!err){
        console.log("Mongodb Connected succesfully");
    }else{
        console.log("Error in mongodb connection" + err);
    }
});

require("./user_model");