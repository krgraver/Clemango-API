var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcryptjs');

var UserSchema = new Schema({
	email: { type: String, lowercase: true, trim: true, unique: true, required: true },
	password: { type: String, required: true },
	timestamp: { type: Date, default: Date.now },
	profilePic: String,
	firstName: String,
	lastName: String,
	credentials: String,
	karmaPoints: { type: Number, default: 0 },
	administrator: { type: Boolean, default: false },
	verified: { type: Boolean, default: false },
	_suggestedUsers: [{ type: Schema.Types.ObjectId, ref: 'User', required: false }],
	suggestedEmails: Array
});

UserSchema.pre('save', function(next) {
    var user = this;

	if (!user.isModified('password')) return next();

	bcrypt.genSalt(10, function(err, salt) {
	    if (err) return next(err);

	    bcrypt.hash(user.password, salt, function(err, hash) {
	        if (err) return next(err);

	        user.password = hash;
	        next();
	    });
	});
});

UserSchema.methods.comparePassword = function(attemptedPassword, callback) {
    bcrypt.compare(attemptedPassword, this.password, function(err, isMatch) {
        callback(null, isMatch);
    });
};

UserSchema.index({email: 'text', firstName: 'text', lastName: 'text', company: 'text'});

module.exports = mongoose.model('User', UserSchema);