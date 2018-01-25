var model = require('../models/match.model');

exports.get = function (req, res)
{
	if (!req.session.user)
		res.redirect('signup');
	else
	{
		model.get_notification(req.session.user).then(function (list)
		{
			res.type('text/html');
			res.status(200);
			res.render('match', {'list': list});
		});
	}
};
