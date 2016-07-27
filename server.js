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
		where.completed = (query.completed ==='true')?true : false ;
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

	db.todo.destroy(where: {
		id: todoId
	}).then(function(rowsDeleted){
		if(rowsDeleted === 0 ){
			res.status(404).json({error: 'No todo with that id'});
		}else{
			res.status(204).send();
		}
	},function(){
		res.status(500).send();
	})

	// var todoObject = _.findWhere(todos, {
	// 	id: todoID
	// });

	// if (todoObject) {
	// 	todos = _.without(todos, todoObject);
	// 	res.json(todoObject)
	// } else {
	// 	res.status(400).send();
	// }

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

db.sequelize.sync({}).then(function() {
	app.listen(PORT, function() {
		console.log('Express listening on port :' + PORT);
	});
});