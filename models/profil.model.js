var connection = require('./connection');
var utils = require('./utils');
var q = require('q');
var fs = require('fs');

// get user in order to generate profil of an other user of the current user
exports.get_user = function (username, me, io)
{
	var defer = {};
	defer.a = q.defer();
	defer.b = q.defer();
	defer.c = q.defer();

	var db = connection.init();
	db.connect();

	var liked = [];

	//save notification
	if (me != undefined)
	{
		//socket.io

		io.emit('visit', {'visitor': me.username, 'visited': username});				

		db.query('INSERT INTO notification values(?, (SELECT id FROM user WHERE user.username = ?), 0, NOW())', [me.id, username]);
		db.query('UPDATE user SET pop = pop + 2 WHERE user.username = ?', [username]);

		db.query('SELECT user.username FROM user, notification WHERE user.id = notification.id_user_b AND type = 1 AND notification.id_user_a = ?', [me.id], function (err, res)
		{
			if (err)
				throw err;
			var i = 0;
			while (i < res.length)
			{
				liked.push(res[i].username);	
				i++;
			}
			console.log('liked');
			console.log(liked);	
		});
	}
	else
	{
		db.query('UPDATE user SET user.pop = user.pop + 1 WHERE user.username = ?', [username]);
	}	

	db.query('SELECT user.* FROM user WHERE user.username = ? AND token = 0', [username], function(err, res)
	{
		if (err)
			throw err;
		return (defer.a.resolve(res));
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
			user.loc = JSON.parse(user.loc);
			if (!me || me == "" || me === undefined)
				user.compatibility = "?";
			else
				user.compatibility = utils.compatibility(me, user);
			user.age = utils.age(user.birthday);
			user.liked = 0;
			//user.distance = utils.distance(me.loc, user.loc);
			//bug here when you call directly the page ?

			if (liked.indexOf(user.username) != -1) // ??
				user.liked = 1;
	
			connected_users = [];//todo replace by the real wtf is that ??
	
			return (defer.c.resolve(user));
		});
		return (defer.c.promise);
	});
	return (defer.c.promise);
};

exports.like = function (me, id, username, io)
{
	var defer = q.defer();
	var db = connection.init();
	db.connect();

	//save notification
	if (me != undefined)
	{
		io.emit('like', {'liker': me.username, 'liked': username});
		db.query('UPDATE user SET pop = pop + 3 WHERE user.id = ?', [id]);
		db.query('INSERT INTO notification values(?, ?, 1, NOW())', [me.id, id], function (err)
		{
			if (err)
				throw err;
	
			//check here if it's a double match  
		
			//here problem	?
			db.query('SELECT * FROM notification WHERE (id_user_a = ? OR id_user_a = ?) AND (id_user_b = ? OR id_user_b = ?) AND type = 1', [me.id, id, id, me.id], function (err, res)
			{
				if (err)
					throw err;
					
				console.log(res);
			
				if (res.length > 1 && res[0].id_user_a == res[1].id_user_b && res[0].id_user_b == res[1].id_user_a)
					db.query('INSERT INTO notification(id_user_a, id_user_b, type, date) VALUES (?, ?, 2, NOW()), (?, ?, 2, NOW()); ', [res[0].id_user_a, res[0].id_user_b, res[0].id_user_b, res[0].id_user_a]);
			});
		
			// --- 
		
			return (defer.resolve(1));
		});
	}
	else
	{
		defer.resolve(0);
	}
	return (defer.promise);
};

exports.unlike = function (me, id, username, io)
{
	var db = connection.init();
	var defer = q.defer();
	
	io.emit('unlike', {'unliker': me.username, 'unliked': username});

	db.query('DELETE FROM notification WHERE id_user_a = ? AND id_user_b = ? AND type = 1 OR type = 2', [me.id, id], function (err, state)
	{
		if (err)
			throw err;
		return (defer.resolve(state));
	});
	return (defer.promise);
};

exports.get_notification = function (me)
{
	var db = connection.init();
	var defer = q.defer();

	db.query('SELECT user.*, notification.type FROM user, notification WHERE id_user_b = (SELECT id FROM user WHERE username = ?) AND id_user_a = user.id AND (notification.type = 0 OR notification.type = 1)', [me.username], function (err, list)
	{
		if (err)
			throw err;
		utils.drop_blocked_users(me, list).then(function (notifications_refined)
		{	
			utils.complete_users(me, notifications_refined).then(function (notifications)
			{
				return (defer.resolve(notifications));
			});
		});
	});
	return (defer.promise);
};

exports.report = function (me, id)
{
	var db = connection.init();
	var defer = q.defer();
	db.query('INSERT INTO report values(?, ?, NOW())', [me.id, id], function(err)
	{
		if (err)
			throw err;
		return (defer.resolve(1));
	});
	return (defer.promise);
};

exports.block = function (me, id)
{
	var db = connection.init();
	var defer = q.defer();
	db.query('INSERT INTO block values(?, ?, NOW())', [me.id, id], function(err)
	{
		if (err)
			throw err;
		return (defer.resolve(1));
	});
	return (defer.promise);
};

