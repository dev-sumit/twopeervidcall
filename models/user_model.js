const mongoose = require("mongoose");

let userSchema = new mongoose.Schema({
    UserName: {
        type: String
    },
    Password: {
        type: String
    },
    Email: {
        type: String
    },
    City: {
        type: String
    },
    Personal_Info: {

        FirstName: {
            type: String
        },
        MiddleName: {
            type: String
        },
        LastName: {
            type: String
        }
    }
});

mongoose.model( "users", userSchema );