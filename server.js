const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const shortid = require('shortid')
const cors = require('cors')

const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE || 'mongodb://localhost/exercise-track' ,{ useNewUrlParser: true })
var Schema = mongoose.Schema;
var PessoaSchema = new Schema({
	nome: String,
	_id : {'type':String, 'default': shortid.generate()}

});
var Pessoa =mongoose.model("Pessoa", PessoaSchema);

var ExeSchema = new Schema({
	userId: String,
	description: String, 
	duration: Number, 
	date: Date

})
var Exercicio = mongoose.model('Exercicio', ExeSchema);

app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


app.post('/api/exercise/new-user', (req, res) =>{ 
	Pessoa.create({nome: req.body.username}, function(erro, resultado){
		if(erro)console.log(erro);
		console.log(resultado);
		res.json({username:resultado.nome, _id: resultado._id })	
	})
})

app.get('/api/exercise/users', (req, res) =>{ 
	Pessoa.find({}, function(erro, resultado){
		if(erro)console.log(erro);
	//console.log(resultado);
		resultado.map((item) =>{
			
		})
		res.json(resultado)	
	})
/*
	Pessoa.aggregate([
	{ 
	$project:{ nome:1}
	}
	], function(erro, resultado){
		if(erro)console.log(erro)
		res.json(resultado)
	}
	
	)
  */
})
app.post('/api/exercise/add', (req, res) =>{ 
	let data = new Date();
	let obj= req.body;
	if(obj.date == ''){
		obj.date= data.toLocaleDateString()
	}
	
	Exercicio.create( obj, function(erro, resultado){
						if(erro)console.log(erro);
						console.log(resultado);
						res.json(resultado)	
	})
})
app.get('/api/exercise/log',(req, res) =>{
	let que={};
	let q='';
	let limit;
	let obj= {};
	
//	que.userId = req.query.userId;
		
	q=Exercicio.find( que );
	
	if(req.query.limit != undefined){
		limit = Number(req.query.limit)
		q=Exercicio.find( que ).limit(limit)//adicionei o limit
	}

	if(req.query.from  && req.query.to){
		console.log("com tudinho")
		que.date = { $gt:req.query.from , $lt: req.query.to};
	}else if(req.query.from){
		que.date = {$gt: req.query.from};
	}else if(req.query.to){
		que.date = { $lt:req.query.to};	
	}else {
		console.log("sem nadinha")
//	que.date='';
	}
	
	if(req.query.userId){
		que.userId = req.query.userId;
		console.log(que)
	

	Pessoa.findOne({_id: que.userId },(erro, resultado)=>{
		if(erro){	
			console.log(erro)
		}else{
			obj.pessoa= resultado;
	//		Exercicio.find( que ).limit(limit)
			q.exec((err, resultados) =>{
				if(err){
					console.log(err)
				}else{
					obj.exercicios= resultados;
					res.json({
						name:obj.pessoa.nome,
						userId: obj.pessoa._id,
						count: obj.exercicios.length,
						log: obj.exercicios	
					})
				}
			})
		}		
	})
	
	}else{
	res.json({erro:'não tem usuario'})
	}
})



// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})

//app.post

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
