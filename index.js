var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var expressJWT = require('express-jwt');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

var userController = require('./server/controllers/user-controller');
var uploadController = require('./server/controllers/upload-controller');

var app = express();

mongoose.connect(process.env.MONGODB_URI);

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
// app.post('/uploads/image', uploadController.getSignedUrl);
app.post('/uploads/image', multipartMiddleware, uploadController.postImage);


app.listen(process.env.PORT || '5000', function() {
	console.log("clemango api is running");
});