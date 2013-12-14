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
	p1: 0,
	p2: 0,
	p3: 0,
	p4: 0,
	ball: {x: 200, y: 200}
}
var numPlayers = 0;
var players = [];
var idHash = {};

io.sockets.on('connection', function (socket) {
	if (numPlayers <= 4){ // Add Player
		socket.emit('init', {test: "Hello World!"});
		console.log(socket.id);
		players.push(socket)\
		numPlayers++;
	}

	socket.on('moveLeft', function (){

	})

});