var jwt = require('jsonwebtoken');
var User = require('../models/users');

module.exports.logInUser = function(req, res) {
	User.findOne({email: req.body.email}, function(err, user) {
		user.comparePassword(req.body.password, function(err, isMatch) {
			if (!isMatch) {
				res.send('invalid password');
			} else {
				var myToken = jwt.sign({
						"iss": "clemango.com"
					}, 'clemangos are juicy');
				res.json(myToken);
			}
		});
	});
};

module.exports.signUpUser = function(req, res) {
	var newUser = new User(req.body);
	newUser.save();

	var myToken = jwt.sign({
			"iss": "clemango.com"
		}, 'clemangos are juicy');
	res.json(myToken);
}