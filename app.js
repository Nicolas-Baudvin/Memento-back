require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const helmet = require("helmet");
const path = require("path");

/**
 * Routers
 */
const authRoute = require("./Routers/auth.routes");
const listRoute = require("./Routers/list.routes");
const taskRoute = require("./Routers/task.routes");
const tabRoute = require("./Routers/tab.routes");
const contactRoute = require("./Routers/contact.routes");

const app = express();

mongoose.connect(process.env.MONGO_CONNECTION_LINK,
    {
        "useNewUrlParser": true,
        "useUnifiedTopology": true
    })
    .then(() => console.log("Connexion à MongoDB réussie !"))
    .catch(() => console.log("Connexion à MongoDB échouée !"));

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    next();
});

app.use(helmet());

// app.set("view engine", "ejs");

app.use(bodyParser.json());

/**
 * Authentification Routes
 */
app.use("/api/auth", authRoute);

/**
 * Lists Routes
 */
app.use("/api/list", listRoute);

/**
 * Tasks Routes
 */
app.use("/api/task", taskRoute);

/**
 * Tab Routes
 */
app.use("/api/tab", tabRoute);

/**
 * Contact Routes
 */
app.use("/api/contact", contactRoute);

module.exports = app;
