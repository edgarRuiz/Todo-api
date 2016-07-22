var express = require('express');

var app = express();

var PORT = process.env.PORT || 3000;

var todos = [
	{
		id:1,
		description : 'Check emails',
		completed : false
	},
	{
		id:2,
		description: 'Rearrange room',
		completed: false
	},
	{
		id:3,
		description: 'Begin coding interview book studying',
		completed:false
	}
];

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

app.listen(PORT,function(){
	console.log('Express listening on port :' + PORT);
})