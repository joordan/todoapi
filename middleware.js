var cryptojs = require('crypto-js');
module.exports = function (db) {
	return {
		requireAuthentication: function (request, response, next) {
			var token = request.get('Auth') || '';

			db.token.findOne({		// look for token in database
				where: {
					tokenHash: cryptojs.MD5(token).toString() // value of auth header hash
				}
			}).then(function (tokenInstance) { // then on successful token instance store to request
				if (!tokenInstance) {
					throw new Error(); //catch happens
				}

				request.token = tokenInstance;
				return db.user.findByToken(token);
			}).then(function(user) {
				request.user = user;	// set user obj on req obj 
				next();				
			}).catch(function () {
				response.status(401).send();
			});


			// db.user.findByToken(token).then(function (user) {
			// 	request.user = user;
			// 	next();
			// }, function () {
			// 	response.status(401).send();
			// });
		}
	};
}