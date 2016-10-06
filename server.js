var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var bcrypt = require('bcryptjs');
var middleware = require('./middleware.js')(db);

var app = express();
var PORT = process.env.PORT || 3000;
var url = process.env.MYSITE_URL || 'http://localhost:3000';

var todos = [];
var todoNextID = 1;

var authToken;

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false})); 
//app.use(bodyParser.json());

app.get('/',  function(req, res) {
	res.render('index', {url : url});
});

app.get('/todos', middleware.requireAuthentification, function(req, res) {

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
	where.userId = req.user.get('id');
	db.todo.findAll({
		where: where
	}).then(function(todos) {
		if (todos) {
			var todoObjects = [];
			todos.forEach(function(todo) {
				todoObjects.push(todo);
			});
			//res.json(todoObjects);
			res.render("todos", {todos: todoObjects, url: url});
		} else {
			res.json();
		}
	}).catch(function() {
		res.status(404).send();
	});
});

app.get('/todos/:id', middleware.requireAuthentification, function(req, res) {
	var todoId = req.params.id;

	db.todo.findById(todoId).then(function(todo) {

		if (todo && (todo.get('userId') === req.user.get('id'))) {
			res.json(todo);
		} else {
			res.status(404).json();
		}
	}, function(error) {
		res.status(500).json(error);
	});
});

app.post('/todos', middleware.requireAuthentification, function(req, res) {
	var body = _.pick(req.body, 'description', 'completed');

	db.todo.create({
		description: body.description.trim(),
		completed: body.completed
	}).then(function(todo) {
		req.user.addTodo(todo).then(function() {
			return todo.reload();
		}).then(function(todo) {
			res.redirect('/todos');
			console.log(todo);
		})
	}).catch(function(e) {
		res.status(400).send(e);
	});


});

app.post('/deleteTodos/', middleware.requireAuthentification, function(req, res) {
	//var todoId = parseInt(req.params.id, 10);
	var todoId = _.pick(req.body, 'id');
	db.todo.destroy({
		where: {
			id: todoId.id,
			userId: req.user.get('id')
		}
	}).then(function(rowsDeleted) {
		if (rowsDeleted === 0) {
			res.status(404).json({
				error: 'No todo with that id' +todoId.id
			});
		} else {
			//res.status(204).send();
			res.redirect('/todos');
		}
	}, function() {
		res.status(500).send();
	})
});

app.post('/editTodos/', middleware.requireAuthentification, function(req, res) {

	var body = _.pick(req.body,'id', 'description', 'completed');

	var attributes = {};

	if (body.hasOwnProperty('completed')) {
		attributes.completed = body.completed;
	}

	if (body.hasOwnProperty('description')) {
		attributes.description = body.description;
	}

	db.todo.findById(body.id).then(function(todo) {
		if (todo && (todo.get('userId') === req.user.get('id'))) {
			if(!attributes.completed){
				attributes.completed = todo.completed;
			}
			if(!attributes.description){
				attributes.description = todo.description;
			}
			return todo.update(attributes);
		} else {
			res.status(404).send();
		}
	}, function(error) {
		res.status(500);
	}).then(function(todo) {
		if (todo) {
			//res.json(todo).send();
			res.redirect('todos');
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
			//res.json(user.toPublicJSON());
			//res.render("users", {email : user.email , url :url});
			res.render('login', {url:url});
		}
	}).catch(function(error) {
		res.status(400).send();
	});

});

app.post('/users/login', function(req, res) {

	var body = _.pick(req.body, 'email', 'password');
	var userInstance;

	db.user.authenticate(body).then(function(user) {
			var token = user.generateToken('authentication');
			userInstance = user;
			return db.token.create({
				token: token
			});
		},
		function() {
			res.status(401).send();
		}).then(function(token) {
		if (token) {
			//res.header('Auth', token.get('token')).json(userInstance.toPublicJSON());
			res.header('Auth', token.get('token'));
			authToken = token.get('token');
			middleware.setAuthToken(authToken);
			app.locals.email = userInstance.email;
			res.redirect('/mainPage');
		} else {
			res.status(401).send();
		}
	}).catch(function(error) {
		console.error(error);
		res.status(401).send(error);
	});
});

app.get('/mainPage', function(req,res){
	var email = app.locals.email;
	res.render("users", {email: email, url:url});
})

app.delete('/users/login', middleware.requireAuthentification, function(req, res) {
	req.token.destroy().then(function() {
		res.status(204).send();
	}, function() {
		res.status(500).send();
	});
});

app.put('/users', middleware.requireAuthentification, function(req, res) {

	var email = _.pick(req.body, 'email');

	if (email) {

		db.user.findById(req.user.id).then(function(user) {
			return user.update(email);
		}, function(error) {
			res.status(404).send();
		}).then(function(user) {
			if (user) {
				res.send(user.toPublicJSON());
			}else{
				res.status(404).send();
			}
		}, function(error) {
			res.status(500).send();
		});
		// db.user.update(email).then(function(todo){
		// 	res.json(todo).send();
		// },function(error){
		// 	res.status(500).send()
		// });
	}

});

db.sequelize.sync(/*{force:true}*/).then(function() {
	app.listen(PORT, function() {
		console.log('Express listening on port :' + PORT);
	});
});