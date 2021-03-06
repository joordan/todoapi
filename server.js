var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var bcrypt = require('bcrypt');
var middleware = require('./middleware.js')(db);

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1; // to identify unique items, not secure, use database instead


app.use(bodyParser.json()); // json request are parsed by express, able to access by request.body

app.get('/', function(request, response) {
	response.send('to do api root');
});


// GET /todos?completed=true&q=house
app.get('/todos',middleware.requireAuthentication, function(request, response) { // middleware executes before this function
	var query = request.query; // allows key/value parameters /todos?key=value&anotherkey=value
	var where = {
		userId: request.user.get('id')
	};

	if (query.hasOwnProperty('completed') && query.completed === 'true') {
		where.completed = true;
	} else if (query.hasOwnProperty('completed') && query.completed === 'false') {
		where.completed = false;
	}

	if (query.hasOwnProperty('q') && query.q.length > 0) {
		where.description = {
			$like: '%' + query.q + '%'
		};
	}

	db.todo.findAll({
		where: where
	}).then(function(todos) {
		response.json(todos);
	}, function(e) {
		response.status(500).send();
	})


});

// GET /todos/:id
app.get('/todos/:id',middleware.requireAuthentication, function(request, response) { //:id whatever user puts in
	var todoId = parseInt(request.params.id, 10); // store whatever user put in to use for  

	db.todo.findOne({
		where: {
			id: todoId,
			userId: request.user.get('id')
		}
	}).then(function(todo) {
		if (!!todo) {
			response.json(todo.toJSON());
		} else {
			response.status(404).send();
		}
	}, function(e) {
		response.status(500).send();
	});
});


// POST /todos access data sent by request by using npmmodule bodyparser
app.post('/todos',middleware.requireAuthentication, function(request, response) {
	var body = _.pick(request.body, 'description', 'completed'); //_.pick only allows certain key values to be taken from json

	db.todo.create(body).then(function(todo) {
		//using middleware that handles assocation
		request.user.addTodo(todo).then(function (){
			return todo.reload(); // reload after assocation added
		}).then(function (todo) {
			response.json(todo.toJSON());
		});
	}, function(e) {
		response.status(400).json(e);
	});

});

// DELETE /todos/:id

app.delete('/todos/:id',middleware.requireAuthentication, function(request, response) {
	var todoId = parseInt(request.params.id, 10);


	db.todo.destroy({
		where: {
			id: todoId,
			userId: request.user.get('id')
		}
	}).then(function(rowsDeleted) {
		if (rowsDeleted === 0) {
			response.status(404).json({
				error: 'No todo with id'
			});
		} else {
			response.status(204).send(); // 200 expect something sent back 204 nothing sent back
		}
	}, function() {
		response.status(500).send();
	});


});

// PUT /todos/:id
app.put('/todos/:id',middleware.requireAuthentication, function(request, response) {
	var todoId = parseInt(request.params.id, 10);
	// var matchedTodo = _.findWhere(todos, {
	// 	id: todoId
	// });
	var body = _.pick(request.body, 'description', 'completed'); //filter with _.pick only allows certain key values to be taken 
	var attributes = {};



	//if it exist, it meets standards for completed

	if (body.hasOwnProperty('completed')) { //if property exist and its a boolean
		attributes.completed = body.completed;
	}

	//if it exist, description
	if (body.hasOwnProperty('description')) {
		attributes.description = body.description;
	}

	db.todo.findOne({
		where: {
			id: todoId,
			userId: request.user.get('id')
		}
	}).then(function(todo) {
		if (todo) { //find
			todo.update(attributes).then(function(todo) {
				response.json(todo.toJSON()); //update goes well
			}, function(e) {
				response.status(400).json(e); //update goes wrong
			});
		} else { //by
			response.status(404).send();
		} //id
	}, function() {
		response.status(500).send(); //run if findbyid went wrong
	});
});


app.post('/users',function (request,response) {
	var body = _.pick(request.body, 'email','password');

	db.user.create(body).then(function (user) {
		response.json(user.toPublicJSON()); // instance method in users.js
	}, function (e) {
		response.status(400).json(e);
	});
});

// POST /users/login
app.post('/users/login', function (request,response) {
	var body = _.pick(request.body,'email','password');
	var userInstance;

	//run after authenticate finishes
	db.user.authenticate(body).then(function (user) {
		var token = user.generateToken('authentication');
		userInstance = user;
		// store token to db
		return db.token.create({
			token: token
		});

		// if (token) {
		// 	response.header('Auth',token).json(user.toPublicJSON());

		// } else {
		// 	response.status(401).send();
		// }
	}).then(function (tokenInstance) {	// run after token.create
		response.header('Auth',tokenInstance.get('token')).json(userInstance.toPublicJSON());
	}).catch(function () {	// something goes wrong
		response.status(401).send();
	});


});

// DELETE /users/login
app.delete('/users/login',middleware.requireAuthentication, function (request,response) {
	//delete token instance
	request.token.destroy().then(function () {
		response.status(204).send();
	}).catch(function() {
		response.status(500).send();
	});
});

db.sequelize.sync({force: true}).then(function() {
	app.listen(PORT, function() {
		console.log('Express listening on port ' + PORT + '!');
	});


});