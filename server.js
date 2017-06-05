

// load express module
var express = require('express'); 

// load logging module 
var morgan = require('morgan'); 

// load session module  
var session= require('express-session'); 

// load session store in a file 
var fileStore = require('session-file-store')(session); 

// set the host name 
var hostname 	= 'localhost'; 
//set the port nr
var port 	= 3030; 


// create the general app context 
var app		= express(); 

// start the middleware 

app.use(morgan('dev'));

// start the middleware for session usage  
app.use(session ( { 
	name: 'session-id', 
	secret:'1234-5678',
	saveUninitialized:true, 
	resave: true, 
	store: new fileStore()
		
}) ); 

// create a function
//
function auth(req, resp, next ) {
	console.log(req.headers);

	// just if it's session is empty, not set 
	if (!req.session.user) {  
		// extract the authorization header 
		var authHeader = req.headers.authorization; 
		
		// if is it null 
		if (!authHeader) {
			var err = new Error ('You must use authorization (Basic)'); 
			err.status = 401; 
			next (err) ; // call the Error Middleware 
			return; 
		}

		// format 
		// Basic xybhhhhh:33333ddd
		// end of format 
		var auth 	= new Buffer (authHeader.split(' ')[1], 'base64').toString().split(':'); 
		var user  	= auth[0]; 
		var passwd 	= auth[1]; 

		if ( user == 'admin' && passwd == 'password'){
			req.session.user ='admin'; // set the session with the name user   
			next(); // athorization successfull
		} else {

			var err = new Error ('Yoou are not athenticated!'); 
			err.status = 401; 
			next (err); 
		}
	} else {

		if (req.session.user === 'admin') {
			console.log('req.session:',req.session); 
			next(); 
		} else { 
			var err = new Error ( 'You are not authenticated!'); 
			err.status = 401; 
			next(err); 

		}

	}
}

//
// start the middleware for authentication 
app.use(auth); 

// start the middleware for serving static files 
app.use(express.static(__dirname +'/public')); 

// Error handling Middleware 
app.use(function (req, resp, next) {
	resp.writeHeader(err.status || 500, 
		{
			'WWW=Authenticate':'Basic',
			'Content-Type':'text/plain'
		}); 
	resp.end(err.message); 
});  

// start the app 
app.listen( port, hostname, function () {
	console.log(`Server running at http://${hostname}:${port}/`); 
}); 


