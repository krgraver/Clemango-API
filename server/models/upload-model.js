var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UploadSchema = new Schema({
	title: { type: String, required: true },
	_createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Upload', UploadSchema);

