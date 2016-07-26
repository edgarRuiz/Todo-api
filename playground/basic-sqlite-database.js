var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
	storage: __dirname + '/basic-sqlite-database.sqlite',
	dialect: 'sqlite'
});

var Todo = sequelize.define('todo', {
	description: {
		type: Sequelize.STRING,
		allowNull: false,
		validate: {
			len: [1, 250]
		}
	},
	completed: {
		type: Sequelize.BOOLEAN,
		allowNull: false,
		defaultValue: false
	}
});

sequelize.sync({
	//force: true
}).then(function() {
	console.log('Everything is synced');
	Todo.findById(3).then(function(todo){
		if(todo){
			console.log(todo.toJSON());
		}
		else{
			console.log('Not found');
		}
	})
	// Todo.create({
	// 	description: 'Help Mom',
	// 	completed: false
	// }).then(function(todo) {
	// 	return Todo.create({
	// 		description: 'Find out about microsoft certs',
	// 		completed: false
	// 	}).then(function(todo){
	// 		return Todo.create({
	// 			description: 'Email mom the papers'
	// 		})
	// 	}).then(function() {
	// 		return Todo.findAll({
	// 			where: {
	// 				description: {
	// 					$like: '%mom%'
	// 				}
	// 			}
	// 		});
	// 	}).then(function(todos) {
	// 		if (todos) {
	// 			todos.forEach(function(todo){
	// 				console.log(todo.toJSON());
	// 			})
	// 		} else {
	// 			console.log('No todo found');
	// 		}
	// 	}).catch(function(error) {
	// 		console.log(error);
	// 	});
	// })
});