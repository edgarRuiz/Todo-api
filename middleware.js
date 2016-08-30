var cryptojs = require('crypto-js');

var authToken;
module.exports = function(db) {

	return {
		requireAuthentification: function(req, res, next) {
		//	var token = req.get('Auth') || '';
			var token = authToken || '';
			db.token.findOne({
				where: {
					tokenHash: cryptojs.MD5(token).toString()
				}
			}).then(function(tokenInstance) {
				if(!tokenInstance){
					throw new Error();
				}
				req.token = tokenInstance;
				return db.user.findByToken(token);
			}).then(function(user) {
				req.user = user;
				next();
			}).catch(function() {
				res.status(401).send();
			});

		},
		setAuthToken: function(token){
			authToken = token;
			//next();
		}
	};
};