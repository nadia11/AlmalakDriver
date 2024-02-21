import axios from "axios";

//const BASE_URL = __DEV__ ? 'http://127.0.0.1/api/android/driver' : 'http://admin-panel.almalak.com/api/android/driver';
const BASE_URL =  'https://f73a-27-147-170-201.ngrok-free.app/api/android/driver';
const GOOGLE_API_KEY ='AIzaSyBzzTk-gzFStNFGDfSlS-H3HENq-ZAlkyQ';
const SOCKET_IO_URL = 'https://04ce-27-147-170-201.ngrok-free.app';
const SMS_API_URL =  'https://f73a-27-147-170-201.ngrok-free.app/api/android/rider/';
const pusher_app_key = 'YOUR PUSHER APP KEY';
const pusher_app_cluster = 'YOUR PUSHER APP CLUSTER';
//const x=1;
 
module.exports = {
    BASE_URL,
    GOOGLE_API_KEY,
    SOCKET_IO_URL,
    SMS_API_URL,
	pusher_app_key,
    pusher_app_cluster
};