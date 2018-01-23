//bug compatibility
//go to suggestion ok go to profil and comme back all compatibility are at 0.
//usera.sex & userb.orientation => undefined 

var connection = require('./connection');
var utils = require('./utils');
var q = require('q');

exports.get_suggestion = function (me)
{
	//call db

	console.log('MODEL ME');
	console.log(me);

	var db = connection.init();
	db.connect();

	var defer = {};
	defer.a = q.defer();
	defer.b = q.defer();
	defer.c = q.defer();

	//retrieve users data from db
	
	db.query('SELECT user.* FROM user WHERE user.id != ? AND user.token = 0', [me.id], function (err, users)
	{
		if (err)
			throw err;
		else
		{
		//	console.log('before drop');
		//	console.log(users);
			return (defer.a.resolve(users));
		}
	});

	defer.a.promise.then(function (users)
	{
		utils.drop_blocked_users(me, users).then(function (users)
		{
		//	console.log('Next block drop');
		//	console.log(users);
			return (defer.b.resolve(users));
		});
		return (defer.c.promise);
	});

	defer.b.promise.then(function (users)
	{
	//	console.log('B users');
	//	console.log(users);
		//complete user
		utils.complete_users(me, users, 1).then(function (users_complete)
		{
	      		return (defer.c.resolve(users_complete));
		});
		return (defer.c.promise);
	});

	//repetition up and down useful ??
	return (defer.c.promise);
};


exports.get_conversation = function (me)
{
	console.log('MODEL CONV');
	console.log(me);
	var db = connection.init();
	db.connect();

	var defer = q.defer();

	db.query('SELECT user.* FROM user, notification WHERE notification.id_user_a = ? AND notification.id_user_b = user.id AND notification.type = 2', [me.id], function (err, users)
	{
		if (err)
			throw err;
		
		utils.complete_users(me, users, 0).then(function (users_complete)
		{
			console.log('USERS COMPLETE');
			console.log(users_complete);
			return (defer.resolve(users_complete));
		});			
		return (defer.promise);
	});
	return (defer.promise);
};

exports.get_message = function (me, id)
{
	var db = connection.init();
	db.connect();

	var defer = q.defer();

	db.query('SELECT * FROM message WHERE (id_user1 = ? AND id_user2 = ?) OR (id_user1 = ? AND id_user2 = ?)', [me.id, id, id, me.id], function (err, messages)
	{
		if (err)
			throw err;
		if (messages.length == 0)
			messages = '{"state" : "no messages available."}';
		console.log('messsages :');
		console.log(messages);
		return (defer.resolve(messages));
	});
	return (defer.promise);
};

exports.post_message = function (me, id, content, io)
{
	var db = connection.init();
	db.connect();

	var defer = q.defer();
	db.query('INSERT INTO message values(NULL, ?, ?, NOW(), ?)', [me.id, id, content], function (err)
	{
		if (err)
			throw err;

		db.query('SELECT user.username FROM user WHERE id = ?', [id], function (err, data)
		{
			if (err)
				throw err;
			io.emit('message', {'usersrc': me.id, 'userdest': id, 'username': data[0].username});
		
		});



		return (defer.resolve('{"state": "ok"}'));
	});

	return (defer.promise);
};
