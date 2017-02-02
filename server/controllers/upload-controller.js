var Upload = require('../models/uploads');

module.exports.getAllUploads = function(req, res) {
	Upload.find({}, function(err, uploadData) {
		if (err) {
			console.log(err);
		} else {
			res.json(uploadData);
		}
	});
};

module.exports.getUpload = function(req, res) {
	Upload.findOne({"_id": req.body._id}, function(err, upload) {
		res.json(upload);
	});
};

module.exports.postUpload = function(req, res) {
	var upload = new Upload(req.body);
	upload.save(function(err, upload) {
		if (err) {
			console.log(err);
		} else {
			res.json(upload);
		}
	});
};