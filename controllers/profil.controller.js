var model = require('../models/profil.model');

exports.me = function (req, res)
{
	if (!req.session.user/* || req.session.user === undefined*/) // is this useful ???
	{
		console.log('redirect -> signup');
		res.redirect('signup');
	}
	console.log('req.session.user:');
	console.log(req.session.user);

	var sex = ['female', 'male', 'other'];
	var user = JSON.parse(JSON.stringify(req.session.user)); // clone without ref
	
	console.log('CURRENT PROFIL');
	console.log(user);

	//maybe a probleme in relation with sex / orientation here

	user.sex = sex[user.sex];
	user.orientation = sex[user.orientation];

	user.compatibility = 0;

	user.state = 'online';

	//get notification visit and like (0 / 1) 

	model.get_notification(req.session.user).then(function (list)
	{
		res.type('text/html');
		res.status(200);
		var i = 0;	
		while (i < list.length)
		{
			if (list[i].type == 0)
				list[i].type = "visit your profile";
			else if (list[i].type == 1)
				list[i].type = "match with you.";
			else if (list[i].type == 2)
				list[i].type = "is connected with you.";
			i++;
		}

		

		res.render('profil', {'user': user, 'el2': 'hidden', 'el3': 'hidden', 'button_unlike': 'hidden', 'notification': list});
	});
};

exports.user = function (req, res)
{
	//get user in order to generate profil of an other user of the current user

	var username = req.params.username;
	var me = req.session.user;

	model.get_user(username, me, res.io).then(function (user)
	{
		var sex = ['female', 'male', 'other'];
		var el3 = "";
		var button_unlike = "hidden";
		var button_like = "";
		
		if (req.session.user)
			console.log(req.session.user.username+' VIEW PROFIL OF '+user.username);
		else 
			console.log('VISITOR VIEW PROFIL OF '+user.name);
		user.sex = sex[user.sex];
		user.orientation = sex[user.orientation];

		//todo
		//-report
		//-block
		//-unlike (unmatch)
		//-state

		console.log(user);
		
		if (user.matched == 1)// what is that ?
		{
			button_unlike = "";
			button_like = "hidden";
		}

		if (user.pictures.length == 0)
			el3 = "hidden";

		if (req.app.locals.connected_users.indexOf(user.username) != -1)
			user.state = 'online';
		else
			user.state = 'offline';

		res.type('text/html');
		res.status(200);
		res.render('profil', {'user': user, 'el1': 'hidden', 'el3': el3, 'button_like': button_like, 'button_unlike': button_unlike});
	});
};

exports.like = function (req, res)
{
	var me = req.session.user;
	var username = req.body.username;
	var id = req.body.id;
	
	if (me == undefined)
	{
		res.type('text/json');
		res.status(200);
		res.send('{"state" : "redirect"}');
	}
	else
	{
		model.like(me, id, username, res.io).then(function (state)
		{
			res.type('text/json');
			res.status(200);
			state = state ? "ok" : "error";
			res.send('{"state" : "'+state+'"}');
		});
	}
};

exports.unlike = function (req, res)
{
	if (!req.session.user)
		res.redirect('signup');
	
	model.unlike(req.session.user, req.body.id).then(function (state)
	{
		res.type('text/json');
		res.status(200);
		state = state ? "ok" : "error";
		res.send('{"state" : "'+state+'"}');
	});
};

exports.report = function (req, res)
{
	if (!req.session.user)
		res.redirect('signup');

	model.report(req.session.user, req.body.id).then(function (state)
	{
		res.type('text/json');
		res.status(200);
		state = state ? "ok" : "error";
		res.send('{"state" : "'+state+'"}');
	});
};

exports.block = function (req, res)
{
	if (!req.session.user)
		res.redirect('signup');

	model.block(req.session.user, req.body.id).then(function (state)
	{
		res.type('text/json');
		res.status(200);
		state = state ? "ok" : "error";
		res.send('{"state" : "'+state+'"}');
	});
};

