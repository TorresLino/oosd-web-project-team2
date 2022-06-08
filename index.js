const express = require("express");
const app = express();
const ejs = require("ejs");
const mysql = require("mysql");

app.listen(8000, (err)=>{
    if(err) throw err;
    console.log('Server started on port 8000');
})
app.set("view engine", "ejs");
app.use(express.urlencoded({extended: true}));

app.get('/contact', (req, res)=>{
    res.render('contact')
});

app.get('/register', (req, res)=>{
    res.render('register')
});

app.use(express.static('./components', {extensions: ['ejs']}));
app.use(express.static('./views', {extensions: ['ejs']}));
app.use(express.static('./public'));

