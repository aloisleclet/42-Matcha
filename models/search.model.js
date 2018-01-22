var connection = require('./connection');
var utils = require('./utils');
var q = require('q');

exports.search = function (me, value)
{
	//todo model/utils -> get_users to avoid duplication of code with suggestion.model
	//the idea is to get all the users and then to filter with the advanced option on the front

	var db = connection.init();
	
	db.connect();

	var defer = q.defer();

	value = value+'%';

	db.query('SELECT * FROM user WHERE username LIKE ? OR name LIKE ? OR surname LIKE ? AND user.id != ?', [value, value, value, me.id], function (err, users)
	{
		if (err)
			throw err;
		else
		{
			utils.drop_blocked_users(me, users).then(function()
			{
				utils.complete_users(me, users, 1).then(function (users)
				{
					return (defer.resolve(users));
				});
			});

			return (defer.promise);
		}
	});

	return (defer.promise);
};
