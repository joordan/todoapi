// create sqlite db
// loads todo model
// exports db object, instance, and library

var Sequelize = require('sequelize');
var env = process.env.NODE_ENV || 'development';  // access node_env in production
var sequelize;

if (env  === 'production') {
	sequelize = new Sequelize(process.env.DATABASE_URL, {
		dialect: 'postgres'
	});
} else {
	sequelize = new Sequelize(undefined, undefined, undefined, {
		'dialect': 'sqlite',
		'storage': __dirname + '/data/dev-todo-api.sqlite'
	}); // instance
}




var db = {}; //attach properties then export it from db.js


// sequelize call load in modules from separate files
db.todo = sequelize.import(__dirname + '/models/todo.js');
db.user = sequelize.import(__dirname + '/models/users.js');
db.token = sequelize.import(__dirname + '/models/token.js');
db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.todo.belongsTo(db.user);
db.user.hasMany(db.todo);

module.exports = db;