$(document).ready(function ()
{
	console.log('js enable');

	//utils

	function whoami()
	{
		if (window.localStorage.getItem('me') != undefined)
			me = window.localStorage.getItem('me');
		else
			me = "visitor";
		console.log('whoami');
		console.log(me);
		return (me);
	};

	//CONVERSATION
	
	function get_conversation()
	{
		var data = {};

		$.ajax({url: '/suggestion/conversation' , method: 'GET', data: data, success: function (conversations)
		{
			print_conversation(JSON.parse(conversations));
		}});
	};


	function print_conversation(conversations)
	{
		var i = 0;
		var html = '';
	
		while (i < conversations.length)
		{
			html +=	'<div class="friend" style="background-image:url(\'/upload/'+conversations[i].image+'\')" data-id="'+conversations[i].id+'" data-username="'+conversations[i].username+'"></div>';				
			i++;
		}

		$('#friends').html(html);

		//events	
		$('.friend').on('click', function ()
		{
			$('.friend').each(function ()
			{
				$(this).removeClass('friend-select');
			});

			if (friend_click % 2 == 0)
			{
				$('.wrap-msg').animate({'height' : wrap_msg_height+'px', 'width' : wrap_msg_width+'px'}, 400, function ()
				{
					var wrap = document.getElementById("conversation");
					wrap.scrollTop = wrap.scrollHeight;
				});
				$(this).addClass('friend-select');
				
				var id = $(this).attr('data-id');
				var username = $(this).attr('data-username');
				$('#postmessage').attr('data-username', username);
				console.log('friends '+id+'('+username+')');
				get_message(id);
			}
			else
			{
				$('.wrap-msg').animate({'height' : '0px', 'width' : '0px'}, 400);
				//todo change when you click on other friend open directly a new chat box
			}
			friend_click++;
		});
	};

	//MESSAGE
	
	function get_message(id)
	{
		if (id != undefined)
		{
			var data = {};
			$.ajax({url: '/suggestion/message/'+id, type: 'GET', success: function (messages)
			{
				print_message(messages, id);
				
			}, error: function (state, error)
			{
				console.log('ERROR messages: ');
				console.log(state);
				console.log(error);
			}});
		}
	};

	function print_message(messages, id)
	{
		var i = 0;
		var html = '<div class="line"></div>';

		$('#postmessage').attr('data-id', id);

		while (i < messages.length)
		{
			if (id == messages[i].id_user1)
				who = "me";
			else
				who = "other";
			html += '<div class="line"><div class="msg '+who+'"><p>';
			html += messages[i].content;
			html += '</p></div></div>';
					
			i++;
		}
		$('#conversation').html(html);
		var wrap = document.getElementById("conversation");
		wrap.scrollTop = wrap.scrollHeight;
	}
	

	function post_message(id, recipient, content)
	{
		var data = {'id': id, 'recipient': recipient, 'content': content};

		if (id != undefined && content != "")
		{
			$.ajax({url: '/suggestion/message/', type: 'POST', data: data, success: function (state)
			{
			}, error: function (state, error)
			{
				console.log(' -> ERROR: ');
				console.log(state);
				console.log(error);
			}});
		}		
	};

	//NOTIFICATIONS

	function clear_message_bubble(id)
	{
		var notifications = get_notifications();
		var i = 0;
		console.log('NOTIF BEFORE');
		console.log(notifications);

		while (i < notifications[me].message.length)
		{
			var current_id = Number(notifications[me].message[i].usersrc);
			console.log(i);
			if (notifications[me].message[i].usersrc == id)
			{
				notifications[me].message.splice(i, 1);
				console.log('DELETE :'+i);
			}
			else
				i++;
		}

		window.localStorage.setItem('notifications', JSON.stringify(notifications));
		update_bubble();

		$('.friend').each(function ()
		{
			var current_id = $(this).attr('data-id');
			if (current_id == Number(id))
			{
				$(this).removeClass('new-msg');
			}
		});
	};	

	function get_notifications()
	{
		var me = whoami();
		var notifications = {};
		
		if (window.localStorage.getItem('notifications') != undefined)
		{
			notifications = JSON.parse(window.localStorage.getItem('notifications'));
		}
		else
		{
			console.log('INIT STORAGE '+me);
			notifications[me] = {'like': [], 'visit': [], 'message': []};
		}
		window.localStorage.setItem('notifications', JSON.stringify(notifications));

		return (notifications);
	}

	function update_bubble()
	{
		//refresh bubbles top and bottom
		var me = whoami();
		var notifications = get_notifications();
		
		if (notifications[me] != undefined)
		{
			var notif = notifications[me];
			var nb = notif.like.length + notif.visit.length;
			var nb_message = notif.message.length;
			if (nb != 0)
				$('#bubble').removeClass('hidden');
			else
				$('#bubble').addClass('hidden');

			$('#value').text(nb);

			if (nb_message != 0)
			{
				nb_message = (nb_message > 99) ? 99 : nb_message;
				$('#msg').html('<div id="bubble" class="bubble"><p id="value">'+nb_message+'</p></div>');
			}
			else
				$('#msg').html('');
		}
	}

	function new_notification(data)
	{
		var notifications = get_notifications();
		if (data.hasOwnProperty('liked'))
			notifications[me].like.push(data);
		else if (data.hasOwnProperty('visited'))
			notifications[me].visit.push(data);	
		else if (data.hasOwnProperty('recipient'))
			notifications[me].message.push(data);
		window.localStorage.setItem('notifications', JSON.stringify(notifications));
		
		$('.friend').each(function ()
		{
			var id = $(this).attr('data-id');
			if (data.usersrc == Number(id))
			{
				$(this).addClass('new-msg');
				get_message(data.usersrc);
			}
		});

		update_bubble();
	}

	function clean_notification()
	{
		var notifications = get_notifications();
			notifications[me] = {'like': [], 'visit': [], 'message': []};
		window.localStorage.setItem('notifications', JSON.stringify(notifications));
		update_bubble();
	}

	//SORT
	
	function refresh_chosen()
	{
		var interest = $('#interest').val();
		interest = interest.trim();
		var tag = interest.split(" ");
		
		var html = "";
		for (var i = 0; i < tag.length; i++)
		{
			html += '<div class="tag" id="tag'+i+'">'+tag[i]+'</div>';
		}

		$('#chosen').html(html);
	}

	function match_interest(intera, interb)
	{
		console.log(intera);
		console.log(interb);
		var i = 0;
		var j = 0;

		var match = 0;
		while (i < intera.length)
		{
			while (j < interb.length)
			{
				console.log(intera[i]+' =?= '+ interb[j]);
				if (intera[i] == interb[j])
					match++;
				if (match == intera.length)
				{
					i = intera.length;
					j = interb.length;	
				}
				j++;
			}
			j = 0;
			i++;
		}

		if (intera == 'All' || match == intera.length)
			return (true);
		else
			return (false);
	}

	//sort by age pop loc interest

	function print_people(people)
	{
		var html = "";
		var i = 0;
		console.log('print_people');
		console.log(people);
		while (i < people.length)
		{
			var p = people[i];
			console.log(p);
			html += '<a href="/profil/'+p.username+'"><div class="people" data-image="'+p.image+'" data-age="'+p.age+'" data-distance="'+p.distance+'" data-pop="'+p.pop+'" data-interest="'+p.interest+'" data-compatibility="'+p.compatibility+'" data-name="'+p.name+'" data-username="'+p.username+'"><div class="pic" style="background-image:url(\'/upload/'+p.image+'\')"></div><h3>'+p.name+', '+p.age+' yo</h3><h4>'+p.distance+' km, '+p.compatibility+' %</h4><p class="hidden">'+p.interest+'</p></div></a>';
			i++;
		}
		$('#list').html(html);	
	}

	function get_me()
	{
		me = {};
		me.interest = $('#me').attr('data-interest').split(',');
		
		return (me);
	}

	function get_people()
	{
		var people = [];

		$('.people').each(function ()
		{
			var p = {};
			p.name = $(this).attr('data-name');
			p.username = $(this).attr('data-username');
			p.image = $(this).attr('data-image');
			p.compatibility = $(this).attr('data-compatibility');
			p.age = $(this).attr('data-age');
			p.distance = $(this).attr('data-distance');
			p.pop = $(this).attr('data-pop');
			if ($(this).attr('data-interest').split(','))
				p.interest = $(this).attr('data-interest').split(',');
			else	
				p.interest = 'All';
			people.push(p);
		});

		return (people);		
	}

	function calc_common_interest(people)
	{
		var me = get_me();
		
		var nb = 0;
		var i = 0;
		var j = 0;
		var k = 0;
		while (k < people.length)
		{
			console.log(me.interest);
			console.log(people[k].interest)
			while (i < people[k].interest.length)
			{
				while (j < me.interest.length)
				{
					if (people[k].interest[i] == me.interest[j])
						nb++;
					j++;
				}
				j = 0;
				i++;
			}
			people[k].common_interest = nb;
			k++;
		}
		return (people);
	}

	function is_sorted(option, people, order)
	{
		console.log('is_sorted '+option);
		console.log(people);
		var i = 0;

		while ((i + 1) < people.length)
		{
			if (order == 'ASC' && Number(people[i][option]) > Number(people[(i + 1)][option]))
				return (false);
			else if (order == 'DESC' && Number(people[i][option]) < Number(people[(i + 1)][option]))
				return (false);
			i++;
		}
		return (true);
	}

	function sort_by(select)
	{
		var people = get_people();

		var options = ['age', 'pop', 'distance', 'interest', 'All'];
		var option = options[select];
		var i = 0;
		var tmp = 0;

		console.log('sort_by');
		console.log('option: '+option);			
	
		if (select == 2)
			option = 'distance';
		else if (select == 3)
		{
			people = calc_common_interest(people);
			option = 'common_interest';
		}

		order = (select == 0 || select == 2) ? 'ASC' : 'DESC';

		while (!is_sorted(option, people, order))
		{
			while ((i + 1) < people.length)
			{
				console.log(order);
				if (order == 'ASC' && Number(people[i][option]) > Number(people[(i + 1)][option])) // ASC
				{
					tmp = people[i];
					people[i] = people[(i + 1)];
					people[(i + 1)] = tmp;
				}
				else if (order == 'DESC' && Number(people[i][option]) < Number(people[(i + 1)][option])) // DESC
				{
			//		console.log('sorting -> '+i+' | a('+Number(people[i][option])+') < b('+Number(people[(i + 1)][option])+')');
			//		console.log('people a');		
			//		console.log(people[i]);
			//		console.log('people b');		
			//		console.log(people[(i + 1)]);
					
					tmp = people[i];
					people[i] = people[(i + 1)];
					people[(i + 1)] = tmp;

				}
			//		console.log('THEN');
			//		console.log('people a');		
			//		console.log(people[i]);
			//		console.log('people b');		
			//		console.log(people[(i + 1)]);
			//		console.log('-----');
				i++;	
			}
			i = 0;
		}

		print_people(people);
	}

	function filter(age, pop, loc, interest)
	{
		console.log(age);
		console.log(pop);
		console.log(loc);
		console.log(interest);

		var ages = [[16, 18], [18, 23], [23, 28], [28, 35], [35, 999], [0, 999]];
		var pops = [[0, 250], [250, 500], [500, 750], [750, 1000], [1000, 99999], [0, 999999]];
		var locs = [10, 20, 30, 40, 100000, 100000];

		var peoples = [];

	//	var current_user_interest = $('#user').val();
	//	console.log(current_user_interest);
		
		interest = interest.split(' ');
		interest = (interest == '') ? 'All' : interest;
		$('.people').each(function ()
		{
			var people = {};
			people.age = $(this).attr('data-age');
			people.loc = $(this).attr('data-loc');
			people.pop = $(this).attr('data-pop');

			console.log($(this).attr('data-interest'));	
			if ($(this).attr('data-interest') != undefined)
			{	
				var people_inter = $(this).attr('data-interest');
				console.log('|'+people_inter+'|');
				people.interest = people_inter.split(',');
			}
			else
			{
				people.interest = 'All';
			}

			console.log(people);

			if (ages[age][0] <= people.age && people.age <= ages[age][1] && people.loc <= locs[loc] && pops[pop][0] <= people.pop && people.pop <= pops[pop][1] && match_interest(interest, people.interest))
			{
				peoples.push(people);
				$(this).removeClass('hidden');
				console.log('VISIBLE');
				console.log(people);
			}
			else
			{
				$(this).addClass('hidden');
				console.log('HIDDEN');
				console.log(people);
			}
		});
	}
	
	//parser uri
	
	var uri = document.location.href;
	var parser = document.createElement('a');
	parser.href = uri;

	//var 
	
	var msg_click = 0;
	var friend_click = 0;
	var advanced_click = 0;
	var me = whoami();

	//main


	if (parser.pathname == '/suggestion' || parser.pathname == '/search') //suggestion view
	{
		if (parser.pathname == '/search')
		{
			advanced_click = 0;
			$('.search-wrap').animate({'width' : '100%'}, 1000);
			$('#hide-search').on('click', function ()
			{	
				$('.search-wrap').animate({'width' : '0%'}, 1000);
			});

			$('#search').keyup(function (e)
			{
				var search = $('#search').val();
				if (e.keyCode == 13 && search != "")
				{
					console.log('searching: '+search);
					var data = {'search': search};
					$.ajax({url: '/search', method: 'POST', data: data, success: function (people)
					{
						print_people(people);
					}});
				}
			});
		}
	
		var advanced_open = false;
		
		$('#interest').on('change', refresh_chosen);
		$('#advanced .title').on('click', function ()
		{
			if (!advanced_open)
			{
				$('#advanced').animate({'height' : '620px'}, 1000);
				$('.refine-wrap').animate({'width' : '100%'}, 1000);
				advanced_open = true;
			}
		});

		$('#refine').on('click', function ()
		{
			var age_select = $('#age').val();
			var popularity_select = $('#popularity').val();
			var loc_select = $('#loc').val();
			var interest_select = $('#interest').val();
			
			console.log(age_select);
			console.log(popularity_select);
			console.log(loc_select);

			filter(age_select, popularity_select, loc_select, interest_select);	
			
			$('#advanced').animate({'height' : '32px'}, 1000);
			$('.refine-wrap').animate({'height' : '0px'}, 1000);
			advanced_open = false;
		});

		$('#sort').on('change', function ()
		{
			var sort_select = $('#sort').val();
			console.log('onchange value: '+sort_select);
			
			sort_by(sort_select);
		});
	}
	else if (parser.pathname == '/match') //match view to do change to /notification
	{
		clean_notification();													
	}
	else if (parser.pathname == '/modify') //modify view
	{
	
		$('#interest').on('change', refresh_chosen);

		$('#bio').on('blur', function ()
		{
			console.log($('#bioval').val());
			$('#bioval').val($('#bio').text());
		});
	}
	else if (parser.pathname == '/signin' || parser.pathname == '/') //signin view
	{
		console.log('geoloc');
	
		function fallback_location()
		{
			console.log('NO USER PERMISSION, OR GEOLOCATION OBJECT NOT AVAILABLE');
			$.ajax({url: 'https://ipinfo.io/json', method: 'GET', data: {}, success: function (res)
			{

				var coords = res.loc.split(',');
				var lat = Number(coords[0]).toFixed(6);
				var lon = Number(coords[1]).toFixed(6);

				console.log('lat: '+lat+' lon: '+lon);
				$('#loc').val('{"latitude":'+lat+', "longitude": '+lon+'}');
			}});
		}

		if (navigator.geolocation)
		{
			navigator.geolocation.getCurrentPosition(function (position)
			{
				console.log('get');
			
				var lat = Number(position.coords.latitude).toFixed(6);
				var lon = Number(position.coords.longitude).toFixed(6);
				console.log(coords);
				$('#loc').val('{"latitude":'+lat+', "longitude": '+lon+'}');
				//to do : wait this before to render the submit button usable
			}, fallback_location());
		}
		else
		{
			fallback_location();
		}	
	}
	else if (parser.pathname.substr(0, 7) == '/profil')
	{
		$('#like').on('click', function ()
		{
			console.log('click');
		
			var button = $(this);
			var data = {};
	
			data.id = button.attr('data-id');
			data.username = button.attr('data-username');

			console.log(data);
			$.ajax({url: '/profil', method: 'POST', data: data, success: function (res)
			{
				console.log(res);
				if (res.state == 'ok')
				{
					button.addClass('hidden');
					$('#unlike').removeClass('hidden');
				}
				else if (res.state == 'redirect')
				{
					document.location.href = "/signup";	
				}
			}});
		});
		
		$('#unlike').on('click', function ()
		{
			var button = $(this);
			var data = {};
			data.id = button.attr('data-id');

			$.ajax({url: '/profil/unlike', method: 'POST', data: data, success: function (res)
			{
				console.log(res);
				if (res.state == 'ok')
				{
					$('#like').removeClass('hidden');
					$('#unlike').addClass('hidden');
				}
			}}); 	
		});
	
		$('#report').on('click', function ()
		{
			var button = $(this);
			var data = {};
			data.id = button.attr('data-id');
			
			$.ajax({url: '/profil/report', method: 'POST', data: data, success: function (res)
			{
				console.log(res);
				if (res.state == 'ok')
				{
					alert('The profil is reported succefully.');
				}
			}}); 	
		});

		$('#block').on('click', function ()
		{
			var button = $(this);
			var data = {};
			data.id = button.attr('data-id');

			$.ajax({url: '/profil/block', method: 'POST', data: data, success: function (res)
			{
				console.log(res);
				if (res.state == 'ok')
				{
					alert('The profil is blocked succefully.');
				}
			}}); 	
		});
	}
	else if (parser.pathname == '/signup')
	{
		$('#signup').on('click', function ()
		{
			window.localStorage.setItem('me', $('#username').val());
			me = $('#username').val();
			console.log(me+' is login on this window.');
		});	
	}
	
	if (whoami() != 'visitor') // when login
	{
		get_conversation();
		update_bubble();
	}

	//socket.io

	if (parser.pathname == '/suggestion' || parser.pathname == '/search' || parser.pathname == '/match' || parser.pathname.substr(0, 7) == '/profil')
	{
		var socket = io();
		var i = 0;
	
		socket.on('signup', function (user)
		{
			i++;
			console.log('SIGNUP '+user+' ('+i+' connected)');
		});

		socket.on('visit', function (data)
		{
			if (data.visited == me)
				new_notification(data);
		});
		
		socket.on('like', function (data)
		{
			if (data.liked == me)
				new_notification(data);
		});
		
		socket.on('message', function (data)
		{
			if (data.recipient == me)
				new_notification(data);
		});
	}

	//all view

	console.log(parser.pathname);	

	var friends_height = window.innerHeight - 130;	
	
	var wrap_msg_height = window.innerHeight - 26;
	var wrap_msg_width = window.innerWidth - 96;

	console.log(friends_height);

	$('#logout').on('click', function ()
	{
		me = "";		
	});
	
	$('#msg').on('click', function ()
	{
		if (msg_click % 2 == 0)
		{
			get_message($(this).attr('data-id'));

			$('#friends').animate({'bottom' : '30px'}, 400);
		}
		else
		{
			$('#friends').animate({'bottom' : '-1000px'}, 400);
			if (friend_click % 2 != 0)
			{
				$('.wrap-msg').animate({'height' : '0px', 'width' : '0px'}, 400);
				friend_click++;
			}

		}
		msg_click++;
	});

	$('#postmessage').on('click', function ()
	{
		var id = $(this).attr('data-id');
		clear_message_bubble(id);	
	});

	$('#postmessage').keyup(function (e)
	{
		if (e.keyCode == 13)
		{
			var content = $('#postmessage').val();
			var id = $(this).attr('data-id');
			var recipient = $(this).attr('data-username');

			post_message(id, recipient, content);
			get_message(id);

			$('#postmessage').val("");
		}
	});

	window.scrollTo(0, 2); 
});
