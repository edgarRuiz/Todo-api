var express = require('express');

var bodyParser = require('body-parser');

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
	var todoid = req.params.id;
	if(!isNaN(todoid)){

		var todoidNum = parseInt(todoid);

		if( todoidNum <= todos.length && todoidNum >=1 ){

		var todoObject = todos[todoidNum-1];
		res.json(todoObject);

		}else{
		res.status(404).send('No todo item with that id : ' + todoid);
		}
	}else{
		res.status(404).send('No todo item with that id : ' + todoid);
	}
});

app.post('/todos',function(req,res){

	var body = req.body;
	body.id = todoNextID++;
	todos.push(body);
	res.json(body);


});

app.listen(PORT,function(){
	console.log('Express listening on port :' + PORT);
})