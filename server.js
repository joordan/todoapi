var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1; // to identify unique items, not secure, use database instead

app.use(bodyParser.json()); // json request are parsed by express, able to access by request.body

app.get('/', function(request, response) {
	response.send('to do api root');
});


// GET /todos?completed=true&q=house
app.get('/todos', function(request, response) {
	var query = request.query; // allows key/value parameters /todos?key=value&anotherkey=value
	var where = {};

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

	// long because of filtering
	//var filteredTodos = todos;

	// //query for completed
	// if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
	// 	filteredTodos = _.where(filteredTodos, {
	// 		completed: true
	// 	});
	// } else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
	// 	filteredTodos = _.where(filteredTodos, {
	// 		completed: false
	// 	});
	// }

	//query for seaching description
	//go through each description if it contains the query parameter, return it

	// if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
	// 	filteredTodos = _.filter(filteredTodos, function(todo) {
	// 		return todo.description.toLowerCase().indexOf(queryParams.q.toLowerCase()) > -1; //"go to work on a weeked".indexOf('work')
	// 	});
	// }

	// if has property && completed === true
	// filteredTodos = _.where(filteredTodos, ?)
	// else if has prop && if completed if 'false'

	// response.json(filteredTodos);


});

// GET /todos/:id
app.get('/todos/:id', function(request, response) { //:id whatever user puts in
	var todoId = parseInt(request.params.id, 10); // store whatever user put in to use for  

	db.todo.findById(todoId).then(function(todo) {
		if (!!todo) {
			response.json(todo.toJSON());
		} else {
			response.status(404).send();
		}
	}, function(e) {
		response.status(500).send();
	});
	// var matchedTodo = _.findWhere(todos, {
	// 	id: todoId
	// }); // _.findWhere underscore refactoring. commonly used code functions

	// var matchedTodo;									//searching parse int for str to int conversion

	// todos.forEach(function (todo) { 	//anonymous function called for each item or module
	// 	if (todoId === todo.id) {
	// 		matchedTodo = todo;
	// 	}
	// }); 	

	// if (matchedTodo) {
	// 	response.json(matchedTodo);
	// } else {
	// 	response.status(404).send();
	// }

	//response.send('asking for todo with id of ' + request.params.id)
});


// POST /todos access data sent by request by using npmmodule bodyparser
app.post('/todos', function(request, response) {
	var body = _.pick(request.body, 'description', 'completed'); //_.pick only allows certain key values to be taken from json

	db.todo.create(body).then(function(todo) {
		response.json(todo.toJSON());
	}, function(e) {
		response.status(400).json(e);
	});

	// call create on db.todo
	// 		respond w 200 and todo
	// 		e - response.json(400).send())

	// if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) { //test if body.
	// 	return response.status(400).send(); //	completed and body.string, trim removes whitespaces
	// }

	// body.description = body.description.trim();

	// // add id field unique id
	// body.id = todoNextId++;

	// //push body into array add unique id to post
	// todos.push(body);

	// // console.log('description: ' + body.description );
	// response.json(body);
});

// DELETE /todos/:id

app.delete('/todos/:id', function(request, response) {
	var todoId = parseInt(request.params.id, 10);


	db.todo.destroy({
		where: {
			id: todoId
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
	// var matchedTodo = _.findWhere(todos, {
	// 	id: todoId
	// });

	// if (!matchedTodo) {
	// 	response.status(404).json({
	// 		"error": "no todo found with that id"
	// 	});
	// } else {
	// 	todos = _.without(todos, matchedTodo);
	// 	response.json(matchedTodo);
	// }

});

// PUT /todos/:id
app.put('/todos/:id', function(request, response) {
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

	db.todo.findById(todoId).then(function(todo) {
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

db.sequelize.sync().then(function() {
	app.listen(PORT, function() {
		console.log('Express listening on port ' + PORT + '!');
	});
});