var model = require('../models/search.model');

exports.get = function (req, res)
{
	if (!req.session.user)
		res.redirect('signup');
	res.type('text/html');
	res.status(200);
	res.render('search', {'myinterest': req.session.user.interest});
};

exports.post = function (req, res)
{
	if (!req.session.user)
		res.redirect('signup');
	var value = req.body.search;
	var me = req.session.user;
	model.search(me, value).then(function (people)
	{
		console.log(people);
		
		res.type('text/json');
		res.status(200);
		res.send(people);
	});
};
