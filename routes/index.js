var express = require('express');
var router = express.Router();

var signin_controller = require('../controllers/signin.controller');
var signup_controller = require('../controllers/signup.controller');
var recover_controller = require('../controllers/recover.controller');

var suggestion_controller = require('../controllers/suggestion.controller');
var search_controller = require('../controllers/search.controller');
var notification_controller = require('../controllers/notification.controller');
var profil_controller = require('../controllers/profil.controller');
var modify_controller = require('../controllers/modify.controller');

//signin

router.get('/', signin_controller.get);
router.get('/signin', signin_controller.get);
router.get('/signin/token/:token', signin_controller.get);
router.get('/signin/:state', signin_controller.get);
router.post('/signin', signin_controller.post);

//signup

router.get('/signup', signup_controller.get);
router.post('/signup', signup_controller.post);
router.get('/logout', signup_controller.logout);

//recover

router.get('/recover', recover_controller.get);
router.post('/recover', recover_controller.post);

//suggestion

router.get('/suggestion', suggestion_controller.get);

//TODO MOVE from suggestion message

router.get('/suggestion/conversation', suggestion_controller.get_conversation);
router.get('/suggestion/message/:id', suggestion_controller.get_message);
router.post('/suggestion/message', suggestion_controller.post_message);

//search

router.get('/search', search_controller.get);
router.post('/search', search_controller.post);

//notification

router.get('/notification/:json', notification_controller.get);

//profil

router.get('/profil', profil_controller.me);
router.get('/profil/:username', profil_controller.user);
router.post('/profil/report', profil_controller.report);
router.post('/profil/block', profil_controller.block);
router.post('/profil', profil_controller.like);
router.post('/profil/unlike', profil_controller.unlike);

//modify

router.get('/modify', modify_controller.get);
router.post('/modify/password', modify_controller.post_password);
router.get('/modify/delete/picture/:filename', modify_controller.delete_picture);
router.post('/modify/post/picture', modify_controller.post_picture);
router.post('/modify', modify_controller.post);

module.exports = router;
