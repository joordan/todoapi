var bcrypt = require('bcrypt');
var _ = require('underscore');
var cryptojs = require('crypto-js');
var jwt = require('jsonwebtoken');

module.exports = function(sequelize, DataTypes) {
	var user = sequelize.define('user', {
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true, //only one unique email
			validate: {
				isEmail: true
			}
		},
		salt: {
			type: DataTypes.STRING
		},
		password_hash: {
			type: DataTypes.STRING
		},
		password: { //still plain text!
			type: DataTypes.VIRTUAL,
			allowNull: false,
			validate: {
				len: [7, 100]
			},
			set: function(value) {
				var salt = bcrypt.genSaltSync(10);
				var hashedPassword = bcrypt.hashSync(value, salt);

				this.setDataValue('password', value);
				this.setDataValue('salt', salt);
				this.setDataValue('password_hash', hashedPassword);
			}
		}
	}, {
		hooks: {
			beforeValidate: function(user, options) {
				// user.email
				if (typeof user.email === 'string') {
					user.email = user.email.toLowerCase();
				}
			}
		},
		classMethods: {
			authenticate: function (body) {
				return new Promise(function (resolve, reject) {
					//validation
					if (typeof body.email !== 'string' || typeof body.password !== 'string') {
						return reject();
					}

					user.findOne({
						where: {
							email: body.email
						}
					}).then(function(user) {
						if (!user || !bcrypt.compareSync(body.password, user.get('password_hash'))) { //comparesync compares plaintext with salthash
							return reject(); //authentication possible but fail
						}

						resolve(user); //topublicjson in users model

					}, function(e) {
						reject();
					});
				});
			}
		},
		instanceMethods: { // user object already available
			toPublicJSON: function () {
				var json = this.toJSON();
				return _.pick(json,'id','email','createdAt','updatedAt');
			},
			generateToken: function (type) {
				if (!_.isString(type)) {
					return undefined;
				}

				try {
					var stringData = JSON.stringify({id: this.get('id'), type: type}); //takes user id and type _ to json string
					var encryptedData = cryptojs.AES.encrypt(stringData,'abc123!@#!').toString(); //pass string password
					var token = jwt.sign({
						token: encryptedData
					}, 'qwerty098');

					return token;

				} catch (e) {
					console.error(e);
					return undefined;
				}
			} 
		}

	});

	return user;
};