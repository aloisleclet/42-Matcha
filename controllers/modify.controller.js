var model = require('../models/modify.model');
var model_profil = require('../models/profil.model');

exports.get = function (req, res)
{
// this solution is valid for synchrone langugages here we have to add else and {} all the code following.
	if (!req.session.user) 
		res.redirect('/signup');
	res.type('text/html');
	res.status(200);

	model_profil.get_user(req.session.user.username).then(function (user)
	{
		var b = new Date(user.birthday);
		
		user.birthday = b.getUTCFullYear()+'-'+(b.getUTCMonth()+1)+'-'+b.getDate();

		var view = {};
		view.sex = [];
		view.sex.push({'label': 'Female', 'selected': (user.sex == 0) ? 'selected' : ''});
		view.sex.push({'label': 'Male', 'selected': (user.sex == 1) ? 'selected' : ''});
		view.sex.push({'label': 'Other', 'selected': (user.sex == 2) ? 'selected' : ''});
		
		view.orientation = [];
		view.orientation.push({'label': 'Female', 'selected': (user.orientation == 0) ? 'selected' : ''});
		view.orientation.push({'label': 'Male', 'selected': (user.orientation == 1) ? 'selected' : ''});
		view.orientation.push({'label': 'Other', 'selected': (user.orientation == 2) ? 'selected' : ''});
				
		res.render('modify', {'user': user, 'view': view});
	});
};

exports.post = function (req, res)
{
	if (!req.session.user)
		res.redirect('signup');

	var name = req.body.name;	
	var surname = req.body.surname;	
	var username = req.body.username;	
	var email = req.body.email;	
	var sex = req.body.sex;
	var orientation = req.body.orientation;	
	var bio = req.body.bio;
	var birthday = req.body.birthday;	
	var interest = req.body.interest;
	interest = interest.trim();

	//update session
	req.session.user.name = name;	
	req.session.user.surname = surname;	
	req.session.user.username = username;	
	req.session.user.email = req.body.email;	
	req.session.user.sex = sex;
	req.session.user.orientation = orientation;	
	req.session.user.bio = bio;
	req.session.user.birthday = birthday;	
	req.session.user.interest = interest.split(' ');

	coord = {};
	coord.longitude = req.body.longitude;
	coord.latitude = req.body.latitude;

	var loc = JSON.stringify(coord); 

	model.update_user(name, surname, username, req.session.user.username, email, sex, orientation, bio, birthday, interest, loc).then(function (state)
	{
		res.redirect('/profil');
	});
};

exports.post_password = function (req, res)
{
	if (!req.session.user)
		res.redirect('/signup');

	model.update_password(req.session.user.username, req.body.password).then(function (state)
	{
		res.redirect('/profil');
	});
};

exports.post_picture = function (req, res)
{
	console.log(req.session);
	model.upload_picture(req, res, req.session.user.username).then(function (state)
	{
		res.redirect('/modify');
	});
};

exports.delete_picture = function (req, res)
{
	model.delete_picture(req.params.filename, req.session.user.username).then(function (state)
	{
		res.redirect('/modify');	
	});
};



