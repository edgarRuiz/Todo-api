var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');

var app = express();
var PORT = process.env.PORT || 3000;

var todos = [];
var todoNextID = 1;

app.use(bodyParser.json());

app.get('/', function(req, res) {
	res.send('Todo API Root');
});

app.get('/todos', function(req, res) {

	var query = req.query;
	var where = {};


	if (query.hasOwnProperty('completed')) {
		where.completed = (query.completed === 'true') ? true : false;
	}
	if (query.hasOwnProperty('q') && query.q.trim().length > 0) {
		var percent = '%';
		var desc = percent + query.q + percent;
		where.description = {
			$ilike: desc
		}
	}

	db.todo.findAll({
		where: where
	}).then(function(todos) {
		if (todos) {
			var todoObjects = [];
			todos.forEach(function(todo) {
				todoObjects.push(todo);
			});
			res.json(todoObjects);
		} else {
			res.json();
		}
	}).catch(function() {
		res.status(404).send();
	});
});

app.get('/todos/:id', function(req, res) {
	var todoId = req.params.id;

	db.todo.findById(todoId).then(function(todo) {
		if (todo) {
			res.json(todo);
		} else {
			res.status(404).json();
		}
	}, function(error) {
		res.status(500).json(error);
	});
});

app.post('/todos', function(req, res) {

	var body = _.pick(req.body, 'description', 'completed');

	db.todo.create({
		description: body.description.trim(),
		completed: body.completed
	}).then(function(todo) {
		res.json(todo);
	}).catch(function(e) {
		res.status(400).json(e);
	});

});

app.delete('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);

	db.todo.destroy({
		where: {
			id: todoId
		}
	}).then(function(rowsDeleted) {
		if (rowsDeleted === 0) {
			res.status(404).json({
				error: 'No todo with that id'
			});
		} else {
			res.status(204).send();
		}
	}, function() {
		res.status(500).send();
	})
});

app.put('/todos/:id', function(req, res) {

	var todoId = parseInt(req.params.id, 10);
	var body = _.pick(req.body, 'description', 'completed');

	var attributes = {};

	if (body.hasOwnProperty('completed')) {
		attributes.completed = body.completed;
	}

	if (body.hasOwnProperty('description')) {
		attributes.description = body.description;
	}

	db.todo.findById(todoId).then(function(todo) {
		if (todo) {
			return todo.update(attributes);
		} else {
			res.status(404).send();
		}
	}, function(error) {
		res.status(500);
	}).then(function(todo) {
		if (todo) {
			res.json(todo).send();
		}
	}, function(error) {
		res.status(400).json(error);
	}).catch(function(error) {
		res.status(500);
	});
});

app.post('/users', function(req, res) {

	var body = _.pick(req.body, 'email', 'password');

	db.user.create(body).then(function(user) {
		if (user) {
			res.json(user.toPublicJSON());
		}
	}).catch(function(error) {
		res.status(400).send();
	});

});

db.sequelize.sync({force: true}).then(function() {
	app.listen(PORT, function() {
		console.log('Express listening on port :' + PORT);
	});
});