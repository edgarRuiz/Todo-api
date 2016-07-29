module.exports = function(db) {

	return {
		requireAuthentification: function(req, res, next) {
			var token = req.get('Auth');
			if (token) {
				db.user.findByToken(token).then(function(user){
					req.user = user;
					next();
				},function(){
					res.status(401).send();
				});
			}else{
				res.status(401).send();
			}
		}
	}
}