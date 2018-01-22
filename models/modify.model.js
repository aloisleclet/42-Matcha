var connection = require('./connection');

var q = require('q');
var crypto = require('crypto');
var multer = require('multer');
var fs = require('fs');

module.exports.update_user = function (name, surname, username, last_username, email, sex, orientation, bio, birthday, interest, loc)
{
	//todo bug in update tag 

	var defer = q.defer();
	var db = connection.init();

	
	db.connect();
	db.query("UPDATE user SET name = ?, surname = ?, username = ?, sex = ?, email = ?, orientation = ?, bio = ?, birthday = ?, loc = ? WHERE username = ?", [name, surname, username, sex, email, orientation, bio, birthday, loc, last_username], function (err, res)
	{
		if (err)
			throw err;
		else
			defer.resolve(res);
	});

	//interest manage
	
	//todo drop the deleted interest	
	interest = interest.trim();
	console.log(interest);
	var tags = interest.split(' ');

	var sql = 'DELETE FROM user_have_tag WHERE id_user = (SELECT id FROM user WHERE username = ?)';
	db.query(sql, [last_username]);

	for (var i = 0; i < tags.length; i++)
	{
		sql = "INSERT IGNORE INTO tag(id, label) values(NULL, ?)";
		db.query(sql, [tags[i], tags[i]]);
		
		sql = "INSERT IGNORE INTO user_have_tag(id_user, id_tag) values((SELECT id FROM user WHERE username = ?), (SELECT id FROM tag WHERE label = ?))";
		db.query(sql, [username, tags[i]]);
	}

	return (defer.promise);
};

module.exports.update_password = function (username, password)
{
	var defer = q.defer();
	var db = connection.init();
	
	db.connect();
	
	var key = crypto.createCipher('aes-128-cbc', 'password');
	password = key.update(password, 'utf8', 'hex');
	password += key.final('hex');
	
	db.query("UPDATE user SET password = ? WHERE username = ?", [password, username], function (err, res)
	{
		if (err)
			throw err;
		else
			defer.resolve(res);
	});
	
	return (defer.promise);
};

module.exports.upload_picture = function (req, res, username)
{
	//sometimes error server ? |

	console.log('username: '+username);
	var defer = q.defer();
	fs.readdir('./public/upload', function (err, files)
	{
		var pictures = [];
		if (err)
			throw err;

		var i = 0;
		var last_i = 0;
		while (i < files.length)
		{
			var user = files[i].split('-')[0];
			if (user == username)
			{
				pictures.push(files[i]);
				console.log(files[i]);
				console.log('pictures');
				console.log(pictures);
				last_i = (files[i].split('-')[1]).split('.')[0];
			}
			i++;
		}

		//display notifcation max picture
		if (last_i >= 5)
		{
			console.log('too much picture');
			defer.resolve('Too much picture');
		}
		else
		{
			//upload
			var storage = multer.diskStorage(
			{
				destination: function (req, file, callback)
				{
					callback(null, './public/upload');	
				},
				filename: function (req, file, callback)
				{
					console.log(file);
					var tab = file.originalname.split('.');
					var last = tab.length - 1;
					var extension = tab[last];
					last_i++;
					callback(null, req.session.user+'-'+last_i+'.'+extension);
				}
			});
			
			var upload = multer({storage: storage}).single('picture');
			
			upload(req, res, function (err)
			{
				if (err)
					throw err;
				else
					defer.resolve('Picture upload !');
			});
		}
	});
	return (defer.promise);
};

module.exports.delete_picture = function (filename, username)
{
	var defer = q.defer();

	fs.unlink('./public/upload/'+filename, function (err)
	{
		if (err)
			throw err;
		fs.readdir('./public/upload', function (err, files)
		{
			var pictures = [];
			if (err)
				throw err;
	
			var i = 0;
			while (i < files.length)
			{
				var user = files[i].split('-')[0];
				var ext = files[i].split('.')[1];
				if (user == username)
				{
					pictures.push(files[i]);
					var new_path = './public/upload/'+user+'-'+i+'.'+ext;
					var old_path = './public/upload/'+files[i];
					fs.rename(old_path, new_path, function (err)
					{
						if (err)
							throw err;
					});
				}
				i++;
			}
		});
		defer.resolve('Picture deleted.');	
	});
	return (defer.promise);

};
