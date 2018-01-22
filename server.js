var express = require('express');
var handlebars = require('express-handlebars').create({defaultLayout : 'main'});
var body_parser = require('body-parser');
var cookie_parser = require('cookie-parser');
var session = require('express-session');
var app = express();

var io = require('socket.io').listen(app.listen(7777));

var port = 7777;

//settings

//port
app.set('port', process.env.PORT || port);

//layout
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

//public dir
app.use(express.static(__dirname + '/public'));

//url parser

app.use(body_parser.json());
app.use(body_parser.urlencoded({ extended: false }));

//session

app.set('trust proxy', 1);

app.use(session(//what is this how to explain???
{
	secret: 'password',
	resave: true,
	saveUninitialized: true,
	cookie: {secure: false, maxAge: 60000}
}));

//middleware share socket.io

app.locals.connected_users = [];

app.use(function(req, res, next)
{
	res.io = io;
	next();
});

//middleware connected users

//bad solution

//app.use(function (req, res, next)
//{
//	var connected_users = [];
//	io.on('connection', function (socket)
//	{
//		socket.on('update_connected_users', function (user)
//		{
//			connected_users.push(user);
//			console.log('SERVER');
//			console.log(connected_users);
//		});
//	});
//	res.connected_users = connected_users;
//	console.log(res.connected_users);
//	next();
//});

//routes

app.use(require('./routes'));

app.use(function (req, res)
{
	res.type('text/html');
	res.status(404);
	res.render('404', {'layout' : 'simple'});
});

app.use(function (error, req, res, next)
{
	console.log(error.stack);
	res.type('text/html');
	res.status(500);
	res.render('500', {'layout' : 'simple'});
});

//socket.io

var connected_users = [];




