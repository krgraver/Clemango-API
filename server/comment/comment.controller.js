var Comment = require('./comment.model');

module.exports.getComments = function(req, res) {
	Comment.find({_upload: req.body._id})
		.populate('_user replies._user')
		.sort({karma: -1})
		.exec(function(err, comments) {
			if (err) {
				console.log(err);
			} else {
				res.json(comments);
			}
		});
};

module.exports.postComment = function(req, res) {
	var comment = new Comment(req.body);

	comment.save(function(err, comment) {
		if (err) {
			console.log(err);
		} else {
			comment.populate('_user', function(err) {
				if (err) {
					console.log(err);
				} else {
					res.json(comment);
				}
			});
		}
	});
};

module.exports.postReply = function(req, res) {
	Comment.findByIdAndUpdate(
		req.body._id,
	    {$push: {replies: {reply: req.body.reply, _user: req.body._user}}},
	    {safe: true, upsert: true, new: true},
	    function(err, comment) {
	        if (err) {
	        	console.log(err);
	        } else {
	        	comment.populate('_user replies._user', function(err) {
	        		if (err) {
	        			console.log(err);
	        		} else {
	        			res.json(comment);
	        		}
	        	});
	        }
	    }
	);
};

module.exports.upvoteComment = function(req, res) {
	Comment.findByIdAndUpdate(
		req.body._id,
	    {$push: { upvoters: req.body.upvoter}, $inc: { karma: 1 }},
	    {safe: true, upsert: true, new: true},
	    function(err, comment) {
	        if (err) {
	        	console.log(err);
	        } else {
	        	comment.populate('_user replies._user', function(err) {
	        		if (err) {
	        			console.log(err);
	        		} else {
	        			res.json(comment);
	        		}
	        	});
	        }
	    }
	);
};

module.exports.removeUpvote = function(req, res) {
	Comment.findByIdAndUpdate(
		req.body._id,
	    {$pull: { upvoters: req.body.upvoter}, $inc: { karma: -1 }},
	    {safe: true, upsert: true, new: true},
	    function(err, comment) {
	        if (err) {
	        	console.log(err);
	        } else {
	        	comment.populate('_user replies._user', function(err) {
	        		if (err) {
	        			console.log(err);
	        		} else {
	        			res.json(comment);
	        		}
	        	});
	        }
	    }
	);
};

module.exports.deleteCommentsByUpload = function(req, res) {
	Comment.find({_upload: req.body.upload})
		.remove()
		.exec(function(err) {
			if (err) {
				console.log(err);
			} else {
				res.send("Comments deleted");
			}
		});
};

module.exports.deleteCommentsByUser = function(req, res) {
	Comment.find({_user: req.body.user})
		.remove()
		.exec(function(err) {
			if (err) {
				console.log(err);
			} else {
				res.send("Comments deleted");
			}
		});
};

module.exports.getFirstUserComments = function(req, res) {
	Comment.find({_user: req.body.user})
		.sort({timestamp: -1})
		.limit(20)
		.populate('_upload')
		.exec(function(err, comments) {
			if (err) {
				console.log(err);
			} else {
				res.json(comments);
			}
		});
};

module.exports.getNextUserComments = function(req, res) {
	var skip = Number(req.body.skipAmount);

	Comment.find({_user: req.body.user})
		.sort({timestamp: -1})
		.skip(skip)
		.limit(20)
		.populate('_upload')
		.exec(function(err, comments) {
			if (err) {
				console.log(err);
			} else {
				res.json(comments);
			}
		});
};

module.exports.getFirstUserPublicComments = function(req, res) {
	Comment.find({isPublic: true, _user: req.body.user})
		.sort({timestamp: -1})
		.limit(20)
		.populate('_upload')
		.exec(function(err, comments) {
			if (err) {
				console.log(err);
			} else {
				res.json(comments);
			}
		});
};

module.exports.getNextUserPublicComments = function(req, res) {
	var skip = Number(req.body.skipAmount);

	Comment.find({isPublic: true, _user: req.body.user})
		.sort({timestamp: -1})
		.skip(skip)
		.limit(20)
		.populate('_upload')
		.exec(function(err, comments) {
			if (err) {
				console.log(err);
			} else {
				res.json(comments);
			}
		});
};

module.exports.makeCommentsPublic = function(req, res) {
	Comment.update({_upload: req.body.upload},
		{isPublic: true},
		{multi: true},
	    function(err, comment) {
	        if (err) {
	        	console.log(err);
	        } else {
	        	res.send("Comments updated");
	        }
	    }
	);
};

module.exports.makeCommentsPrivate = function(req, res) {
	Comment.update({_upload: req.body.upload},
		{isPublic: false},
		{multi: true},
	    function(err, comment) {
	        if (err) {
	        	console.log(err);
	        } else {
	        	res.send("Comments updated");
	        }
	    }
	);
};