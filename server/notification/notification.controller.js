var Notification = require('./notification.model');

module.exports.addNotification = function(req, res) {
	var notification = new Notification(req.body);

	notification.save(function(err, notification) {
		if (err) {
			console.log(err);
		} else {
			res.send(notification);
		}
	});
};

module.exports.deleteNotificationsByUpload = function(req, res) {
	Notification.find({_upload: req.body.upload})
		.remove()
		.exec(function(err) {
			if (err) {
				console.log(err);
			} else {
				res.send("Notifications deleted");
			}
		});
};

module.exports.deleteNotificationsByUser = function(req, res) {
	Notification.find({_recipient: req.body.user})
		.remove()
		.exec(function(err) {
			if (err) {
				console.log(err);
			} else {
				res.send("Notifications deleted");
			}
		});
};

module.exports.getFirstNotifications = function(req, res) {
	Notification.find({_recipient: req.body.user})
		.sort({timestamp: -1})
		.limit(30)
		.populate('_createdBy _upload')
		.exec(function(err, notifications) {
			if (err) {
				console.log(err);
			} else {
				res.json(notifications);
			}
		});
};

module.exports.getNextNotifications = function(req, res) {
	var skip = Number(req.body.skipAmount);

	Notification.find({_recipient: req.body.user})
		.sort({timestamp: -1})
		.skip(skip)
		.limit(30)
		.populate('_createdBy _upload')
		.exec(function(err, notifications) {
			if (err) {
				console.log(err);
			} else {
				res.json(notifications);
			}
		});
};

module.exports.getNewNotifications = function(req, res) {
	Notification.find({_recipient: req.body.user, viewed: false})
		.sort({timestamp: -1})
		.populate('_createdBy _upload')
		.exec(function(err, notifications) {
			if (err) {
				console.log(err);
			} else {
				res.json(notifications);
			}
		});
};

module.exports.clearNewNotifications = function(req, res) {
	Notification.update({_recipient: req.body.user},
			{$set: {viewed: true}},
			{multi: true},
			function() {
				res.send("Notifications updated");
			});
};

module.exports.getLatestNotifications = function(req, res) {
	Notification.find({_recipient: req.body.user})
		.sort({timestamp: -1})
		.populate('_createdBy _upload')
		.limit(10)
		.exec(function(err, notifications) {
			if (err) {
				console.log(err);
			} else {
				res.json(notifications);
			}
		});
};