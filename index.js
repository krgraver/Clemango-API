var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var expressJWT = require('express-jwt');
var fs = require('fs');
var AWS = require('aws-sdk');

var userController = require('./server/controllers/user-controller');
var uploadController = require('./server/controllers/upload-controller');

var app = express();

var constant = require('./server/config/constants');
mongoose.connect(constant.MONGODB_URI);

app.use(bodyParser.json());
app.use(expressJWT({ secret: 'clemangos are juicy' })
	.unless({ path: ['/login', '/signup', '/uploads/getAll', '/uploads/getOne']}));

// User
app.post('/login', userController.logInUser);
app.post('/signup', userController.signUpUser);

// Uploads
app.get('/uploads/getAll', uploadController.getAllUploads);
app.post('/uploads/getOne', uploadController.getUpload);
app.post('/uploads/post', uploadController.postUpload);


app.listen(process.env.PORT || '5000', function() {
	console.log("clemango api is running");
});