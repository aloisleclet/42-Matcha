var model = require('../models/signin.model');

exports.get = function (req, res)
{
	res.type('text/html');
	res.status(200);


	var notification = '';
	
	if (req.params.state)
	{
		if (req.params.state == 'true')
		{
			notification = 'Check your email !';
		}
		else if (req.params.state == 'false')
		{
			notification = 'Unavailable email or username.';
		}
		res.render('signin', {'layout' : 'simple', 'notification' : notification});
	}
	else if (req.params.token)
	{
		model.confirmation_user(req.params.token).then(function ()
		{
			//todo add notification on signup
			res.redirect('/signup');
		});
	}
	else
	{
		res.render('signin', {'layout' : 'simple'});
	}
	
};

exports.post = function (req, res)
{
	console.log(req.body);
	var name = req.body.name;
	var surname = req.body.surname;
	var username = req.body.username;
	var email = req.body.email;
	var password = req.body.password;
	var loc = req.body.loc; 

	model.new_user(name, surname, username, email, password, loc).then(function (state)
	{
		res.redirect('/signin/'+state);
	});
};

