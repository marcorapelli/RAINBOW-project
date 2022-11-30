var express = require('express')
,   app = express()
,   server = require('http').createServer(app)
,   io = require('socket.io')(8080);


// Webserver
server.listen(8080);

app.configure(function(){

    app.use(express.static(__dirname + '/public'));
});


app.get('/', function (req, res) {

    res.sendfile(__dirname + '/public/index.html');
});

// Websocket
io.sockets.on('connection', function (socket) {

    //Here I want get the data
    io.sockets.on('rasp_param', function (data){
        console.log(data);
    });

});

// Server Details
console.log('Ther server runs on http://127.0.0.1:' + conf.port + '/');
