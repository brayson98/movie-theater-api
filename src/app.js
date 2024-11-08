const express = require("express");
const app = express();
const db = require("../db/connection.js");
const userRoutes = require("../routes/user.js")
const showRoutes = require("../routes/show.js")
//TODO: Create your GET Request Route Below: 

app.use(express.json())

app.use("/users", userRoutes)
app.use("/shows", showRoutes)


module.exports = app;