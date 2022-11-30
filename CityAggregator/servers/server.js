//**** Require definition
const express = require("express");
const newman = require('newman');
var the_postman = require('./files/TorinoDigitaleIMEI866221031860344.postman_collection.json');

var http = require("http");
var https = require("https");
var fs = require("fs");
var ws = require('websocket').server;
const socket = io();

//**** Digital certificate and private key locations for https server
var options = {
	hostname: 'serverfull.polito.it',
	port: 443,
	path: '/',
	method: 'GET',
	ca: fs.readFileSync("/etc/ssl/certs/DigiCertCA.crt"),
	key: fs.readFileSync("/etc/ssl/certs/serverfull_polito_it.key"),
	cert: fs.readFileSync("/etc/ssl/certs/serverfull_polito_it.crt")
};
 
//**** Initialization
var app = express();
var coor = {'Longitude': null, 'Latitude' : null };

//**** Function triggered by the GET for data of the online.js
app.get('/data', function (request, response ){
    response.setHeader('Access-Control-Allow-Origin', '*');

    //**** Parse the URL    
    the_postman.item[1].response[0].originalRequest.url.path[4] = request.query.imei;
    the_postman.item[1].request.url.path[4] =  request.query.imei;
    var tmp0 = the_postman.item[1].response[0].originalRequest.url.raw.split('/');
    var tmp1 = the_postman.item[1].request.url.raw.split('/');
    tmp0[7] = request.query.imei;
    tmp1[7] = request.query.imei;
    tmp0 = tmp0.join('/');
    tmp1 = tmp1.join('/');
    the_postman.item[1].response[0].originalRequest.url.raw = tmp0;
    the_postman.item[1].request.url.raw = tmp1;
    

    console.log(the_postman.item[1].request.url.raw);
    console.log(the_postman.item[1].request.url.path[4]);

    //**** Local file for path history
    var filename_ = "/var/www/html/servers/tmporaryfiles/saved_" + request.query.imei + ".txt";
    
    //**** Newman command for getting the data from FCA-AWS
    newman.run({
        //collection: require('./files/collection_for_newman.json'),
	//collection: require('./files/TorinoDigitaleIMEI359040089519204.postman_collection.json'),
	//collection: require('./files/TorinoDigitaleIMEI356938035643809.postman_collection.json'),
	collection: the_postman,
        reporters: 'cli',
        }).on('start', (err,args) => console.log("running the collection ..."))
        .on('done', (err, summary) =>
        {

    		if (err || summary.error)
        	{
            		console.error("Collection run encoutered an error.");
        	}
    		else
        	{
        		var resp = [];
        		summary.run.executions.forEach((execution) => {
           			// console.log(execution.response.json());
           			if (!!execution.response)
            			{
                			resp.push(execution.response.json().telematicKeyValues);
            			}
        		});

        	}
    		console.log(resp);
    		response.end(JSON.stringify(resp[1]))


		//**** If correct response
    		if (resp[1])
        	{
			
			//**** Compute the time interval between now and the last fresh data on server
			var lastTime = new Date(resp[1][1].timestamp.split('T')[0] + 'T' + 
                                    resp[1][1].timestamp.split('T')[1].split(':')[0] + ':' + 
                                    resp[1][1].timestamp.split('T')[1].split(':')[1] + ':' + 
                                    resp[1][1].timestamp.split('T')[1].split(':')[2].split('.')[0]) / 1000;
            		var nowTime = Date.now() / 1000 | 0;
            		var timeInterval = nowTime - lastTime;

	    		console.log("Time Interval: " + timeInterval)

			//**** If there are no fresh data in past 5 minutes, then overwrite the file of path history
        		if (timeInterval >= 300)
                	{
                		fs.writeFile(filename_, '', () => console.log("Empty HISTORY!!!"));
               		}
			//**** Else (if coords are not 0;0 like initial phases), write the new coords in the corresponding file for path history
			else
                	{
				//console.log(resp[1][2].value)
				//console.log(resp[1][3].value)
				//if (resp[1][2].value == "0.0") {console.log("True")}
	
				if (resp[1][3].value != "0.0" && resp[1][4].value != "0.0")
				{
					if ((coor.Longitude  != resp[1][3].value || coor.Latitude != resp[1][4].value) && resp[1][0].value == request.query.imei)
		            		{

	                			fs.appendFile(filename_,"+" + JSON.stringify([(resp[1][3]).value,(resp[1][4]).value]), (err) => {
	                    				if (err) throw err;
	                    			});
	                		coor.Longitude = resp[1][3].value;
	                		coor.Latitude = resp[1][4].value;
			
            		    		}
				}           	
			}
        	}
	});
})


//**** Function triggered by the GET for history of the online.js
app.get('/history', function (request, response ){
    response.setHeader('Access-Control-Allow-Origin', '*');
    
    //**** Local file for path history
    var filename_ = "/var/www/html/servers/tmporaryfiles/saved_" + request.query.imei + ".txt";

    //**** If the file of oath history exists for that IMEI    
    if (fs.existsSync(filename_))
        {
	    //**** Create a void Geojson
            var data =  {
                "type": "Feature",
                "properties": {},
                "geometry": {
                    "type": "LineString",
                    "coordinates": []
                }
            };

            //**** Fill the void GeoJson with the data from the file for path history
            var array = fs.readFileSync(filename_).toString()
            if (array != '')
                {
                array = array.slice(1).split("+");
                var tmpcoor = array.map( x => x.slice(1,-1).split(",").map( v => parseFloat(v.slice(1,-1))));
                data.geometry.coordinates = tmpcoor;
                }
            response.end(JSON.stringify(data));
                
        }
    else
        {
        console.log("FILE does not exist!");
        response.end(null);
        }
    
}); 

//**** Socket on https on port 6600 for the communication from server.js to online.js
var MySocketSecure = https.createServer(options).listen(6600, function() {
    var host = MySocketSecure.address().address;
    var port = MySocketSecure.address().port;
    console.log("socket at https://%s:%s",host,port);
});

//**** Socket on http on port 6700 for the communication from server.js to online.js --> CURRENTLY UNUSED
var MySocket = http.createServer().listen(6700, function() {
    var host = MySocket.address().address;
    var port = MySocket.address().port;
    console.log("socket at http://%s:%s",host,port);
});

//**** Defining the socket environment for the communication from server.js to online.js
var ioSecure = require('socket.io').listen(MySocketSecure);
var io = require('socket.io').listen(MySocket);

/****** FOR CLIENT => SERVER COMMUNICATION WITH SOCKET
io.sockets.on('connection', function(socket) {
    //console.log('A client is connected!');

    
    socket.on('message', function(message) {
	console.log('The client has a message for you: ' + message);
    });
    

    socket.emit('message', 'You are connected!');
});
******/

/****** FOR SERVER => CLIENT COMMUNICATION WITH SOCKET
var i=0;
setInterval(function() {
    ioSecure.sockets.send('hello!' + i);
    i++;
}, 10000);
******/

//**** Defining the UDP socket on dgram environment for the communication from RVACC to server.js
const dgram = require('dgram');
const udpSocket = dgram.createSocket('udp4');

//**** UDP dgram socket on port 6900 for the communication from RVACC to server.js
udpSocket.bind({
  address: '130.192.30.241',
  port: 6900
});

udpSocket.on('listening', () => {
  const address = udpSocket.address();
  var host = address.address;
  var port = address.port;
  console.log('UDPsocket at dgram://%s:%s',host,port);
});

//**** As the UDP dgram socket receives a message from RVACC, it sends the message on the socket from server.js to online.js
udpSocket.on('message', (msg,rinfo) => {
    //console.log(msg.toString())
    //console.log('I have received from %s:%s the message: %s',rinfo.address,rinfo.port,msg);
    ioSecure.sockets.send(msg.toString());
    io.sockets.send(msg.toString());
});

//**** Server https on port 6400 for reaching the web page with https
var serverHttps = https.createServer(options, app).listen(6400, function() {
    var host = serverHttps.address().address;
    var port = serverHttps.address().port;
    console.log("listening at https://%s:%s",host,port);
});

//**** Server http on port 6500 for reaching the web page with http
var serverHttp = http.createServer(app).listen(6500, function() {
    var host = serverHttp.address().address;
    var port = serverHttp.address().port;
    console.log("listening at http://%s:%s",host,port);
});
