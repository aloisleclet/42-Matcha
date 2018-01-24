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
	
			var i = 0;
	
			while (i < list.length)
			{
				if (list[i].type == 0)
					list[i].type = "visit your profile";
				else if (list[i].type == 1)
					list[i].type = "match with you.";
				else if (list[i].type == 2)
					list[i].type = "double match with you.";
				i++;	
			}
	
			res.render('match', {'list': list});
		});
	}
};
