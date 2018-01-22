create database if not exists matcha;

use matcha;

drop table if exists user;
drop table if exists tag;
drop table if exists user_match;
drop table if exists message;
drop table if exists user_have_tag;

create table user
(
	id int(12) not null auto_increment primary key,
	name varchar(50) not null,
	surname varchar(50) not null,
	username varchar(50) not null,
	email varchar(50) not null,
	password varchar(64) not null,
	token varchar(64),
	birthday date default '1000-10-10',
	sex int(2) default 2,
	orientation int(2) default 2,
	bio varchar(300) default 'Once upon a time',
	loc varchar(100) default '?',
	score int(3) default 0
);

create table tag
(
	id int(12) not null auto_increment primary key,
	label varchar(50) not null UNIQUE
);

create table user_have_tag
(
	id_user int(12) not null,
	id_tag int(12) not null,
	CONSTRAINT UC_ust UNIQUE (id_user, id_tag)
);

create table notification 
(
	id_user_a int(12) not null,
	id_user_b int(12) not null,
	type int(2),
	date datetime not null
);

create table report
(
	id_user int(12) not null,
	id_user_reported int(12) not null,
	date datetime not null
);

create table block
(
	id_user int(12) not null,
	id_user_blocked int(12) not null,
	date datetime not null
);

create table message
(
	id int(12) not null auto_increment primary key,
	id_user1 int(12) not null,
	id_user2 int(12) not null,
	date_send datetime,
	content varchar(200)
);
