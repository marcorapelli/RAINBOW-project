/**
 * This file contains the server logic. The server should always be launched with Node.js (i.e. sudo node RainbowServer.js).
 * The goal of the Node.js server script is to read the object information from AMQP receiver.py (via UDP/dgram socket) and
 * pass it to the client via socket.io.
 * This Node.js code also sets up an HTTP server and an HTTPS server for the client (i.e. the browser) to connect to.
 */


//**** Define the app with express.static used for create the HTTP and HTTPS servers
const express = require('express');
var cors = require('cors');
const app = express();
app.use(express.static('../', {index: 'Rainbow.html'}));
app.use(cors());

//**** Define the credentials for HTTPS server on port 7007
const fs = require("fs");
var credentials = {
	hostname: 'serverfull.polito.it',
	port: 7007,
	path: '/',
	method: 'GET',
	ca: fs.readFileSync("/etc/ssl/certs/DigiCertCA.crt"),
	key: fs.readFileSync("/etc/ssl/certs/serverfull_polito_it.key"),
	cert: fs.readFileSync("/etc/ssl/certs/serverfull_polito_it.crt"),
	ciphers: "DEFAULT:!SSLv2:!RC4:!EXPORT:!LOW:!MEDIUM:!SHA1"
};

//**** Create the HTTP and HTTPS servers
const http = require('http').Server(app);
const https = require('https').createServer(credentials, app);

//**** Start the HTTP server on port 6006
http.listen(6006, () => {
	var host = http.address().address;
	var port = http.address().port;
	console.log("Listening on http://%s:%s",host,port);
});

//**** Start the HTTPS server on port 7007
https.listen(7007, () => {
	var host = https.address().address;
	var port = https.address().port;
	console.log("Listening on https://%s:%s",host,port);
});




//**** Define the ioSocket with socket.io listening on HTTP.
//**** CORS policy header has to be defined manually from socket.io v3.x on.
const ioSocket = require('socket.io')(http, { cors: {} });

//**** Define the ioSecureSocket with socket.io listening on HTTPS.
//**** CORS policy header has to be defined manually from socket.io v3.x on.
const ioSocketSecure = require('socket.io')(https, { cors: {} });

//**** ioSocket connection (called every time a client connects via HTTP)
ioSocket.on('connection', (socket) => {
	//console.log('A client is connected over HTTP');
});

//**** ioSecureSocket connection (called every time a client connects via HTTPS)
ioSocketSecure.on('connection', (socket) => {
	//console.log('A client is connected over HTTPS');
});




//**** Define a UDP socket to receive pkts from AMQP receiver.py
const dgram = require('dgram');
const udpSocket = dgram.createSocket('udp4');
udpSocket.bind({
	address: '130.192.30.241',
	port: 8008
});

//**** Start the UDP socket on 130.192.30.241:8008 
udpSocket.on('listening', () => {
	var host = udpSocket.address().address;
	var port = udpSocket.address().port;
	console.log('UDP socket on %s:%s',host,port);
});

//**** This function is the most important one, as it is called every time a new UDP packet is received from AMQP receiver.py
//**** As a new packet is received, its content is forwarded to the client (i.e. the browser) via ioSocket and ioSocketSecure
udpSocket.on('message', (msg,rinfo) => {
	console.log(msg.toString());
	ioSocket.sockets.send(msg.toString());
	ioSocketSecure.sockets.send(msg.toString());
});






