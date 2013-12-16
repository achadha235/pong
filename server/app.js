var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')

app.listen(3000);
io.set('log level', 1); // reduce logging

function getRandom(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
}

function sign(number){
	if (number >= 0) return 1
	else return -1
}


function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }
    res.writeHead(200);
    res.end(data);
  });
}


var model = {
	lives: [5,5,5,5],
	scores: [0, 0, 0, 0],
	positions: [150, 150, 150, 150],
	actions: [0, 0, 0, 0],
	ball: {x: 200, y: 200, dx: 0.1, dy: 0.4}
}


var params = {
	height: 400,
	width: 400,
	radius: 5,
	border: 50,
	paddleHeight: 15,
	paddleWidth: 82,
	recoverTime: 1000
}

var numPlayers = 0;
var players = [];
var idHash = {};
var velocity = 200;
var ballVelocity = 50;
var all_ready = [0,0,0,0];

io.sockets.on('connection', function (socket) {
	if (numPlayers < 4){ // Add Player
		socket.emit('setPlayerNumber', {yourPlayerNumber: numPlayers});
		idHash[socket.id] = numPlayers;
		players.push(socket);
		numPlayers++;
	}

	// if (numPlayers === 4) startGame();

	socket.on('start_game', function(){
		all_ready[idHash[socket.id]] = 1;
		if (JSON.stringify(all_ready)==JSON.stringify([1,1,1,1])){
			startGame();
		}
	})

	socket.on('moveLeft', function (){
		model.actions[idHash[socket.id]] = 1;
		io.sockets.emit('update', model);
	})
	socket.on('moveRight', function (){
		model.actions[idHash[socket.id]] = 2;
		io.sockets.emit('update', model);
	})
	socket.on('stop', function (){
		model.actions[idHash[socket.id]] = 0;
		io.sockets.emit('update', model);
	})
});

function startGame(){
	var step = 10;
	setInterval(function (){
		// Network Update loop 
		io.sockets.emit('update', model)
	}, 30)

	setInterval(function (){
		// Game Update loop 
		for (var i = 0; i < 4; i++){
			if (model.actions[i] === 1){
				var newPos = Math.max(params.border, model.positions[i] - (velocity * (step/1000)))
				model.positions[i] = Math.round(newPos);
			}
			else if (model.actions[i] === 2){
				var newPos = Math.min(params.width-params.border-params.paddleWidth, model.positions[i] + (velocity * (step/1000)));
				model.positions[i] = Math.round(newPos);
			}
		}
		updateBall();

	}, 10)
}

function updateBall(){
	model.ball.x = model.ball.x + model.ball.dx;
	model.ball.y = model.ball.y + model.ball.dy;

	var outOfBounds = ballOutOfBounds();
	if (!outOfBounds){
		// RESET
		deflectBall()
	} else { 
		updateLives(outOfBounds);
		resetBall();
	}
}

function resetBall(){
	model.ball.x = 200
	model.ball.y = 200
	model.ball.dx = 0;
	model.ball.dy = 0;


	var randomX = (Math.random() > 0.5) ?  1 : -1;
	var randomY = (Math.random() > 0.5) ?  1 : -1;

	setTimeout(function(){
		if (Math.random() > 0.5) {
			model.ball.dx = 0.1 * randomX;
			model.ball.dy = 0.4 * randomY;			
		} 
		else {
			model.ball.dx = 0.4 * randomX;
			model.ball.dy = 0.1 * randomY;				
		}
	}, params.recoverTime)	
}

function updateLives(outOfBoundPlayer){
	model.lives[outOfBoundPlayer - 1] -= 1;
	if (model.lives[outOfBoundPlayer - 1] <= 0){
		updateScores();
	}
	io.sockets.emit('update', model);
}

function updateScores(){
	console.log('updating scores...');
	for (var i = 0; i < model.lives.length; i++){
		model.scores[i] += model.lives[i];
	}
	model.lives = [5, 5, 5, 5];
};

function resetRound(){

}

function deflectBall(){

	var c = 0.1;
	var top = model.ball.y - params.radius;
	var bottom = model.ball.y + params.radius;
	var left = model.ball.x - params.radius;
	var right = model.ball.x + params.radius;

	if (bottom >= (params.height - params.paddleHeight) && model.ball.dy > 0){ // Range for delfection
		if ((model.positions[0] <= model.ball.x &&  model.ball.x <= model.positions[0]+params.paddleWidth)) {
			model.ball.dy *= -1;
			var diff = model.ball.x - (model.positions[0] + (params.paddleWidth/2));
			model.ball.dx  = diff * c;
		}
	}
	else if (right>= params.width - params.paddleHeight && model.ball.dx > 0){
		if (((params.height-params.paddleWidth-model.positions[1]) <= model.ball.y &&  model.ball.y <= params.height-model.positions[1])) {
			model.ball.dx *= -1;
			var diff = model.ball.y - (params.height-(params.paddleWidth/2)-model.positions[1]);
			model.ball.dy  = diff * c;
		}
	}
	else if (top <= params.paddleHeight && top >= 0 && model.ball.dy < 0){
		if (((params.width-params.paddleWidth-model.positions[2]) <= model.ball.x &&  model.ball.x <= params.width-model.positions[2])) {
			model.ball.dy *= -1;
			var diff = model.ball.x - (params.width-(params.paddleWidth/2)-model.positions[2]);
			model.ball.dx  = diff * c;
		}
	}	
	else if (left <= params.paddleHeight && left >= 0 && model.ball.dx < 0){
		if ((model.positions[3] <= model.ball.y &&  model.ball.y <= model.positions[3]+params.paddleWidth)) {
			model.ball.dx *= -1;
			var diff = model.ball.y - (model.positions[3] + (params.paddleWidth/2));
			model.ball.dy  = diff * c;	
		}
	}	
}

function ballOutOfBounds(){

	var top = model.ball.y - params.radius;
	var bottom = model.ball.y + params.radius;
	var left = model.ball.x - params.radius;
	var right = model.ball.x + params.radius;

	if (right >= params.width) return 2
	else if (top <= 0) return 3
	else if (left <= 0) return 4
	else if (bottom >= params.height) return 1
	else return 0
}

