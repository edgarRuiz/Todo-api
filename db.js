var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
	storage: __dirname + '/data/dev-todo-api.sqlite',
	dialect: 'sqlite'
});

var db = {};

db.todo = sequelize.import(__dirname + '/models/todo.js');
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
