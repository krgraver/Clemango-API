var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var expressJWT = require('express-jwt');

var userController = require('./app/controllers/user-controller');
var uploadController = require('./app/controllers/upload-controller');

var app = express();

mongoose.connect('mongodb://localhost:27017/clemango');

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


app.listen('5000', function() {
	console.log("clemango-server is running");
});