var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CommentSchema = new Schema({
	comment: { type: String, trim: true, required: true },
	karma: { type: Number, default: 0 },
	upvoters: Array,
	timestamp: { type: Date, default: Date.now },
	replies: [{
		reply: { type: String, trim: true, required: true },
		timestamp: { type: Date, default: Date.now },
		_user: { type: Schema.Types.ObjectId, ref: 'User' }
	}],
	isPublic: { type: Boolean, default: true },
	_user: { type: Schema.Types.ObjectId, ref: 'User' },
	_upload: { type: Schema.Types.ObjectId, ref: 'Upload' }
});

module.exports = mongoose.model('Comment', CommentSchema);