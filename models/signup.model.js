var connection = require('./connection');
var utils = require('./utils');
var q = require('q');
var fs = require('fs');
var crypto = require('crypto');

exports.signup = function (username, password, io, truc)
{
	var defer = {};
	defer.a = q.defer();
	defer.b = q.defer();
	defer.c = q.defer();

	var db = connection.init();
	db.connect();

	db.query('SELECT user.* FROM user WHERE user.username = ? AND token = 0', [username], function(err, res)
	{
		if (err)
			throw err;
		var key = crypto.createDecipher('aes-128-cbc', 'password');
		var initial_password = key.update(res[0].password, 'hex', 'utf8');
		initial_password += key.final('utf8');
		if (res.length > 0 && initial_password == password)
			return (defer.a.resolve(res));
		else
			return (defer.a.resolve(false));
	});

	defer.a.promise.then(function (res)
	{
		//get interest
		var user = res[0];
		db.query('SELECT tag.label FROM user, tag, user_have_tag WHERE user.username = ? AND user_have_tag.id_user = user.id AND user_have_tag.id_tag = tag.id', [username], function (err, res)
		{
			if (err)
				throw err;
			user.interest = [];
			user.pictures = [];

			for (var i = 0; i < res.length; i++)
			{
				user.interest.push(res[i].label);
			}
			//add age
			user.age = utils.age(user.birthday);
			return (defer.b.resolve(user));	
		});
	});

	defer.b.promise.then(function (user)
	{
		//get pictures
		fs.readdir('./public/upload', function (err, files)
		{
			var i = 0;

			while (i < files.length)
			{
				var file_username = files[i].split('-')[0];
				if (file_username == username)
				{
					user.pictures.push(files[i]);
				}
				i++;
			}

			//socket.io alert every body that i am connected
		
			io.emit('signup', user.username);
			console.log(io.sockets.clients());	
			//save in database date ? 

			return (defer.c.resolve(user));
		});
	});

	return (defer.c.promise);
};





