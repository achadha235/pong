var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')

app.listen(3000);
io.set('log level', 1); // reduce logging

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
	positions: [150, 150, 150, 150],
	actions: [0, 0, 0, 0],
	ball: {x: 200, y: 200, dx: 0, dy: 1}
}

<<<<<<< Updated upstream
var params = {
	height: 400,
	width: 400,
	radius: 5,
	border: 50,
	paddleHeight: 10,
	paddleWidth: 100
=======
var game_param = {
	ypositions: [280, 280, 0, 0],
	ballOutOfBounds: 	false,
	paddle_speed: 		0,
	ballOutOfBounds: 	false,
	p_color: ["#F0F000","#00F0F0","#F000F0","#00FF00"],
	paddle_width: 100,//px
	paddle_height: 20,//px
	ball_radius: 5,//px
	right_wall: 300,
	bottom_wall: 300,
	p_left_boundary: 50,
	p_right_boundary: 250,
	leftpressed: false,
	rightpressed: false,
	ball: {
		x: 150,
		y: 150
	}
>>>>>>> Stashed changes
}

var numPlayers = 0;
var players = [];
var idHash = {};
var velocity = 80;
var ballVelocity = 50;

io.sockets.on('connection', function (socket) {
	if (numPlayers < 4){ // Add Player
		socket.emit('setPlayerNumber', {yourPlayerNumber: numPlayers});
		idHash[socket.id] = numPlayers;
		players.push(socket);
		numPlayers++;
	}

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
	startGame()
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
<<<<<<< Updated upstream
		updateBall();
=======

		moveBall();

>>>>>>> Stashed changes
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
		console.log(outOfBounds);
	}
}

function deflectBall(){
	var top = model.ball.y - params.radius;
	var bottom = model.ball.y + params.radius;
	var left = model.ball.x - params.radius;
	var right = model.ball.x + params.radius;

<<<<<<< Updated upstream
	if (bottom <= params.height && bottom >= params.height - params.paddleHeight && model.ball.dy > 0){ // Range for delfection
		if ((model.positions[0] <= model.ball.x &&  model.ball.x <= model.positions[0]+params.paddleWidth)) model.ball.dy *= -1; // Make sure paddle is 
	}

	else if (right <= params.width && right>= params.width - params.paddleHeight && model.ball.dx > 0){
		if (((params.height-params.paddleWidth-model.positions[1]) <= model.ball.y &&  model.ball.y <= params.width-model.positions[1])) model.ball.dx *= -1;
	}
	else if (top <= params.paddleHeight && top >= 0 && model.ball.dy < 0){
		if (((params.width-params.paddleWidth-model.positions[2]) <= model.ball.x &&  model.ball.x <= params.width-model.positions[2])) model.ball.dy *= -1;
	}	
	else if (left <= params.paddleHeight && left >= 0 && model.ball.dx < 0){
		if ((model.positions[3] <= model.ball.y &&  model.ball.y <= model.positions[3]+params.paddleWidth)) model.ball.dx *= -1;
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
=======

	function moveBall(){
		game_param.ballOutOfBounds = false;

		if (((model.ball.x - game_param.ball_radius + model.ball.dx) <= 0) || ((model.ball.x + game_param.ball_radius + model.ball.dx) >= game_param.right_wall)||
			((model.ball.y - game_param.ball_radius + model.ball.dy) <= 0) || ((model.ball.y + game_param.ball_radius + model.ball.dy) >= game_param.bottom_wall)){
			game_param.ballOutOfBounds = true;
		}
		if (!game_param.ballOutOfBounds){
			if (((model.ball.x - game_param.ball_radius + model.ball.dx) < game_param.paddle_height) && (model.ball.dx<0) &&
				(((model.ball.y >= model.positions[3]) && (model.ball.y <= (model.positions[3] + game_param.paddle_width)))||(model.ball.y<game_param.p_left_boundary) || (model.ball.y>(game_param.p_right_boundary))))
				{
					

				model.ball.dx *= -1;
				model.ball.x = game_param.paddle_height;
			}
			else if(((model.ball.x + game_param.ball_radius + model.ball.dx) > (game_param.right_wall-game_param.paddle_height)) && (model.ball.dx>0) &&
				(((model.ball.y >= (game_param.bottom_wall-game_param.paddle_width-model.positions[1])) && (model.ball.y <= (game_param.bottom_wall-model.positions[1])))||(model.ball.y<game_param.p_left_boundary) || (model.ball.y>game_param.p_right_boundary))){
					

				model.ball.dx *= -1;
				model.ball.x = game_param.right_wall-game_param.paddle_height;
			}

			else if (((model.ball.y - game_param.ball_radius + model.ball.dy) < game_param.paddle_height) && (model.ball.dy<0) &&
				(((model.ball.x >= (game_param.right_wall-game_param.paddle_width-model.positions[2])) && (model.ball.x <= (game_param.right_wall-model.positions[2] + game_param.paddle_width)))||(model.ball.x<game_param.p_left_boundary) || (model.ball.x>game_param.p_right_boundary))){
					

				model.ball.dy *= -1;
				model.ball.y = game_param.paddle_height;

			}
			else if (((model.ball.y + game_param.ball_radius + model.ball.dy) > (game_param.bottom_wall-game_param.paddle_height)) && (model.ball.dy>0) &&
				(((model.ball.x >= model.positions[0]) && (model.ball.x <= (model.positions[0] + game_param.paddle_width)))||(model.ball.x<game_param.p_left_boundary) || (model.ball.x>game_param.p_right_boundary))){
	

				model.ball.dy *= -1;
				model.ball.y = game_param.bottom_wall-game_param.paddle_height;

			}
			else{
				console.log(model.ball);
				model.ball.y += model.ball.dy;
				model.ball.x += model.ball.dx;
			}
			
		}
	}

}
>>>>>>> Stashed changes
