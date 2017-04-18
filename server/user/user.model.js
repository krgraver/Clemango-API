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

	// only hash the password if it has been modified (or is new)
	if (!user.isModified('password')) return next();

	// generate a salt
	bcrypt.genSalt(10, function(err, salt) {
	    if (err) return next(err);

	    // hash the password using our new salt
	    bcrypt.hash(user.password, salt, function(err, hash) {
	        if (err) return next(err);

	        // override the cleartext password with the hashed one
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