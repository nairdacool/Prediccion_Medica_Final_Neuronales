const express = require('express');
const app = express();
require('dotenv').config();
const path = require('path');
const morgan = require('morgan');
const enfermedadRouter = require('./routers/enfermedades.router')
    //settings
app.set('port', process.env.PORT || 3000);
//ejs
app.set("view engine", "ejs")
    //views
app.set("views", path.join(__dirname, "views"));


//static file
app.use(express.static(path.join(__dirname, "public")));
app.use("/cssFiles", express.static(__dirname + "/public/css"));
app.use("/jsFiles", express.static(__dirname + "/public/js"));
app.use('/css',express.static(__dirname +'/css'));
app.use('/images',express.static(__dirname +'/images'));
app.use(express.json())
    //middlewares
app.use(morgan("dev"))
app.use(express.urlencoded({ extended: false }));
//router
app.use("/", enfermedadRouter)
    //server
const port = app.get('port');
app.listen(port, () => {
    console.log(`Servidor en el puerto ${port}`);
})