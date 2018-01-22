var connection = require('./connection');
var q = require('q');
var nodemailer = require('nodemailer');
var crypto = require('crypto');
var os = require('os');

module.exports.new_user = function (name, surname, username, email, password, loc)
{
	//todo create 2 entry for coords location it will be cleaner.
	
	function gen_token(n)
	{
		var token = crypto.randomBytes(Math.ceil(n / 2)).toString('hex');
		return (token);
	}

	//crypt password

	var key = crypto.createCipher('aes-128-cbc', 'password');
	password = key.update(password, 'utf8', 'hex');
	password += key.final('hex');

	var defer = {};
	defer.a = q.defer();
	defer.b = q.defer();

	var db = connection.init();
	db.connect();
	db.query("SELECT id FROM user WHERE username = ? OR email = ? LIMIT 1", [username, email], function (err, res)
	{
		if (err)
			throw err;
		else
			defer.a.resolve(!(res.length > 0));
	});

	defer.a.promise.then(function (username_email_available)
	{
		if (username_email_available)
		{
			var token = gen_token(64);
			console.log(token);
			db.query('INSERT INTO user values(NULL, ?, ?, ?, ?, ?, ?, NULL, NULL, NULL, NULL, ?, NULL)', [name, surname, username, email, password, token, loc], function (err, res)
			{
				if (err)
					throw err;
				else
					defer.b.resolve(true);	
			});

			//init
			var smtp_transport = nodemailer.createTransport(
			{
				service: "gmail",
				host: "smtp.gmail.com",
				auth: {
					user: "aloislsw42@gmail.com",
					pass: "testdev42"
				}	
			});
			
			var mail = {};
			mail.to = email;
			mail.subject = "Match & shop confirmation signin";
			mail.text = 'Confirm the creation of your account here : '+os.hostname()+'/signin/'+token;
			mail.html = 'Confirm the creation of your account here : <a href="http://'+os.hostname()+':7777/signin/token/'+token+'">Click here to confirm</a>';

			//send

			smtp_transport.sendMail(mail, function (err, res)
			{
				if (err)
					throw err;
				else
					console.log('Send: '+res);	
			});
		}		
		else
		{
			defer.b.resolve(false);
		}
		
		connection.end(db);
	});

	return (defer.b.promise);	
};

module.exports.confirmation_user = function (token)
{
	var defer = q.defer();
	var db = connection.init();
	
	db.connect();

	db.query('UPDATE user SET token = 0 WHERE token = ?', [token], function (err, res)
	{
		if (err)
		{
			throw err;
			defer.resolve(false);
		}
		else
		{	
			defer.resolve(true);
		}	
	});

	return (defer.promise);
};
