var model = require('../models/recover.model');

exports.get = function (req, res)
{
	res.type('text/html');
	res.status(200);
	res.render('recover', {'layout' : 'simple'});
};

exports.post = function (req, res)
{
	res.send('todo');
};
