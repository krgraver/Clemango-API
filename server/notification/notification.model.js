var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var NotificationSchema = new Schema ({
	notification: String,
	timestamp: { type: Date, default: Date.now },
	viewed: { type: Boolean, default: false },
	_recipient: { type: Schema.Types.ObjectId, ref: 'User'},
	_upload: { type: Schema.Types.ObjectId, ref: 'Upload', required: false }
});

module.exports = mongoose.model('Notification', NotificationSchema);