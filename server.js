var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;
var todos = [{
	id: 1,
	description: 'catch some mon',
	completed: false
},{
	id: 2,
	description: 'even more mon',
	completed: false
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
app.get('/todos/:id', function (request,response) {
	var todoId = request.params.id;

	//iterate over todo array. find the match
	response.status(404).send();


	response.send('asking for todo with id of ' + request.params.id)
});

app.listen(PORT, function() {
	console.log('Express listening on port ' + PORT + '!');
});
