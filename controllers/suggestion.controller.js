var model = require('../models/suggestion.model');

exports.get = function (req, res)
{
	if (!req.session.user)
		res.redirect('signup');

	console.log('SUGGESTION');
	console.log(req.session.user);
	
	model.get_suggestion(req.session.user).then(function (list)
	{
		res.type('text/html');
		res.status(200);
		res.render('suggestion', {'list' : list, 'myinterest': req.session.user.interest});
	});
};

exports.get_conversation = function (req, res)
{

	if (!req.session.user)
		res.redirect('signup');
	
	model.get_conversation(req.session.user).then(function (conversations)
	{
		res.type('text/html');
		res.status(200);
		res.send(conversations);
	});
};

exports.get_message = function (req, res)
{
	console.log('====req');
	console.log(req.params);	
	var id = req.params.id;

	console.log('---'+id);
	
	if (req.session.user != undefined)
	{
		model.get_message(req.session.user, id).then(function (data)
		{
			console.log('model response');
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

	console.log('Content Id');
	console.log(content);	
	console.log(id);	
	
	if (req.session.user != undefined)
	{
		model.post_message(req.session.user.id, id, content).then(function (data)
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

