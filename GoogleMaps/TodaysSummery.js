import React from 'react';
import { Text, Image, View, StyleSheet, Dimensions, Switch, Button, Alert, TouchableOpacity, ToastAndroid } from "react-native";
import AntDesign from "react-native-vector-icons/AntDesign";
import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Colors } from '../styles';
import { Options } from '../config';
import { GOOGLE_API_KEY, SOCKET_IO_URL, BASE_URL, SMS_API_URL } from '../config/api';

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";
import * as Animatable from 'react-native-animatable';

const {height, width} = Dimensions.get('window');

export default function TodaysSummery(props) {
	const [isEnabled, setIsEnabled] = React.useState(false);
	const [todaysTrips, setTodaysTrips] = React.useState(0);
	const [todaysEarnings, setTodaysEarnings] = React.useState(0);
	const [todaysDistance, setTodaysDistance] = React.useState(0);
	const [todaysRatings, setTodaysRatings] = React.useState(0);
	const [driverMobile, setDriverMobile] = React.useState();
	
	const getStatusDataOnLoad = async () => {
		try {
			const driverStatusStorage = await AsyncStorage.getItem('driverStatus')
			
			if(driverStatusStorage == 'online') {
				setIsEnabled(true); 
				props.activeDriverStatus(isEnabled);
			}
			else {
				setIsEnabled(false); 
				props.deactiveDriverStatus(isEnabled); 
			}
			
			const mobile = await AsyncStorage.getItem('mobile');
			if(mobile !== null) { setDriverMobile(mobile); }
		}
		catch (error) { console.error(error); }
	}

	React.useEffect(() => { 
		getStatusDataOnLoad();
		getTodaysSummery();
	}, [driverMobile]);


	const statusChange = () => {
		if(isEnabled){
			Alert.alert('Go Offline?', 'Do you really want to go Offline? You will not Received any Trip Request when you are Offline.', 
				[
					{ text: 'No', onPress: () => console.log('No Pressed'), style: 'cancel' },
					{ text: 'Go Offline', onPress: () => {
						setIsEnabled(previousState => !previousState); 
						props.deactiveDriverStatus(isEnabled); 
						ToastAndroid.show('Driver Status Offline successfully!', ToastAndroid.SHORT);
					}}
				], 
				{ cancelable: true }
			);
		}
		else {
			setIsEnabled(previousState => !previousState);
			props.activeDriverStatus(isEnabled);
			ToastAndroid.show('Driver Status Online successfully!', ToastAndroid.SHORT);
		}

		//update Summery
		getTodaysSummery();
	}

	const getTodaysSummery = async () => {
		await axios.get(BASE_URL+'/get-driver-todays-summery/'+driverMobile)
		.then(response => {
			if(response.data.code === 200) {
				setTodaysTrips(response.data.todays_trips);
				setTodaysEarnings(response.data.todays_earnings);
				setTodaysDistance(response.data.todays_distance);
				setTodaysRatings(response.data.todays_ratings);
			}
		})
		.catch((error) => {
			console.log("get-driver-todays-summery: "+error.message);
			ToastAndroid.show(Options.APP_OPTIONS.NETWORK_ERROR_MESSAGE, ToastAndroid.SHORT); 
		});
	}
  
    return (
		<View style={styles.container}>
			<View style={styles.header}>
				<TouchableOpacity onPress={() => props.navigation.navigate('Home')}>
					<AntDesign name="home" size={30} style={{color:"#fff"}} />
				</TouchableOpacity>
				
				<View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
					<Text style={{fontSize: 18, fontWeight: 'bold', color: 'white'}}>{isEnabled ? 'You are Online' : 'You are Offline'}</Text>
				</View>
				<View>
					<Switch trackColor={{ false: Colors.GRAY_DARK, true: Colors.PRIMARY_LIGHT }}
					thumbColor={isEnabled ? Colors.ORANGE_RED : "#f4f3f4"} ios_backgroundColor="#3e3e3e"
					onValueChange={statusChange} value={isEnabled} />
				</View>
			</View>

			{!isEnabled && (
			<Animatable.View animation="slideInUp" iterationCount={1} delay={1000} useNativeDriver={true} style={styles.bottom}>
				<Text style={{color: 'orange', fontSize: 18, fontWeight: 'bold'}}>You are Offline!</Text>
				<Text style={{color: 'white'}}>Please Turn On your status to received Ride Request.</Text>
			</Animatable.View>
			)}

			{isEnabled && (
			<Animatable.View animation="slideInUp" iterationCount={1} delay={1000} useNativeDriver={true} style={styles.bottomSummery}>
				<Text style={{fontSize: 20, marginBottom: 15, textAlign: 'center', borderBottomColor: '#ddd', borderBottomWidth: 1, paddingBottom: 10}}>Today's Summery</Text>
				<View style={styles.itemRow}>
					<View style={styles.itemInner}>
						<Text style={styles.itemTitle}>Total Trips</Text>
						<Text style={styles.itemContent}><MaterialCommunityIcons name="bike" size={20} color={Colors.PRIMARY} /> {todaysTrips} Trips</Text>
					</View>
					<View style={styles.itemInner}>
						<Text style={styles.itemTitle}>Total Earnings</Text>
						<Text style={styles.itemContent}><MaterialCommunityIcons name="wallet-outline" size={20} color={Colors.PRIMARY} /> {Number(todaysEarnings).toFixed(2)} LYD</Text>
					</View>
				</View>

				<View style={styles.itemRow}>
					<View style={styles.itemInner}>
						<Text style={styles.itemTitle}>Total Distance</Text>
						<Text style={styles.itemContent}><Ionicons name="time-outline" size={20} color={Colors.PRIMARY} /> {Number(todaysDistance).toFixed(2)} KM</Text>
					</View>
					<View style={styles.itemInner}>
						<Text style={styles.itemTitle}>Total Avg. Ratings</Text>
						<Text style={styles.itemContent}><AntDesign name="staro" size={20} color={Colors.PRIMARY} /> {Number(todaysRatings).toFixed(2)} Star</Text>
					</View>
				</View>
			</Animatable.View>
			)}
		</View>
    );
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		width: width
	},
	header: {
		top: 0,
		left: 0,
        position: 'absolute',
		zIndex: 9999,
		backgroundColor: Colors.HEADER_NAV_COLOR,
		flexDirection: 'row',
		justifyContent: 'center', 
		alignItems: 'center',
		paddingHorizontal: 10,
		height: 50,
		width: width,
		textAlign: 'center'
	},
	headerText:{
		color:"#fff",
		fontSize:14
	},
	logo:{
		width:50,
		height:50,
		alignSelf: 'center'
	},
	bottom: {
		bottom: 0,
		left: 0,
        position: 'absolute',
		zIndex: 9999,
		backgroundColor: Colors.RED,
		justifyContent: 'center', 
		paddingHorizontal: 10,
		height: 60,
		width: width
	},
	bottomSummery: {
        position: 'absolute',
		bottom: 0,
		left: 0,
		width: width,
		zIndex: 9999,
		backgroundColor: "#fff",
		paddingVertical: 5,
		paddingHorizontal: 15,
		borderRadius: 5,
		elevation: 3,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
    	shadowRadius: 3
	},
	itemRow: {
		flexDirection: 'row', 
		justifyContent: 'space-between', 
		alignItems: 'flex-start',
		marginBottom: 20
	},
	itemInner: {
		backgroundColor: '#fff',
		width: (width/2)-20
	},
	itemTitle: {
		fontSize: 16, 
		color: '#222',
		marginBottom: 3,
		fontWeight: 'bold'
	},
	itemContent: {
		fontSize: 18, 
		color: '#333'
	}
});
