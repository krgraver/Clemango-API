var AWS = require('aws-sdk');
var postmark = require('postmark');
var client = new postmark.Client(process.env.POSTMARK_CLIENT);
var Upload = require('./upload.model');

AWS.config.update({
	accessKeyId: process.env.AWS_ACCESS_KEY_ID,
	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

module.exports.getFirstPublicUploads = function(req, res) {
	Upload.find({isPublic: true})
		.sort({timestamp: -1})
		.limit(24)
		.populate('_createdBy')
		.exec(function(err, uploads) {
			if (err) {
				console.log(err);
			} else {
				res.json(uploads);
			}
		});
};

module.exports.getNextPublicUploads = function(req, res) {
	var skip = Number(req.body.skipAmount);

	Upload.find({isPublic: true})
		.sort({timestamp: -1})
		.skip(skip)
		.limit(24)
		.populate('_createdBy')
		.exec(function(err, uploads) {
			if (err) {
				console.log(err);
			} else {
				res.json(uploads);
			}
		});
};

module.exports.searchPublicUploads = function(req, res) {
	Upload.find({isPublic: true, $text: {$search: req.body.searchValue}})
		.sort({timestamp: -1})
		.populate('_createdBy')
		.exec(function(err, uploads) {
			if (err) {
				console.log(err);
			} else {
				res.json(uploads);
			}
		});
};

module.exports.checkUpload = function(req, res) {
	Upload.findOne({_id: req.body.upload}, function(err, upload) {
		if (!upload) {
			res.json({
				error: "invalid upload"
			});
		} else {
			res.json({
				message: "OK"
			});
		}
	});
};

module.exports.getUpload = function(req, res) {
	Upload.findOne({_id: req.body._id})
		.populate('_createdBy _usersInvited')
		.exec(function(err, upload) {
			if (err) {
				console.log(err);
			} else {
				res.json(upload);
			}
		});
};

module.exports.signUpload = function(req, res) {
	var s3 = new AWS.S3();
	var timestamp = new Date().getTime().toString();

	var params = {
		Bucket: 'clemango',
		Key: 'uploads/' + req.body.user + '/' + timestamp,
		Expires: 60,
		ContentType: req.body.imageType,
		ACL: 'public-read'
	};

	s3.getSignedUrl('putObject', params, function(err, data) {
		var returnData = {
			signedUrl: data,
			url: 'https://clemango.s3.amazonaws.com/uploads/' + req.body.user + '/' + timestamp
		};

		res.json(returnData);
	});
};

module.exports.postUpload = function(req, res) {
	var upload = new Upload(req.body);
	upload.save(function(err, upload) {
		if (err) {
			console.log(err);
		} else {
			res.send(upload);
		}
	});
};

module.exports.saveUpload = function(req, res) {
	Upload.update({_id: req.body.upload},
		{$set: {
			title: req.body.title,
			context: req.body.context,
			isPublic: req.body.isPublic
		}},
		function() {
			res.send("Upload updated");
		});
};

module.exports.deleteUploadByUpload = function(req, res) {
	var s3 = new AWS.S3();
	var uploadKey = req.body.image.slice(34);

	var params = {
		Bucket: 'clemango',
		Key: uploadKey
	};

	s3.deleteObject(params, function(err, data) {
		if (err) {
			console.log(err);
		}
	});

	Upload.find({_id: req.body.upload})
		.remove()
		.exec(function(err) {
			if (err) {
				console.log(err);
			} else {
				res.send("Upload deleted");
			}
		});
};

module.exports.deleteUploadsByUser = function(req, res) {
	var s3 = new AWS.S3();

	var params = {
		Bucket: 'clemango',
		Prefix: 'uploads/' + req.body.user + '/'
	};

	s3.listObjects(params, function(err, data) {
		if (err) {
			console.log(err);
		} else if (data.Contents.length == 0) {
			console.log("No uploads to delete");
		} else {
			params = {Bucket: 'clemango'};
			params.Delete = {Objects: []};

			data.Contents.forEach(function(content) {
				params.Delete.Objects.push({Key: content.Key});
			});

			s3.deleteObjects(params, function(err, data) {
				if (err) {
					console.log(err);
				} else {
					res.send("Uploads deleted");
				}
			});
		}
	});

	Upload.find({_createdBy: req.body.user})
		.remove()
		.exec(function(err) {
			if (err) {
				console.log(err);
			} else {
				res.send("Uploads deleted");
			}
		});
};

module.exports.getFirstUserUploads = function(req, res) {
	Upload.find({_createdBy: req.body.user})
		.sort({timestamp: -1})
		.limit(12)
		.populate('_createdBy')
		.exec(function(err, uploads) {
			if (err) {
				console.log(err);
			} else {
				res.json(uploads);
			}
		});
};

module.exports.getNextUserUploads = function(req, res) {
	var skip = Number(req.body.skipAmount);

	Upload.find({_createdBy: req.body.user})
		.sort({timestamp: -1})
		.skip(skip)
		.limit(12)
		.populate('_createdBy')
		.exec(function(err, uploads) {
			if (err) {
				console.log(err);
			} else {
				res.json(uploads);
			}
		});
};

module.exports.getFirstUserPublicUploads = function(req, res) {
	Upload.find({isPublic: true, _createdBy: req.body.user})
		.sort({timestamp: -1})
		.limit(12)
		.populate('_createdBy')
		.exec(function(err, uploads) {
			if (err) {
				console.log(err);
			} else {
				res.json(uploads);
			}
		});
};

module.exports.getNextUserPublicUploads = function(req, res) {
	var skip = Number(req.body.skipAmount);

	Upload.find({isPublic: true, _createdBy: req.body.user})
		.sort({timestamp: -1})
		.skip(skip)
		.limit(12)
		.populate('_createdBy')
		.exec(function(err, uploads) {
			if (err) {
				console.log(err);
			} else {
				res.json(uploads);
			}
		});
};

module.exports.addUserInvitations = function(req, res) {
	var usersToInviteIds = [];

	for (var i = 0; i < req.body.usersToInvite.length; i++) {
		usersToInviteIds = usersToInviteIds.concat(req.body.usersToInvite[i]._id);
	}

	Upload.findByIdAndUpdate(
		req.body.upload,
		{$push: {
			_usersInvited: {$each: usersToInviteIds}
		}},
		{safe: true, upsert: true, new: true},
		function(err, upload) {
			if (err) {
				console.log(err);
			} else {
				upload.populate('_usersInvited', function(err) {
	        		if (err) {
	        			console.log(err);
	        		} else {
	        			res.json(upload);
	        		}
	        	});
			}
		});
};

module.exports.addEmailInvitations = function(req, res) {
	Upload.findByIdAndUpdate(
		req.body.upload,
		{$push: {
			emailsInvited: {$each: req.body.emails}
		}},
		{safe: true, upsert: true, new: true},
		function(err, upload) {
			if (err) {
				console.log(err);
			} else {
				upload.populate('_usersInvited', function(err) {
	        		if (err) {
	        			console.log(err);
	        		} else {
	        			res.json(upload);
	        		}
	        	});
			}
		});
};

module.exports.sendEmailInvitation = function(req, res) {
	client.sendEmailWithTemplate({
	    "From": "kelly@clemango.com", 
	    "TemplateId": 1408844,
	    "To": req.body.email, 
	    "TemplateModel": {
	        "sender_name": req.body.sender,
	        "upload_title": req.body.uploadTitle,
	        "image_url": req.body.imageUrl,
	        "action_url": "localhost:3000/uploads/" + req.body.uploadId
	    }
	});

	res.send("Email sent");
};