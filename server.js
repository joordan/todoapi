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


// GET /todos
app.get('/todos', function (request,response) {
	response.json(todos);
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

	// add id field
	body.id = todoNextId++;

	//push body into array
	todos.push(body);

	// console.log('description: ' + body.description );
	response.json(body);
});


app.listen(PORT, function() {
	console.log('Express listening on port ' + PORT + '!');
});
