/*this is the node app for the group project */
const mysql = require("mysql");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true})); 
app.set("view engine", "ejs");
const register = require('./js/register.js')

//set the server up
app.listen(8000, (err)=>{
	if (err) throw err;
	console.log("server started on port 8000");
});

app.use(express.static("media"));
app.use(express.static("js"));
app.use(express.static("css"));
app.use(express.static('components'));
app.use(express.static('views'));

//evans code: to retrieve from two custom tables.
app.get(["/index", "/"], (req, res)=>{
	var con = require('./config/connection.js').createCon();
	con.query("select * from flights", (err, result, fields)=>{
		var flightResult = result;
		//var customerId = req.query.custid;
		con.query({
			sql: "select * from hotels",
			//values: [customerId]
			},
			(err, result, fields)=>{
			if (err) throw err;
			var hotelResult = result;
			res.render("index", { flightResult: flightResult, hotelResult: hotelResult });
			con.end((err)=>{
				if (err) throw err;
			});
		});
	});
});


// evan code: used to post the enter to win tab to table
app.post("/post-form", (req, res)=>{
	var con = require('./config/connection.js').createCon();
	var sql = "INSERT INTO `enter_to_win`(`EtwFirstName`, `EtwLastName`, `EtwHomePhone`, `EtwEmail`, `EtwAge`) VALUES (?,?,?,?,?)";
	var values = [req.body.EtwFirstName, req.body.EtwLastName, req.body.EtwHomePhone, req.body.EtwEmail, req.body.EtwAge];
	con.query(sql,values,(err, result, fields)=>{
		if (err) throw err;
		console.log("result=" + result.affectedRows);
		if (result.affectedRows)
		{
			//res.status(200).send("THANK YOU FOR ENTERING!! GOOD LUCK!!");
			res.render("thanks");
		}
		else
		{
			res.status(200).send("insert failed");
		}
		con.end((err)=>{
			if (err) throw err;
		});
	});
});


app.get("/thanks", (req,res)=>{
	res.render("thanks");
});


// Angel's codes : to render the vacation page and pull vacation packages from database
app.get(["/vacation", "/vacation.html"], (req, res)=>{
	var con = require('./config/connection.js').createCon();
	con.query("SELECT PackageId, PkgName, PkgContinent, PkgStartDate, PkgEndDate, PkgDesc, PkgBasePrice, PkgImage FROM packages WHERE PkgStartDate > CURDATE()", (err, result)=>{
		if (err) throw err;
		res.render("vacation", {result:result});
		con.end((err)=>{
			if (err) throw err;
		});
	});
});

// Angel's codes : to show the selected package in the booking page
app.get("/booking", (req, res)=>{
	var con = require('./config/connection.js').createCon();
	var packageId= req.query.packageId;
	con.query({
		sql: "SELECT PackageId, PkgName, PkgStartDate, PkgEndDate, PkgBasePrice FROM packages WHERE PackageId=?",
		values: [packageId]
	},
	(err, result)=>{
		if (err) throw err;
		res.render("booking", {result:result});
		con.end((err)=>{
			if (err) throw err;
		});
	});
});

// Angel's codes : to insert customer and booking record after submitting booking form
app.post("/post-booking", (req, res)=>{
	var con = require('./config/connection.js').createCon();
	var email = req.body.email;
	//check if there is existing client with the same email and ask them to sign in to book
	con.query({
		sql: "SELECT CustEmail from customers where CustEmail=?",
		values: [email]
	},
	(err, result)=>{
		if (err) throw err;
		if (result.length) {
			res.send("You have an existing account with the email. Please <a href='signin'>sign in</a> to book.");
		} else {
			// insert new customer record into customers table
			var sql = "INSERT INTO customers (CustFirstName, CustLastName, CustAddress, CustCity, CustProv, CustPostal, CustCountry, CustHomePhone, CustBusPhone, CustEmail) VALUES (?,?,?,?,?,?,?,?,?,?)";
			var values = [req.body.fname, req.body.lname, req.body.address, req.body.city, req.body.province, req.body.postalCode, req.body.country, req.body.homePhone, req.body.busPhone, req.body.email];
			con.query(sql,values, (err, result)=>{  
				if (err) throw err;
				var custRecord = result;
				console.log(custRecord.affectedRows + " customer record inserted");
				var newCustId = custRecord.insertId;
				var datetime = new Date();
				// insert new booking record into booking table
				con.query({
					sql: "INSERT INTO bookings (BookingDate, TravelerCount, CustomerId, PackageId) VALUES(?,?,?,?)",
					values: [datetime, req.body.travelerNo, newCustId, req.body.packageId]
				},
				(err, result)=>{
					if (err) throw err;
					var bookResult = result;
					console.log(bookResult.affectedRows + " booking record inserted");
					if (result.affectedRows) {
						res.redirect('/thanks');
					} else {
						res.status(200).send("Sorry, booking failed. Please try again later.");
					}
					con.end((err)=>{
						if (err) throw err;
					});
				});
			});
		};
	});
});

// Angel's codes : to render the signin page
app.get("/signin", (req, res)=>{
	res.render("signin");
});

// Arthur's code
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

// Arthur's code
app.get('/register', (req, res)=>{    
    res.render('register', {fields: register.getAllFields(), fieldContents: [], badInputs: []});
});

// Arthur's code
app.post('/register', (req, res)=>{
    var dataVerification = register.verifyFormFields(req.body);
    var render_dict = {fields: register.getAllFields(), fieldContents: dataVerification['cleanValues'],
    badInputs: dataVerification['validFields'].map(val => !val)};
    
    if(dataVerification['error']){
		//error means that something with the input is not right, not necessarily a code error (but could also be)
        res.render('register', {fields: register.getAllFields(), fieldContents: {}, badInputs: []})
    }else if(dataVerification['validFields'].includes(false)){
        res.render('register', render_dict);
    }else{
        var con = require('./config/connection.js').createCon();
        //remove unused data before inserting into database
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
        res.redirect('/thanks');
    }
});

app.use((req, res, next) => {
    res.render("404");
});
