const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
const PORT = 3030;
//const SERVER_IP = '52.220.93.155';


/*
//MySQL npm install socket.io mysql
const mysql = require('mysql');
const db = mysql.createConnection({
    connectionLimit: 100,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'esojai-admin-panel',
    debug: false
})

db.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");

    // var sql = "INSERT INTO customers (name, address) VALUES ('Company Inc', 'Highway 37')";
    // db.query(sql, function (err, result) {
    //   if (err) throw err;
    //   console.log("1 record inserted");
    // });

    // db.query("SELECT * FROM customers", function (err, result, fields) {
    //     if (err) throw err;
    //     console.log(result);
    //     console.log(result[2].address);
    //     console.log(fields);
    //     console.log(fields[1].name);
    // });    
  });
*/


app.get("/", (req, res) => { res.send('Hello World from node.js'); });
app.get('/sub', (req, res) => { res.send('Test Sub Page from node.js'); });

//demo url== http://159.65.139.127:3030/chat-message
//demo url== http://159.65.139.127:3030/check-socket

app.get('/chat-message', function(req, res) {
    res.sendFile(__dirname + '/chatMessage.html');
});

app.get('/check-socket', function(req, res) {
    res.sendFile(__dirname + '/checkSocket.html');
});



let taxiSocket = null;
let passengerSocket = null;

io.on('connection', (socket) => {
    //socket.broadcast.emit('hi');
    //socket.id = generateId();
    //socket.join(socket.id);
    //io.to(socket.id).emit('message', { message : 'Hello there!' }); 
    console.log('a user connected, socket.id: ' + socket.id);
	//console.log(socket.connected);
	//console.log(socket.disconnected);
		
	socket.on('driverSentRequestToJoinTripChat', (request) => {
		console.log("driverSentRequestToJoinTripChat room: "+request.room, "tripNumber: " + request.tripNumber);
		io.emit('driverSentRequestToJoinTripChat', request);
    });
	
	socket.on('riderSentRequestToJoinTripChat', (request) => {
		console.log("riderSentRequestToJoinTripChat room: "+request.room, "tripNumber: " + request.tripNumber);
		io.emit('riderSentRequestToJoinTripChat', request);
    });
	
	socket.on('joinTripChat', ({ name, room, tripNumber }, callback) => {
        //console.log("Join Request: ", name);
        socket.join(room);
		socket.emit('tripMessage', {user: 'system', text: `Welcome ${name} to Trip Chat ${tripNumber}.`});
		socket.broadcast.to(room).emit('tripMessage', {room: room, user: 'system', date:`${new Date().getTime()}`, text: `${name} just joined on Trip Chat ${tripNumber}.`, socketId: socket.id});
    });
	
	socket.on('tripMessage', (msg) => {
		console.log("room: "+msg.room, "text: " + msg.text);
		io.to(msg.room).emit('tripMessage', msg);
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
		//socket.open();
    });
	
    socket.on('chat message', msg => {
        console.log('user-'+socket.id+', message: ' + msg.message);
        io.emit('chat message', msg);
    });

	socket.on('passengerRequest', () => {
        console.log("Someone wants a passenger!");
        taxiSocket = socket;
    });
	
    socket.on('taxiRequest', taxiRoute => {
        passengerSocket = socket;
        console.log("Someone wants a taxi!"+taxiRoute.tripNumber);

        if(taxiSocket != null) {
            taxiSocket.emit('taxiRequest', taxiRoute);
        }
    });
		
    socket.on("driverLocation", driverLocation => {
        console.log("driverLocation: "+driverLocation.latitude+","+driverLocation.longitude);
        passengerSocket.emit("driverLocation", driverLocation);
    });

    socket.on("updateDriverCurrentLocation", driverLocation => {
        console.log("updateDriverCurrentLocation: "+driverLocation.latitude+","+driverLocation.longitude);
        io.emit("updateDriverCurrentLocation", driverLocation);
    });
    
    socket.on('assignedDriverMobile', mobile => {
        console.log("assignedDriverMobile: " + mobile.driverMobile);
        passengerSocket.emit('assignedDriverMobile', mobile);
    });
		
    socket.on('arriveDriver', (arrive) => {
		console.log("arriveDriver: " + arrive.driverArrive);
        passengerSocket.emit('arriveDriver', arrive);
    });
		
    socket.on('startTrip', lastLatLong => {
        console.log("startTrip: " + lastLatLong.latitude + ", "+lastLatLong.longitude);
        passengerSocket.emit('startTrip', lastLatLong);
    });
		
    socket.on('completeTrip', lastLatLong => {
        console.log("completeTrip: " + lastLatLong.latitude + ", "+lastLatLong.longitude);
        passengerSocket.emit('completeTrip', lastLatLong);
    });
    
    socket.on('cancelTripByDriver', (number) => {
		console.log("cancelTripByDriver: " + number.tripNumber);
        io.emit('cancelTripByDriver', number);
    });
		
    socket.on('cancelTripByRider', (number) => {
		console.log("cancelTripByRider: " + number.tripNumber);
        io.emit('cancelTripByRider', number);
    });
	
    socket.on('resetDriverUI', result => {
        console.log("Reset Driver UI: " + result.driverMobile);
        io.emit('resetDriverUI', result);
    });
	
	socket.on('driverSentFeedback', resutl => {
        console.log("driverSentFeedback: " + resutl.ratings);
        io.emit('driverSentFeedback', resutl);
    });
		
	socket.on('riderSentFeedback', resutl => {
        console.log("riderSentFeedback: " + resutl.ratings);
        io.emit('riderSentFeedback', resutl);
    });
});

server.listen(PORT, () => {
   console.log('server running on PORT: ' + PORT)
});

// server.listen(PORT, SERVER_IP, () => {
    // console.log(`server running on IP: ${SERVER_IP}:${PORT}`);
// });
