var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');

var app = express();
var PORT = process.env.PORT || 3000;

var todos = [];
var todoNextID = 1;

app.use(bodyParser.json());

app.get('/', function(req, res) {
	res.send('Todo API Root');
});

app.get('/todos', function(req, res) {

	var queryParams = req.query;
	var filteredTodos = todos;

	if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
		filteredTodos = _.where(filteredTodos, {
			completed: true
		});
	} else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
		filteredTodos = _.where(filteredTodos, {
			completed: false
		});
	}

	if (queryParams.hasOwnProperty('q') && queryParams.q.trim().length > 0) {
		filteredTodos = _.filter(filteredTodos, function(todo) {
			return todo.description.toLowerCase().indexOf(queryParams.q.trim().toLowerCase()) > -1;
		});
	}

	res.json(filteredTodos);
});

app.get('/todos/:id', function(req, res) {
	var todoID = req.params.id;

	todoID = parseInt(todoID, 10);

	var todoObject = _.findWhere(todos, {
		id: todoID
	});

	if (todoObject) {
		res.json(todoObject);
	} else {
		res.status(404).send();
	}
});

app.post('/todos', function(req, res) {

	var body = _.pick(req.body, 'description', 'completed');

	if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
		return res.status(400).send();
	}

	body.description = body.description.trim();

	body.id = todoNextID++;
	todos.push(body);
	res.json(body);


});

app.delete('/todos/:id', function(req, res) {
	var todoID = parseInt(req.params.id, 10);

	var todoObject = _.findWhere(todos, {
		id: todoID
	});

	if (todoObject) {
		todos = _.without(todos, todoObject);
		res.json(todoObject)
	} else {
		res.status(400).send();
	}

});

app.put('/todos/:id', function(req, res) {


	var todoID = parseInt(req.params.id, 10);
	var todoObject = _.findWhere(todos, {
		id: todoID
	});
	var body = _.pick(req.body, 'description', 'completed');
	var putObject = {};


	if (!todoObject) {
		return res.status(404).send('No todo item with id : ' + todoID);
	}

	if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
		putObject.description = body.description;
	} else if (body.hasOwnProperty('description')) {
		return res.status(400).send('');
	}

	if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
		putObject.completed = body.completed;
	} else if (body.hasOwnProperty('completed')) {
		return res.status(400).send('');
	}

	_.extend(todoObject, putObject);

	return res.status(200).send(putObject);


});

app.listen(PORT, function() {
	console.log('Express listening on port :' + PORT);
});