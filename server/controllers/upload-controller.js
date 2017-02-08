var Upload = require('../models/upload-model');
var AWS = require('aws-sdk');
var fs = require('fs');

AWS.config.update({
	accessKeyId: process.env.AWS_ACCESS_KEY_ID,
	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

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

module.exports.postImage = function(req, res) {
	var s3 = new AWS.S3();

	var stream = fs.createReadStream(req.files.image.path);

	var params = {
		Bucket: process.env.S3_BUCKET,
		Key: req.files.image.name,
		Body: stream
	};

	s3.putObject(params, function(err, data) {
		if (err) {
			console.log(err);
		} else {
			res.send(data);
		}
	})
};
