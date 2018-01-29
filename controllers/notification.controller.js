var model = require('../models/notification.model');

exports.get = function (req, res)
{
	if (!req.session.user)
		res.redirect('signup');
	else
	{
		model.get_notification(req.session.user).then(function (list)
		{
			if (req.params.json == 'json')
			{
				res.type('text/json');
				res.status(200);
				res.send(list);
				
			}
			else
			{
				res.type('text/html');
				res.status(200);
				res.render('match', {'list': list});
			}
		});
	}
};
