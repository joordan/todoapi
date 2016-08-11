var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;
var todos = [{							// collection
	id: 1,								// this is 
	description: 'catch some mon',		// a
	completed: false					// module
},{
	id: 2,								// this is
	description: 'even more mon',		// another
	completed: false					// module
},{
	id: 3,
	description: 'train some mon',
	completed: true
}];

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
	var matchedTodo;									//searching parse int for str to int conversion

	todos.forEach(function (todo) { 	//anonymous function called for each ithem 
		if (todoId === todo.id) {
			matchedTodo = todo;
		}
	}); 	

	if (matchedTodo) {
		response.json(matchedTodo);
	} else {
		response.status(404).send();
	}



	//response.send('asking for todo with id of ' + request.params.id)
});

app.listen(PORT, function() {
	console.log('Express listening on port ' + PORT + '!');
});
