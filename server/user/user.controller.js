var jwt = require('jsonwebtoken');
var jwtDecode = require('jwt-decode');
var moment = require('moment');
var bcrypt = require('bcryptjs');
var AWS = require('aws-sdk');
var postmark = require('postmark');
var client = new postmark.Client(process.env.POSTMARK_CLIENT);
var User = require('./user.model');

AWS.config.update({
	accessKeyId: process.env.AWS_ACCESS_KEY_ID,
	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

module.exports.logInUser = function(req, res) {
	User.findOne({email: req.body.email}, function(err, user) {
		if (!user) {
			res.json({
				error: "invalid"
			});
		} else {
			user.comparePassword(req.body.password, function(err, isMatch) {
				if (!isMatch) {
					res.json({
						error: "invalid"
					});
				} else {
					var myToken = jwt.sign({
							"iss": "clemango.com"
						}, process.env.JWT_SECRET);
					res.json({
						_id: user._id,
						token: myToken,
						email: user.email
					});
				}
			});
		}
	});
};

module.exports.getInfoByEmail = function(req, res) {
	User.findOne({email: req.body.email}, function(err, user) {
		if (!user) {
			res.json({
				error: "invalid"
			});
		} else {
			res.json({
				_id: user._id,
				email: user.email,
				firstName: user.firstName
			});
		}
	});
};

module.exports.sendPasswordReset = function(req, res) {
	var expires = moment().add(1, 'days').valueOf();

	var resetToken = jwt.sign({
						"exp": expires,
						"email": req.body.email
					}, process.env.JWT_SECRET);

	client.sendEmailWithTemplate({
	    "From": "kelly@clemango.com", 
	    "TemplateId": 1408841,
	    "To": req.body.email, 
	    "TemplateModel": {
	        "name": req.body.firstName,
	        "action_url": "https://clemango.herokuapp.com/reset/" + resetToken
	    }
	});

	res.send("Email sent");
};

module.exports.resetPassword = function(req, res) {
	var decodedToken = jwtDecode(req.body.token),
		newPassword = req.body.newPassword;

	bcrypt.genSalt(10, function(err, salt) {
	    if (err) return next(err);

	    bcrypt.hash(newPassword, salt, function(err, hash) {
	        if (err) return next(err);

	        newPassword = hash;

	        User.update({email: decodedToken.email},
				{$set: {
					password: newPassword
				}},
				function() {
					res.send("Password updated");
			});
	    });
	});
}

module.exports.checkEmail = function(req, res) {
	User.findOne({email: req.body.email}, function(err, user) {
		if (user) {
			res.json({
				error: "user exists"
			});
		} else {
			res.json({
				message: "OK"
			});
		}
	});
};

module.exports.signUpUser = function(req, res) {
	var newUser = new User(req.body);
	newUser.save(function(err, user) {
		if (err) {
			console.log(err);
		}
	});

	var myToken = jwt.sign({
			"iss": "clemango.com"
		}, process.env.JWT_SECRET);
	res.json({
			_id: newUser._id,
			token: myToken
		});
};

module.exports.signUserImage = function(req, res) {
	var s3 = new AWS.S3();

	var params = {
		Bucket: 'clemango',
		Key: 'profilePics/' + req.body.user + '/' + req.body.imageName,
		Expires: 60,
		ContentType: req.body.imageType,
		ACL: 'public-read'
	};

	s3.getSignedUrl('putObject', params, function(err, data) {
		var returnData = {
			signedUrl: data,
			url: 'https://clemango.s3.amazonaws.com/profilePics/' + req.body.user + '/' + req.body.imageName
		};

		res.json(returnData);
	});
};

module.exports.saveUserSetup = function(req, res) {
	User.update({_id: req.body.currentUser},
		{$set: {
			profilePic: req.body.profilePic,
			firstName: req.body.firstName,
			lastName: req.body.lastName,
			credentials: req.body.credentials
		}},
		function() {
			res.send('User updated');
	});
};

module.exports.changePassword = function(req, res) {
	let currentUser = req.body.currentUser,
		currentPassword = req.body.currentPassword,
		newPassword = req.body.newPassword;

	User.findOne({_id: currentUser}, function(err, user) {
		if (err) {
			console.log(err);
		} else {
			user.comparePassword(currentPassword, function(err, isMatch) {
				if (!isMatch) {
					res.json({
						error: "invalid"
					});
				} else {
					bcrypt.genSalt(10, function(err, salt) {
					    if (err) return next(err);

					    bcrypt.hash(newPassword, salt, function(err, hash) {
					        if (err) return next(err);

					        newPassword = hash;

					        User.update({_id: currentUser},
								{$set: {
									password: newPassword
								}},
								function() {
									res.json({
										message: "OK"
									});
							});
					    });
					});
				}
			});
		}
	});
}

module.exports.deleteUser = function(req, res) {
	User.find({_id: req.body.user})
		.remove()
		.exec(function(err) {
			if (err) {
				console.log(err);
			} else {
				res.send("User deleted");
			}
		});
};

module.exports.checkUser = function(req, res) {
	User.findOne({_id: req.body.user}, function(err, user) {
		if (!user) {
			res.json({
				error: "invalid user"
			});
		} else {
			res.json({
				message: "OK"
			});
		}
	});
};

module.exports.getUserInfo = function(req, res) {
	User.findOne({_id: req.body.user})
		.populate('_suggestedUsers')
		.exec(function(err, user) {
			if (err) {
				console.log(err);
			} else {
				res.json(user);
			}
		});
};

module.exports.postUploadKarma = function(req, res) {
	User.update({_id: req.body.currentUser},
	    {$inc: { karmaPoints: 3 }},
	    {safe: true, upsert: true},
	    function(err, user) {
	        if (err) {
	        	console.log(err);
	        } else {
	        	res.send("User updated");
	        }
	    }
	);
};

module.exports.giveUserKarma = function(req, res) {
	User.update({_id: req.body.user},
	    {$inc: { karmaPoints: 1 }},
	    {safe: true, upsert: true},
	    function(err, user) {
	        if (err) {
	        	console.log(err);
	        } else {
	        	res.send("User updated");
	        }
	    }
	);
};

module.exports.removeUpvoteKarma = function(req, res) {
	User.update({_id: req.body.user},
	    {$inc: { karmaPoints: -1 }},
	    {safe: true, upsert: true},
	    function(err, user) {
	        if (err) {
	        	console.log(err);
	        } else {
	        	res.send("User updated");
	        }
	    }
	);
};

module.exports.removeUploadKarma = function(req, res) {
	User.update({_id: req.body.user},
	    {$inc: { karmaPoints: -3 }},
	    {safe: true, upsert: true},
	    function(err, user) {
	        if (err) {
	        	console.log(err);
	        } else {
	        	res.send("User updated");
	        }
	    }
	);
};

module.exports.searchUsers = function(req, res) {
	User.find({$text: {$search: req.body.searchValue}})
		.exec(function(err, users) {
			if (err) {
				console.log(err);
			} else {
				res.json(users);
			}
		});
};

module.exports.addSuggestedUser = function(req, res) {
	User.update({_id: req.body.user},
		{$addToSet: {_suggestedUsers: req.body.suggestedUser}},
		function() {
			res.send("User updated");
		});
};

module.exports.addSuggestedEmails = function(req, res) {
	User.update({_id: req.body.user},
		{$push: {
			suggestedEmails: {$each: req.body.suggestedEmails}
		}},
		function() {
			res.send("User updated");
		});
};