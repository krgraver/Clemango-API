var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UploadSchema = new Schema({
	image: String,
	title: String,
	context: String,
	timestamp: { type: Date, default: Date.now },
	isPublic: { type: Boolean, default: true },
	_createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
	_usersInvited: [{ type: Schema.Types.ObjectId, ref: 'User', required: false }],
	emailsInvited: Array
});

UploadSchema.index({title: 'text', context: 'text'});

module.exports = mongoose.model('Upload', UploadSchema);