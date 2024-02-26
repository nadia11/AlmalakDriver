const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

app.use(cors());

const server = http.createServer({
    key: fs.readFileSync('/etc/pki/tls/certs/uderonline.key'),
    cert: fs.readFileSync('/etc/pki/tls/certs/udertaxi_com.crt'),
    ca: fs.readFileSync('/etc/pki/tls/certs/udertaxi_com.ca-bundle'),

    requestCert: false,
    rejectUnauthorized: false },app);

const io = new Server(server,{
        cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
    pingTimeout: 30000   }
    );
const PORT = 3030;

app.get("/", (req, res) => { res.send('Hello World from node.js'); });
app.get('/sub', (req, res) => { res.send('Test Sub Page from node.js'); });


app.get('/chat-message', function(req, res) {
    //res.sendFile(__dirname + '/chatMessage.html');
    console.log("checked");
});

app.get('/check-socket', function(req, res) {
    //res.sendFile(__dirname + '/checkSocket.html');
    console.log("checked");
});



let taxiSocket = null;
let passengerSocket = null;

io.on('connection', (socket) => {

		
	socket.on('driverSentRequestToJoinTripChat', (request) => {
		console.log("driverSentRequestToJoinTripChat room: "+request.room, "tripNumber: " + request.tripNumber);
		io.emit('driverSentRequestToJoinTripChat', request);
    });
	
	socket.on('riderSentRequestToJoinTripChat', (request) => {
		console.log("riderSentRequestToJoinTripChat room: "+request.room, "tripNumber: " + request.tripNumber);
		io.emit('riderSentRequestToJoinTripChat', request);
    });

    socket.on('test', (data) => {
        console.log('Test message received:', data.message);
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

    socket.on('disconnect', (event) => {
        console.log(event.stack || event);
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
	
    socket.on("taxiRequest", taxiRoute => {
        passengerSocket = socket;
        console.log("Someone wants a taxi!"+taxiRoute.tripNumber);
        io.emit('taxiRequest', taxiRoute);
        // if(taxiSocket != null) {
        //     taxiSocket.emit('taxiRequest', taxiRoute);
        // }
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
