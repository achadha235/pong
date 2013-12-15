var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')

app.listen(3000);

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
	positions: [100, 100, 100, 100],
	actions: [0, 0, 0, 0],
	ball: {x: 200, y: 200, dx: 0, dy: 0}
}

var numPlayers = 0;
var players = [];
var idHash = {};
var velocity = 10;

io.sockets.on('connection', function (socket) {
	if (numPlayers < 4){ // Add Player
		socket.emit('init', {test: "Hello World!"});
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

	setTimeout(function (){
		// Network Update loop 
		io.sockets.emit('update', model)
	}, 30)

	setTimeout(function (){
		// Game Update loop 
		for (var i = 0; i < 4; i++){
			if (model.actions[i] === 1){
				model.positions[i] = Math.max(0, model.positions[i] - (velocity * (step/1000)))
			}
			else if (model.actions[i] === 2){
				model.positions[i] = Math.min(400, model.positions[i] + (velocity * (step/1000)))
			}
		}
	}, 10)

}