var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UploadSchema = new Schema({
	title: String,
	uploader: String,
	category: String
});

module.exports = mongoose.model('Upload', UploadSchema);

