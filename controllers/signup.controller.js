var model = require('../models/signup.model');

exports.get = function (req, res)
{
	res.type('text/html');
	res.status(200);
	res.render('signup', {'layout' : 'simple'});
};

exports.post = function (req, res)
{
	var username = req.body.username;
	var password = req.body.password;

	model.signup(username, password, res.io).then(function (user)
	{
		if (user)
		{
			user.loc = JSON.parse(user.loc);
			req.session.user = user;
			
			console.log('SUCCESSFUL LOGIN');
			console.log(req.session.user);
			req.app.locals.connected_users.push(user.username);	
			console.log('CONNECTED USERS');
			console.log(req.app.locals.connected_users);
			res.redirect('/suggestion');
		}
		else
		{
			var notification = 'Username or password invalid.';

			res.type('text/html');
			res.status(200);
			res.render('signup', {'layout' : 'simple', 'notification' : notification});
		}
	});
};

exports.logout = function (req, res)
{
	var index = req.app.locals.connected_users.indexOf(req.session.user.username);
	req.app.locals.connected_users.splice(index, 1);

	var io = res.io;

	io.emit('logout', {'id': index});

	console.log('CONNECTED USERS AFTER LOGOUT');
	console.log(req.app.locals.connected_users);

	req.session.destroy(function (err)
	{
		if (err)
			throw err;
		res.redirect('/signup');
	});
};
