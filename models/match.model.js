var connection = require('./connection');
var utils = require('./utils');
var fs = require('fs');
var q = require('q');

exports.get_notification = function (me)
{
	var db = connection.init();
	var defer = q.defer();

	db.query('SELECT user.*, notification.type FROM user, notification WHERE id_user_b = (SELECT id FROM user WHERE username = ?) AND id_user_a = user.id ORDER BY date DESC', [me.username], function (err, list)
	{
		if (err)
			throw err;
		console.log('NOTIFICATION LIST');
		console.log(list);
		utils.drop_blocked_users(me, list).then(function (notification_refined)
		{
			console.log('NOTIFICATION REFINED');
			console.log(notification_refined);
			utils.complete_users(me, notification_refined, 0).then(function (notifications)
			{
				return (defer.resolve(notifications));
			});
		});
	});
	return (defer.promise);
};
