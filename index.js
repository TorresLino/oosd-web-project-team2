const express = require("express");
const app = express();
const ejs = require("ejs");
const mysql = require("mysql");
const register = require("./public/scripts/register.js")

app.listen(8000, (err)=>{
    if(err) throw err;
    console.log('Server started on port 8000');
})
app.set("view engine", "ejs");
app.use(express.urlencoded({extended: true}));

app.get('/contact', (req, res)=>{    
    var con = require('./config/connection.js').createCon();
    con.query('select * from agencies', (errAgency, resAgency, fieldAgency)=>{
        con.query('select * from agents', (errAgent, resAgent, fieldAgent)=>{
            var render_info = {agencies: resAgency, agents:{}};
            for(let agency of resAgency){
                //does not include agents with no AgencyId
                render_info['agents'][agency.AgencyId] = resAgent.filter(function(agent){return agent.AgencyId == agency.AgencyId});
            }
            res.render("contact", render_info);
            con.end();
        });
    });
});

app.get('/register', (req, res)=>{    
    res.render('register', {fields: register.getAllFields(), fieldContents: [], badInputs: []});
});

app.post('/register', (req, res)=>{
    var dataVerification = register.verifyFormFields(req.body);
    var render_dict = {fields: register.getAllFields(), fieldContents: dataVerification['cleanValues'],
    badInputs: dataVerification['validFields'].map(val => !val)};
    
    if(dataVerification['error']){
        res.redirect('/register', {fields: register.getAllFields(), fieldContents: {}, badInputs: []})
        //maybe improve error handling later
    }else if(dataVerification['validFields'].includes(false)){
        res.render('register', render_dict);
    }else{
        var con = require('./config/connection.js').createCon();
        //remove unused data (while there isnt validation)
        delete dataVerification['cleanValues'].uname;
        delete dataVerification['cleanValues'].pwd;
        delete dataVerification['cleanValues'].agrees;
        delete dataVerification['cleanValues'].promo;
        function questionmarks(length){
            var str = '?';
            for(var i=0; i<length-1; i++){
                str = str.concat(', ?');
            }; return str}
        var sql = ('insert into customers ('+
        Object.keys(dataVerification['cleanValues']).join(', ') +', AgentId) values ('+
        questionmarks(Object.values(dataVerification['cleanValues']).length) +', NULL)')
        con.query(sql, Object.values(dataVerification['cleanValues']), (err, result)=>{
            if(err) throw err;
            con.end();
        });
        //redirect somewhere else
        res.redirect('/contact');
    }
});

app.use(express.static('./components', {extensions: ['ejs']}));
app.use(express.static('./views', {extensions: ['ejs']}));
app.use(express.static('./public'));

