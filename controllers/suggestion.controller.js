var model = require('../models/suggestion.model');

exports.get = function (req, res)
{
	if (!req.session.user)
		res.redirect('signup');
	else
	{
	
		console.log('SUGGESTION');
		console.log(req.session.user);
		
		model.get_suggestion(req.session.user).then(function (list)
		{
			res.type('text/html');
			res.status(200);
			res.render('suggestion', {'list' : list, 'myinterest': req.session.user.interest});
		});
	}
};

exports.get_conversation = function (req, res)
{
	if (!req.session.user)
	{
		res.redirect('signup');
	}
	else
	{	
		console.log('USER');
		console.log(req.session.user);
		
		model.get_conversation(req.session.user).then(function (conversations)
		{
			res.type('text/html');
			res.status(200);
			res.send(conversations);
		});
	}
};

exports.get_message = function (req, res)
{
	var id = req.params.id;

	if (req.session.user != undefined)
	{
		model.get_message(req.session.user, id).then(function (data)
		{
			res.type('text/json');
			res.status(200);
			res.send(data);
		});
	}
	else
	{
		var data = '{"error": "session not set"}';
		res.type('text/json');
		res.status(200);
		res.send(data);
	}
};

exports.post_message = function (req, res)
{
	var content = req.body.content;
	var id = req.body.id;
	var recipient = req.body.recipient;
	
	if (req.session.user != undefined)
	{
		model.post_message(req.session.user, id, recipient, content, res.io).then(function (data)
		{
			res.type('text/json');
			res.status(200);
			res.send(data);
		});
	}
	else
	{
		var data = '{"error": "session not set"}';
		res.type('text/json');
		res.status(200);
		res.send(data);
	}
};

