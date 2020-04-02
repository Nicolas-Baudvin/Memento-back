require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const helmet = require("helmet");
const path = require("path");

const authRoute = require("./Routers/auth.routes");

const app = express();

mongoose.connect(process.env.MONGO_CONNECTION_LINK,
    {
        "useNewUrlParser": true,
        "useUnifiedTopology": true
    })
    .then(() => console.log("Connexion à MongoDB réussie !"))
    .catch(() => console.log("Connexion à MongoDB échouée !"));

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    next();
});

app.use(helmet());

// app.set("view engine", "ejs");

app.use(bodyParser.json());

app.use("/api/auth", authRoute);

module.exports = app;
