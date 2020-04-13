require("./models/db");
require("./models/user_model");

const express = require("express");
const path = require("path");
const exphbs = require("express-handlebars");
const bodyparser = require("body-parser");

const userController = require("./controllers/userController");

let app = express();

//Set veiw Engine, set layout directory and default layout
app.set("views", path.join(__dirname, "/views"));
app.engine("hbs", exphbs({ extname: "hbs", defaultLayout: "mainLayout", layoutsDir: __dirname + "/views/layouts"}));
app.set("view engine", "hbs");

//
app.use(bodyparser.urlencoded({
    extended: true
}));
app.use(bodyparser.json());


//set port
app.listen(3000, () => {
    console.log("Server listening at port 3000");
});

//To configure routing for this application
//app.use("/users", userController);
app.use("/", userController);
