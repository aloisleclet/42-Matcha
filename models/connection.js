var mysql = require('mysql');

exports.init = function ()
{
	var db = mysql.createConnection(
	{
		host: 'localhost',
		user: 'root',
		password: 'thisisit',
		database: 'matcha'
	});
	return (db);
}

exports.end = function (db)
{
	db.end();
};

