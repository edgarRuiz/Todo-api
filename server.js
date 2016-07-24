var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');

var app = express();
var PORT = process.env.PORT || 3000;

var todos = [];
var todoNextID = 1;

app.use(bodyParser.json());

app.get('/',function(req,res){
	res.send('Todo API Root');
});

app.get('/todos', function(req,res){
	res.json(todos);
});

app.get('/todos/:id',function(req,res){
	var todoID = req.params.id;
	
	todoID = parseInt(todoID,10);

	var todoObject = _.findWhere(todos, {id: todoID});

	if(todoObject){
		res.json(todoObject);
	}else{
		res.status(404).send();
	}
});

app.post('/todos',function(req,res){

	var body =  _.pick(req.body, 'description', 'completed');

	if(!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0 ){
		return res.status(400).send();
	}

	body.description = body.description.trim();

	body.id = todoNextID++;
	todos.push(body);
	res.json(body);


});

app.delete('/todos/:id', function (req, res){
	 var todoID = parseInt(req.params.id,10);

	 var todoObject = _.findWhere(todos, {id: todoID});
	 console.log(todoObject);

	 if(todoObject){
	 	todos = _.without(todos,todoObject);
	 	res.json(todoObject)
	 }else{
		res.status(400).send();
	}

});

app.listen(PORT,function(){
	console.log('Express listening on port :' + PORT);
});

