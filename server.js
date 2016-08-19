var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1; // to identify unique items, not secure, use database instead

app.use(bodyParser.json()); // json request are parsed by express, able to access by request.body

app.get('/', function (request,response) {
	response.send('to do api root');
});


// GET /todos?completed=true
app.get('/todos', function (request,response) {
	var queryParams = request.query; // allows key/value parameters /todos?key=value&anotherkey=value
	var filteredTodos = todos;

	if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true' ) {
		filteredTodos = _.where(filteredTodos, {completed: true});
	} else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
		filteredTodos = _.where(filteredTodos, {completed: false});
	}

	// if has property && completed === true
	// filteredTodos = _.where(filteredTodos, ?)
	// else if has prop && if completed if 'false'



	response.json(filteredTodos);





});

// GET /todos/:id
app.get('/todos/:id', function (request,response) {		//:id whatever user puts in
	var todoId = parseInt(request.params.id,10);		// store whatever user put in to use for  
	var matchedTodo = _.findWhere(todos, {id: todoId}); // _.findWhere underscore refactoring. commonly used code functions

	// var matchedTodo;									//searching parse int for str to int conversion

	// todos.forEach(function (todo) { 	//anonymous function called for each item or module
	// 	if (todoId === todo.id) {
	// 		matchedTodo = todo;
	// 	}
	// }); 	

	if (matchedTodo) {
		response.json(matchedTodo);
	} else {
		response.status(404).send();
	}

//response.send('asking for todo with id of ' + request.params.id)
});


// POST /todos access data sent by request by using npmmodule bodyparser
app.post('/todos', function (request,response) {
	var body = _.pick(request.body,'description','completed');	//_.pick only allows certain key values to be taken from json

	if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) { //test if body.
		return response.status(400).send();	//	completed and body.string, trim removes whitespaces
	}

	body.description = body.description.trim();

	// add id field unique id
	body.id = todoNextId++;

	//push body into array add unique id to post
	todos.push(body);

	// console.log('description: ' + body.description );
	response.json(body);
});

// DELETE /todos/:id

app.delete('/todos/:id', function (request, response) {
	var matchedTodo = _.findWhere(todos, {id: todoId});

	if (!matchedTodo) {
		response.status(404).json({"error": "no todo found with that id"});
	} else {
		todos = _.without(todos,matchedTodo);
		response.json(matchedTodo);
	}

});

// PUT /todos/:id
app.put('/todos/:id', function (request, response) {
		var todoId = parseInt(request.params.id,10);
		var matchedTodo = _.findWhere(todos, {id: todoId});
		var body = _.pick(request.body,'description','completed');	//filter with _.pick only allows certain key values to be taken from json
		var validAttributes = {};

		if (!matchedTodo) {
			return response.status(404).send();
		}

		//if it exist, it meets standards for completed
		if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) { //if property exist and its a boolean
			validAttributes.completed = body.completed;
		} else if (body.hasOwnProperty('completed')) {
			// bad happened
			return response.status(400).send();
		} 

		//if it exist, description
		if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
			validAttributes.description = body.description;
		} else if (body.hasOwnProperty('description')) {
			return response.status(400).send();
		}

		// things went right

		_.extend(matchedTodo, validAttributes);

		response.json(matchedTodo);//automatically send back status 200
		

});


app.listen(PORT, function() {
	console.log('Express listening on port ' + PORT + '!');
});
