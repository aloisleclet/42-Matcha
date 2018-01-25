var connection = require('./connection');
var fs = require('fs');
var q = require('q'); 
var utils = require('./utils');

exports.distance = function (pa, pb)
{
	function degtorad(degrees)
	{
		return (degrees * Math.PI / 180);
	}
//	console.log('-->distance');
//	console.log(pa);
//	console.log(pb);
	var point_a = pa;
	var point_b = pb;

	var earth_radius_km = 6371;
	
	var dLat = degtorad(point_b.latitude - point_a.latitude);
	var dLon = degtorad(point_b.longitude - point_a.longitude);
	
	pa_lat = degtorad(point_a.latitude);
	pb_lat = degtorad(point_b.latitude);
	
	var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(pa_lat) * Math.cos(pb_lat); 
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

	var res = Number(earth_radius_km * c).toFixed(0);
	
	return (res);
};

exports.sort = function (list)
{
	var i = 0;
	var tmp = 0;

	//console.log('sorting');

	if (list[i].compatibility === undefined)
	{
		//console.log('NO COMPATTIBILTY to sort');
		return (list);
	}

	function is_sorted(list)
	{
		var i = 0;
		
	//	console.log('check sort');
		while ((i + 1) < list.length)
		{
			if (list[i].compatibility < list[i + 1].compatibility)
				return (false);
			i++;
		}
		return (true);
	}
	
	while (!is_sorted(list))
	{
		while ((i + 1) < list.length)
		{
			//console.log('loop sorting');
			if (list[i].compatibility < list[i + 1].compatibility)
			{
				tmp = list[i];
				list[i] = list[i + 1];
				list[i + 1] = tmp;
			}
			i++;
		}
		i = 0;
		//console.log(list);
	}
	return (list);
};

exports.compatibility = function (usera, userb)
{
//	console.log('----comp test'+usera.name+' '+userb.name);
//	console.log(usera);
//	console.log(userb);
	var compatibility = 0;

	//interests

	var i = 0;
	var j = 0;

	while (i < usera.interest.length)
	{
		while (j < userb.interest.length)
		{
			if (usera.interest[i] == userb.interest[j])
			{
				//console.log('common interest +20');
				compatibility += 20;
			}
			j++;
		}
		j = 0;
		i++;
	}

	//location
	var dist = utils.distance(usera.loc, userb.loc);

//	console.log('DIST');
//	console.log(dist);

	if (dist < 5)
	{
		compatibility += 20;
	//	console.log('dist +20');
	}
	else if (dist < 20)
	{
		compatibility += 10;
	//	console.log('dist +10');
	}
	else if (dist < 50)
	{
	//	console.log('dist +5');
		compatibility += 5;
	}
	//age
	if (usera.birthday != null && userb.birthday != null)
	{
		var diff_age = Math.abs(new Date(usera.birthday).getFullYear() - new Date(userb.birthday).getFullYear());
	//	console.log('diff_age:'+diff_age);
		if (diff_age == 0)
		{
			compatibility += 25;
	//		console.log('age +25');
		}
		else if (diff_age < 5)
		{
			compatibility += 20;
	//		console.log('age +20');
		}
		else if (diff_age < 10)
		{
//			console.log('age +15');
			compatibility += 15;
		}
	}	
	//orientation
	//2 and null => bi

	//for display and debug
	function gen(gender)
	{
		if (gender == 0)
			return ('woman');
		else if (gender == 1)
			return ('man');
		else if (gender == 2 || gender === undefined)
			return ('? or bi');
	}


	if (!(usera.orientation == userb.sex || userb.orientation == usera.sex || usera.orientation == null || usera.orientation == 2 || userb.orientation == null || userb.orientation == 2))
		compatibility = 0;
//	console.log(usera.name+' '+gen(usera.sex)+' attire by '+gen(usera.orientation));
//	console.log(userb.name+' '+gen(userb.sex)+' attire by '+gen(userb.orientation));
//	console.log('---------result '+usera.name+' + '+userb.name+' = '+compatibility+' %');
	return (compatibility);
}

exports.age = function (birthday)
{
	birthday = new Date(birthday);

	return new Number((new Date().getTime() - birthday.getTime()) / 31536000000).toFixed(0);
}

exports.complete_users = function (me, users, sort)
{

	var defer = {};
	defer.a = q.defer();
	defer.b = q.defer();

	var db = connection.init();
	
	if (users.length == 0)
	{
		defer.b.resolve([]);
		return (defer.b.promise);
	}

	//parse loc json & check username
	var i = 0;
	while (i < users.length)
	{
		users[i].loc = JSON.parse(users[i].loc);
		i++;
	}
	//todo check with null values


	//retrieve users interest from db
	var i = 0;
	db.query('SELECT user.id, user.username, tag.label FROM user, tag, user_have_tag WHERE user_have_tag.id_user = user.id AND user_have_tag.id_tag = tag.id;', [users[i].username], function (err, user_interest)
	{
		while (i < users.length)
		{
			if (err)
				throw err;
			var interest = [];
			//console.log('RETRIEVE USERS');
			//console.log(users[i]);
		
			for (var j = 0; j < user_interest.length; j++)
			{
				if (user_interest[j].username == users[i].username)
					interest.push(user_interest[j].label);
			}
			users[i].interest = interest;
			i++;
		}
		//console.log('A');
		return (defer.a.resolve(users));
	});
	
	defer.a.promise.then(function (users)
	{
		//create the list
		var def = q.defer();

		fs.readdir('./public/upload', function (err, files)
		{
			var suggestion = {};
			var i = 0;
			var list = [];

			var to_delete = [];


			// bof delete like you when there is like you in return TODO fix le probleme en amont sql ou model..
			while (i < users.length)
			{
				if (users[i].type == 2)
					to_delete.push(users[i].username);
				i++;
			}

			i = 0;
			while (i < users.length)
			{
				if (users[i].type == 1 && to_delete.indexOf(users[i].username) != -1)
				{
					users.splice(i, 1);
					i--;
				}
				i++;
			}

			// eof
	
			i = 0;
			while (i < users.length)
			{
				var j = 0;
				
				suggestion = {};
			
				suggestion.id = users[i].id;
				suggestion.username = users[i].username;
				suggestion.name = users[i].name;		
				suggestion.age = utils.age(users[i].birthday);
				suggestion.compatibility = utils.compatibility(me, users[i]); // get actual user
				suggestion.image = null;
				suggestion.distance = utils.distance(me.loc, users[i].loc);
				suggestion.pop = users[i].pop;
				suggestion.interest = users[i].interest;
				
				if (users[i].type != undefined)
				{
					//here
					console.log('NOTIFICATION '+i);
					console.log(users[i]);
					//

					var type = users[i].type;
					if (type == 0)
						suggestion.type = "visit your profil."
					else if (type == 1)
						suggestion.type = "like you.";
					else if (type == 2)
						suggestion.type = "like you in return.";
				}
	
				//find image of the user
				while (j < files.length)
				{
					var user = files[j].split('-')[0];
					
					if (user == users[i].username)
					{
						suggestion.image = files[j];
						j = files.length;
					}
					j++;
				}


				//no image = default-image
				if (suggestion.image === null)
					suggestion.image = "default-1.png";
			//	console.log(suggestion);	
				list.push(suggestion);
				i++;
			}
			
			if (sort)
				list = utils.sort(list);
	      		return (defer.b.resolve(list));
		});
		return (defer.b.promise);
	});
	//repetition up and down useful ??
	return (defer.b.promise);
};

exports.drop_blocked_users = function(me, users)
{
	var db = connection.init();
	var defer = q.defer();

	db.query('SELECT id_user_blocked AS id FROM block WHERE id_user = ?', [me.id], function (err, blocked_users)
	{
		if (err)
			throw err;
		else
		{
			//drop users
			var i = 0;
			var j = 0;
	
			while (i < users.length)
			{
				while (j < blocked_users.length)
				{
					if (users[i].id == blocked_users[j].id)
					{
						users.splice(i, 1);
						i--;
					}
					j++;
				}
				j = 0;
				i++;
			}
		}
		return (defer.resolve(users));
	});
	return (defer.promise);
};






















