var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var expressJWT = require('express-jwt');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

var userController = require('./server/user/user.controller');
var uploadController = require('./server/upload/upload.controller');
var commentController = require('./server/comment/comment.controller');
var notificationController = require('./server/notification/notification.controller');

var app = express();

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI);

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'https://clemango.herokuapp.com/');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Authorization, Content-Type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});
app.use(bodyParser.json());
app.use(expressJWT({ secret: process.env.JWT_SECRET })
	.unless({ path: 	['/user/login',
						'/user/getInfoByEmail',
						'/user/sendPasswordReset',
						'/user/resetPassword',
						'/user/checkEmail',
						'/user/signup',
						'/user/checkUser',
						'/user/getUser',
						'/uploads/getFirstPublicUploads',
						'/uploads/getNextPublicUploads',
						'/uploads/searchPublic',
						'/uploads/checkUpload',
						'/uploads/getUpload',
						'/uploads/getFirstUserPublicUploads',
						'/uploads/getNextUserPublicUploads',
						'/comments/getComments',
						'/comments/getFirstUserPublicComments',
						'/comments/getNextUserPublicComments',]}));

// User
app.post('/user/login', userController.logInUser);
app.post('/user/getInfoByEmail', userController.getInfoByEmail);
app.post('/user/sendPasswordReset', userController.sendPasswordReset);
app.post('/user/resetPassword', userController.resetPassword);
app.post('/user/checkEmail', userController.checkEmail);
app.post('/user/signup', userController.signUpUser);
app.post('/user/signUser', userController.signUserImage);
app.put('/user/saveSetup', userController.saveUserSetup);
app.post('/user/changePassword', userController.changePassword);
app.post('/user/deleteUser', userController.deleteUser);
app.post('/user/checkUser', userController.checkUser);
app.post('/user/getUser', userController.getUserInfo);
app.post('/user/postUploadKarma', userController.postUploadKarma);
app.post('/user/giveKarma', userController.giveUserKarma);
app.post('/user/removeUpvoteKarma', userController.removeUpvoteKarma);
app.post('/user/removeUploadKarma', userController.removeUploadKarma);
app.post('/user/searchUsers', userController.searchUsers);
app.post('/user/addSuggestedUser', userController.addSuggestedUser);
app.post('/user/addSuggestedEmails', userController.addSuggestedEmails);

// Uploads
app.get('/uploads/getFirstPublicUploads', uploadController.getFirstPublicUploads);
app.post('/uploads/getNextPublicUploads', uploadController.getNextPublicUploads);
app.post('/uploads/searchPublic', uploadController.searchPublicUploads);
app.post('/uploads/checkUpload', uploadController.checkUpload);
app.post('/uploads/getUpload', uploadController.getUpload);
app.post('/uploads/signUpload', uploadController.signUpload);
app.post('/uploads/postUpload', uploadController.postUpload);
app.put('/uploads/saveUpload', uploadController.saveUpload);
app.post('/uploads/deleteUploadByUpload', uploadController.deleteUploadByUpload);
app.post('/uploads/deleteUploadsByUser', uploadController.deleteUploadsByUser);
app.post('/uploads/getFirstUserUploads', uploadController.getFirstUserUploads);
app.post('/uploads/getNextUserUploads', uploadController.getNextUserUploads);
app.post('/uploads/getFirstUserPublicUploads', uploadController.getFirstUserPublicUploads);
app.post('/uploads/getNextUserPublicUploads', uploadController.getNextUserPublicUploads);
app.post('/uploads/addUserInvitations', uploadController.addUserInvitations);
app.post('/uploads/addEmailInvitations', uploadController.addEmailInvitations);
app.post('/uploads/sendEmailInvitation', uploadController.sendEmailInvitation);

// Comments
app.post('/comments/getComments', commentController.getComments);
app.post('/comments/postComment', commentController.postComment);
app.post('/comments/postReply', commentController.postReply);
app.post('/comments/upvoteComment', commentController.upvoteComment);
app.post('/comments/removeUpvote', commentController.removeUpvote);
app.post('/comments/deleteCommentsByUpload', commentController.deleteCommentsByUpload);
app.post('/comments/deleteCommentsByUser', commentController.deleteCommentsByUser);
app.post('/comments/getFirstUserComments', commentController.getFirstUserComments);
app.post('/comments/getNextUserComments', commentController.getNextUserComments);
app.post('/comments/getFirstUserPublicComments', commentController.getFirstUserPublicComments);
app.post('/comments/getNextUserPublicComments', commentController.getNextUserPublicComments);
app.put('/comments/makeCommentsPublic', commentController.makeCommentsPublic);
app.put('/comments/makeCommentsPrivate', commentController.makeCommentsPrivate);

// Notifications
app.post('/notifications/addNotification', notificationController.addNotification);
app.post('/notifications/deleteNotificationsByUpload', notificationController.deleteNotificationsByUpload);
app.post('/notifications/deleteNotificationsByUser', notificationController.deleteNotificationsByUser);
app.post('/notifications/getFirstNotifications', notificationController.getFirstNotifications);
app.post('/notifications/getNextNotifications', notificationController.getNextNotifications);
app.post('/notifications/getNewNotifications', notificationController.getNewNotifications);
app.post('/notifications/clearNewNotifications', notificationController.clearNewNotifications);
app.post('/notifications/getLatestNotifications', notificationController.getLatestNotifications);


app.listen(process.env.PORT || '5000', function() {
	console.log("clemango api is running");
});