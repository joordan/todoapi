var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
	'dialect': 'sqlite',
	'storage': __dirname + '/basic-sqlite-database.sqlite'
}); // instance

var Todo = sequelize.define('todo', {
	description: {
		type: Sequelize.STRING,
		allowNull: false, // required
		validate: {
			len: [1,250] // take string length that is at least 1 in length and less than 250
		}
	},
	completed: {
		type: Sequelize.BOOLEAN,
		allowNull: false,
		defaultValue: false
	}
});


sequelize.sync({
	//force: true // always drop database
}).then(function () {
	console.log('Everything is synced');

	Todo.findById(3).then(function (todo) {
		if (todo) {
			console.log(todo.toJSON());
		} else {
			console.log('tpdp not found');
		}
	});


	// Todo.create({						// insert query
	// 	description: "dump data",
	// 	//completed: false
	// }).then(function (todo ) { 			// insert query
	// 	return Todo.create({
	// 		description: 'clean files'
	// 	});
	// }).then(function () {
	// 	//return Todo.findById(1); 		// select query
	// 	return Todo.findAll({			// select where completed = false
	// 		where: {
	// 			description: {
	// 				$like: '%Files%'
	// 			}
	// 		}
	// 	});
	// }).then(function (todos) {
	// 	if (todos) {
	// 		todos.forEach(function (todo) {
	// 			console.log(todo.toJSON());
	// 		});
	// 	} else {
	// 		console.log('no todo found!')
	// 	}
	// }).catch( function (e) {
	// 	console.log(e);
	// });
});