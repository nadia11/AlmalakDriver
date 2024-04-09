import React from "react";
import { StyleSheet, Text, TextInput, View, TouchableOpacity, TouchableWithoutFeedback, Dimensions, ActivityIndicator, Alert, Image, Linking, Platform, Keyboard, ToastAndroid } from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import {Picker} from '@react-native-picker/picker';
import Modal from 'react-native-modal';
import socketIO from 'socket.io-client';
import axios from 'axios';

import { BASE_URL, SMS_API_URL, GOOGLE_API_KEY, SOCKET_IO_URL } from '../config/api';
import { Colors } from '../styles';
import { Options } from '../config';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;


export default function TripControlArriveScreen(props){
  const [animating, setAnimating] = React.useState(false);
  const [reason, setReason] = React.useState('');
  const [modal, setModal] =  React.useState(false);
  let socket = null;

  const riderName = props.riderName;
  const riderPhoto = props.riderPhoto;
  const tripDistance = props.distance;
  const tripDuration = props.duration;
  const riderMobile = props.riderMobile;
  const initialFare = props.initialFare ? props.initialFare : 0;
  const driverEmail = props.email;
  const driverMobile = props.driverMobile;
  const tripNumber = props.tripNumber;
  const latitude = props.latitude;
  const longitude = props.longitude;
  const markerHeading = props.markerHeading;
  const startLatitude = props.startLatitude;
  const startLongitude = props.startLongitude;
  const pickupLocation = props.pickupLocation;
  const dropOffLocation = props.dropOffLocation;

  React.useEffect(() => {
    socket = socketIO(SOCKET_IO_URL);

    socket.on("riderSentRequestToJoinTripChat", request => {
      if(tripNumber === request.tripNumber) {
        console.log("riderSentRequestToJoinTripChat: "+request.room, "tripNumber: "+tripNumber, "request.tripNumber: "+request.tripNumber)
        props.navigation.navigate('chatMessage', {name: riderName, room: "room-"+tripNumber, tripNumber: tripNumber, mobile: riderMobile, photo: riderPhoto});
      }
    });
  }, []);

  const goToMessage = () => {
    props.navigation.navigate('chatMessage', {
      name: riderName, 
      room: "room-"+tripNumber, 
      tripNumber: tripNumber, 
      mobile: riderMobile,
      photo: riderPhoto
    });
  }
  

  const arrivedDriver = () => {
    Alert.alert('Arrived?', 'Are you really arrived to Rider Location?', [
      { text: 'No', onPress: () => console.log('No Pressed'), style: 'cancel' },
      { text: 'Yes, Arrived', onPress: () => arrivedHandlerConfirm()},
    ], { cancelable: true });
  }

  const arrivedHandlerConfirm = async () => {
    setAnimating( true );

    await axios.post(BASE_URL+'/arrive-driver-to-rider-location', {
      trip_number: tripNumber,
      latitude: latitude,
      longitude: longitude,
      marker_heading: markerHeading,
      email: driverEmail
    })
    .then(response => {
      if(response.data.code === 200){
        props.driverArriveHandle();
        setAnimating( false );
        ToastAndroid.showWithGravity(response.data.message, ToastAndroid.LONG, ToastAndroid.CENTER);
      }
    })
    .catch((error) => {
      setAnimating( false );
      console.log('arrive-driver: ', error.message);
      ToastAndroid.show(Options.APP_OPTIONS.NETWORK_ERROR_MESSAGE, ToastAndroid.SHORT); 
    });
  }
  
  const startTrip = () => {
    Alert.alert('Start Trip?', 'Do you want to Start Ride?', [
      { text: 'No', onPress: () => console.log('No Pressed'), style: 'cancel' },
      { text: 'Yes, Start', onPress: () => startTripConfirm()},
    ], { cancelable: true });
  }

  const startTripConfirm = async () => {
    setAnimating( true );

    await axios.post(BASE_URL+'/start-trip', {
      email: driverEmail,
      trip_number: tripNumber,
      latitude: latitude,
      longitude: longitude,
      marker_heading: markerHeading,
    })
    .then(response => {
      if(response.data.code === 200){
        setAnimating( false );
        props.startTripHandle();
        ToastAndroid.showWithGravity(response.data.message, ToastAndroid.LONG, ToastAndroid.CENTER);
      }
    })
    .catch((error) => {
      setAnimating( false );
      console.log('start-trip: ', error.message);
      ToastAndroid.show(Options.APP_OPTIONS.NETWORK_ERROR_MESSAGE, ToastAndroid.SHORT); 
    });
  }
  
  const completeTrip = () => {
    Alert.alert('Complete Trip?', 'Do you want to Complete Ride?', [
      { text: 'No', onPress: () => console.log('No Pressed'), style: 'cancel' },
      { text: 'Yes, Complete', onPress: () => getDistanceMatrixData()},
    ], { cancelable: true });
  }

  const getDistanceMatrixData = async () => {
    await fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?origins=${startLatitude},${startLongitude}&destinations=${latitude},${longitude}&key=${GOOGLE_API_KEY}&mode=driving`)
    .then((response) => response.json())
    .then((json) => {
      if(json.status === "OK") {
        let endDistanceValue = json.rows[0].elements[0]?.distance?.value || 0;
        let endDistanceText = json.rows[0].elements[0]?.distance?.text || "";
        let endDurationValue = json.rows[0].elements[0]?.duration?.value || 0;
        let endDurationText = json.rows[0].elements[0]?.duration?.text || "";
        let endDropOffLocation = json?.destination_addresses[0] || "";

        handleTakeSnapshot();
        submitCompleteTripToDatabase(endDistanceValue, endDistanceText, endDurationValue, endDurationText, endDropOffLocation);
      }
    })
    .catch((error) => console.error(error));
  }

  const submitCompleteTripToDatabase = async (endDistanceValue, endDistanceText, endDurationValue, endDurationText, endDropOffLocation) => {
    if(endDistanceValue) {
      setAnimating( true );
      //console.log("tripNumber: "+tripNumber+", startLatitude: "+startLatitude+", startLongitude: "+startLongitude+", latitude: "+latitude+", longitude: "+longitude+"endDistanceValue: "+endDistanceValue+"endDurationValue: "+endDurationValue+"endDistanceText: "+endDistanceText+"endDurationText: "+endDurationText+"endDropOffLocation: "+endDropOffLocation);
      
      await axios.post(BASE_URL+'/complete-trip', {
        email: driverEmail,
        trip_number: tripNumber,
        end_latitude: latitude, 
        end_longitude: longitude,
        marker_heading: markerHeading,
        end_distance_value: endDistanceValue,
        end_distance_text: endDistanceText,
        end_duration_value: endDurationValue,
        end_duration_text: endDurationText,
        end_drop_off_location: endDropOffLocation
      })
      .then(response => {
        if(response.data.code === 200) {
          setAnimating( false );
          props.completeTripHandle();
          
          props.navigation.navigate('driverPaymentInvoice', {
            driverMobile: driverMobile,
            email: driverEmail,
            tripNumber: tripNumber,
            pickupLocation: pickupLocation,
            endDropOffLocation: endDropOffLocation,
            endDistanceText: endDistanceText,
            endDurationText: endDurationText,
            fare: response.data.message.fare,
            paymentMethod: response.data.message.payment_method ? response.data.message.payment_method : "Cash Payment",
            delayCancellationFee: response.data.delay_cancellation_fee,
            destinationChangeFee: response.data.destination_change_fee
          });
        }
      })
      .catch((error) => {
        setAnimating( false );
        console.log("complete-trip: "+error.message);
        ToastAndroid.show(Options.APP_OPTIONS.NETWORK_ERROR_MESSAGE, ToastAndroid.SHORT); 
      });
    }
  }

  const handlePhoneCall = () => {
    let dialPad = '';
    if (Platform.OS === 'android') { dialPad = 'tel:${'+riderMobile+'}'; }
    else { dialPad = 'telprompt:${'+riderMobile+'}'; }
    
    Alert.alert('Phone Call?', 'Do you want to Phone Call to Rider?', [
      { text: 'No', onPress: () => console.log('No Pressed'), style: 'cancel' },
      { text: 'Yes, Call', onPress: () => Linking.openURL(dialPad)},
    ], { cancelable: true });
  }

  const handleCancelRequest = () => {
    Alert.alert('Cancel Ride?', 'Do you want to cancel this ride?', [
      { text: 'No', onPress: () => console.log('No Pressed'), style: 'cancel' },
      { text: 'Yes, Cancel', onPress: () => setModal(true)},
    ], { cancelable: true });
  }

  const handleCancelRequestConfirm = async () => {
    setAnimating( true );

    await axios.post(BASE_URL+'/cancel-request-by-driver', {
      mobile: driverMobile,
      email: driverEmail,
      trip_number: tripNumber,
      reason_for_cancellation: reason,
      latitude: latitude,
      longitude: longitude,
      marker_heading: markerHeading
    })
    .then(response => {
      if(response.data.code === 200){
        setAnimating( false );
        props.handleCancel();
        ToastAndroid.showWithGravity(response.data.message, ToastAndroid.LONG, ToastAndroid.CENTER);
      }
    })
    .catch((error) => {
      setAnimating( false );
      console.log("cancel-request-by-driver: ", error.message);
      ToastAndroid.show(Options.APP_OPTIONS.NETWORK_ERROR_MESSAGE, ToastAndroid.SHORT); 
    });
  }

  const handleTakeSnapshot = () => {
    const snapshot = props.mapRef.takeSnapshot({ width: 110, height: 200, region: props.LatLongAndDelta, format: 'jpg', quality: 0.7, result: 'base64' });
    snapshot.then(async (uri) => {
      await axios.post(`${BASE_URL}/save-trip-map-snapshot`, {
        trip_number: tripNumber,
        snaphot_url: 'data:image/jpeg;base64,' + uri,
        extension: 'png'
      })
      .then(response => {
        if(response.data.code === 200) {
          console.log(response.data.message);
        }
      })
      .catch((error) => {
        console.log("save-trip-map-snapshot: ", error.message);
        ToastAndroid.showWithGravity(Options.APP_OPTIONS.NETWORK_ERROR_MESSAGE, ToastAndroid.LONG, ToastAndroid.CENTER);
      });
    });
  }
  
  const disabledCallButton = () => {
    return riderMobile == '' ? 0 : 1;
  }

  const disabledBtnCancel = () => {
    return reason == '' ? 0 : 1;
  }

  return (
    <View style={styles.container}>
      <View style={styles.topPanel}>
        <View style={styles.headerNotification}>
          <Text style={{color: '#fff', fontSize: 20, textAlign: 'center'}}>{props.titleText}</Text>
        </View>

        <View style={styles.topDestination}>
          <View style={{backgroundColor: '#fff', width: '60%', alignItems: 'flex-start', paddingLeft: 10}}>
            <Text style={{fontSize: 16, textAlign: 'left'}} numberOfLines={1} ellipsizeMode="tail">Pickup: {pickupLocation}</Text>
            <Text style={{fontSize: 16, textAlign: 'left'}} numberOfLines={1} ellipsizeMode="tail">Destination: {dropOffLocation}</Text>
          </View>

          <View style={{backgroundColor: '#fff', width: '40%', alignItems: 'center',  borderColor: '#eee', borderLeftWidth: 1 }}>
            <View style={styles.imageWrap}>
                {riderPhoto !== "" && <Image style={styles.image} source={{uri: riderPhoto, crop: {left: 30, top: 30, width: 50, height: 50}}} /> }
                {riderPhoto == "" && <Image style={styles.image} source={require('../assets/avatar.png')} /> }
            </View>
            <Text style={styles.name}>{riderName}</Text>
          </View>
        </View>
        
        <View style={{backgroundColor: '#fff', flexDirection: 'row', width: SCREEN_WIDTH, justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#ddd' }}>
          <View style={styles.appButton}>
            <Ionicons name="time-outline" size={25} color={Colors.PRIMARY} />
            <Text>{tripDuration}</Text>
          </View>

          <View style={styles.appButton}>
            <MaterialCommunityIcons name="google-maps" size={25} color={Colors.PRIMARY} />
            <Text>{tripDistance}</Text>
          </View>

          <View style={styles.appButton}>
            <MaterialCommunityIcons name="cash-multiple" size={25} color={Colors.PRIMARY} />
            <Text>{Number(initialFare).toFixed(2)}</Text>
          </View>

          {props.driverArriveStatus === true && (
            <TouchableOpacity onPress={handlePhoneCall} style={[styles.appButton, {backgroundColor: Colors.GREEN, borderColor: Colors.GREEN, opacity: (disabledCallButton() == 0 ? 0.7 : 1) }]} disabled={disabledCallButton() == 0 ? true : false}>
              <FontAwesome name="phone" size={30} color="#fff" />
              <Text style={{ textAlign: 'center', color: '#fff', fontWeight: 'bold'}}>Call</Text>
            </TouchableOpacity>
          )}

          {(props.startTripStatus === true || props.completeTripStatus === true) && (
            <TouchableOpacity onPress={() => props.navigationHandle()} style={[styles.appButton, {backgroundColor: 'yellow', borderColor: "yellow"}]}>
              <MaterialCommunityIcons name="navigation" size={30} color="red" />
              <Text style={{ textAlign: 'center', color: 'red', fontWeight: 'bold'}}>Navigate</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {(props.startTripStatus === true || props.completeTripStatus === true) && (
        <TouchableOpacity onPress={() => props.showsTraffic()} style={{
          // position: 'absolute',
          width: 50,
          height: 50,
          top: 20,
          left: SCREEN_WIDTH-50,
          zIndex: 999,
          alignItems: 'center',
          backgroundColor: '#fff',
          borderRadius: 50,
          padding: 10
        }}>
          <MaterialCommunityIcons name="traffic-light" size={30} color="red" />
        </TouchableOpacity>
      )}

      <View style={styles.bottomButtonPanel}>
        {(props.startTripStatus === false && props.completeTripStatus === false) && (
          <TouchableOpacity onPress={handleCancelRequest} style={styles.rejectButton}>
            <Text style={styles.rejectButtonText}>X</Text>
          </TouchableOpacity>
        )}

        {(props.startTripStatus === false && props.completeTripStatus === false) && (
          <TouchableOpacity onPress={() => arrivedDriver()} style={[styles.addButton, (!animating ? {justifyContent: 'center'} : "")]}>
            <ActivityIndicator animating={animating} color='#fff' size="small" />
            <Text style={styles.addButtonText}>{animating === false ? "ARRIVED" : "Submitting..."}</Text>
          </TouchableOpacity>
        )}

        {props.startTripStatus === true && (
          <TouchableOpacity onPress={() => startTrip()} style={[styles.addButton, (!animating ? {justifyContent: 'center'} : "")]}>
            <ActivityIndicator animating={animating} color='#fff' size="small" />
            <Text style={styles.addButtonText}>{animating === false ? "Start Trip" : "Submitting..."}</Text>
          </TouchableOpacity>
        )}

        {props.completeTripStatus === true && (
          <TouchableOpacity onPress={() => completeTrip()} style={[styles.addButton, (!animating ? {justifyContent: 'center'} : "")]}>
            <ActivityIndicator animating={animating} color='#fff' size="small" />
            <Text style={styles.addButtonText}>{animating === false ? "Complete Trip" : "Submitting..."}</Text>
          </TouchableOpacity>
        )}
        
        {(props.startTripStatus === false && props.completeTripStatus === false) && (
          <TouchableOpacity onPress={() => goToMessage()} style={styles.messageButton}>
            <Ionicons name='chatbox' size={25} color="#333" />
          </TouchableOpacity>
        )}
      </View>

      <Modal isVisible={modal} animationType='slide' backdropColor="#000" backdropOpacity={0.3} style={styles.bottomModal} onBackButtonPress={() => setModal(false)} onBackdropPress={() => setModal(false)} deviceWidth={SCREEN_WIDTH} deviceHeight={SCREEN_HEIGHT}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ backgroundColor: '#fff', height: 300 }}>
            <Text style={styles.title}>Reason for Ride Cancellation</Text>
            <Text style={{paddingHorizontal: 30, paddingBottom: 20, fontSize: 16}}>Please specify that, why you are cancel ride?</Text>
            
            <View style={[styles.textInput, {width: (SCREEN_WIDTH - 60), marginLeft: 30, paddingRight: 0}]}>
              <Picker selectedValue={reason} onValueChange={(itemValue, itemIndex) => setReason(itemValue)}>
                <Picker.Item label="--Select Reason--" value="" />
                <Picker.Item label="Vehicle Problem" value="VehicleProblem" />
                <Picker.Item label="Others" value="others" />
              </Picker>
            </View>

            <TouchableOpacity onPress={() => handleCancelRequestConfirm()} style={[styles.confirmCancelButton, (!animating ? {justifyContent: 'center'} : ""), { opacity: (disabledBtnCancel() == 0 ? 0.7 : 1) }]} disabled={disabledBtnCancel() == 0 ? true : false}>
              <ActivityIndicator animating={animating} color='#fff' size="small" />
              <Text style={styles.confirmCancelButtonText}>{animating === false ? "Confirm Cancel Ride" : "Cancelling..."}</Text>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start'
  },
  topPanel: {
    top: 0,
    left: 0,
    zIndex: 999,
    width: SCREEN_WIDTH,
    backgroundColor: '#fff',
    elevation: 10,
    shadowColor: 'red',
    shadowOpacity: 0.5,
    shadowOffset: { height: 0, width: 0},
    shadowRadius: 10
  },
  headerNotification: {
    backgroundColor: Colors.HEADER_NAV_COLOR,
    paddingHorizontal: 15,
    paddingVertical: 10
  },
  topDestination: {
    width: SCREEN_WIDTH,
    height: 100,
    width: SCREEN_WIDTH,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  appButton: {
    width: SCREEN_WIDTH / 4, 
    borderRightColor: '#ddd', 
    borderRightWidth: 1, 
    height: 50,
    paddingVertical: 2, 
    justifyContent: 'center', 
    alignItems: 'center'
  },
  name: {
    fontSize: 16,
    color: 'dodgerblue',
    textAlign: 'center'
  },
  imageWrap: {
    height: 60,
    width: 60,
    backgroundColor:"#fff",
    borderBottomColor: '#000',
    borderBottomWidth: 5,
    borderRadius: 100,
    elevation: 5,
    shadowColor: '#333',
    shadowOpacity: 0.5,
    shadowOffset: { height: 0, width: 0},
    shadowRadius: 7
  },
  image: {
    height: 60,
    width: 60,
    // resizeMode: 'contain',
    borderRadius: 50,
  },
  vehicleImage: {
    height: 60,
    width: 100,
    resizeMode: 'contain',
    alignSelf: 'flex-end'
  },
  model: {
    fontSize: 22,
    textAlign: 'right'
  },
  brand: {
    fontSize: 18,
    textAlign: 'right'
  },
  cancelRequestButton: {
    backgroundColor: "#eee",
    borderWidth: 1,
    borderColor: 'red',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 40,
    marginRight: 10
  },
  cancelRequestButtonText : {
    fontSize: 18,
    color: "#333", 
  },
  callDriverButton: {
    alignSelf: "center",
    backgroundColor: "red",
    padding: 14,
    width: 50,
    height: 50,
    borderRadius: 100,
    marginLeft: 10
  },
  callDriverButtonText : {

    textAlign: 'center'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 10,
    color: Colors.PRIMARY
  },

  bottomButtonPanel: {
    position: 'absolute',
    bottom: 20,
    left: 25,
    width: SCREEN_WIDTH-50,
    zIndex: 999,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center'
  },
  rejectButton: {
    backgroundColor: '#aaa',
    width: 40,
    height: 40,
    padding: 7,
    borderRadius: 50,
  },
  rejectButtonText : {
    fontSize: 18,
    color: "#000", 
    textAlign: 'center',
    textTransform: 'uppercase'
  },
  messageButton : {
    borderColor: '#ccc',
    backgroundColor: 'rgba(255,255,255,.5)',
    borderWidth: 1,
    width: 50,
    height: 50,
    padding: 12,
    borderRadius: 50
  },
  addButton: {
    backgroundColor: Colors.BUTTON_COLOR,
    width: SCREEN_WIDTH-160,
    borderRadius: 50,
    padding: 10,

    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center'
  },
  addButtonText : {
    fontSize: 20,
    color: "#fff", 
    textAlign: 'center'
  },
  textInput: {
    alignSelf: "stretch",
    fontSize: 16,
    height: 50,
    marginBottom: 50,
    color: "#333",
    borderColor: "#ccc",
    borderWidth: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingLeft: 45,
    borderRadius: 5,
    width: (SCREEN_WIDTH - 40)
  },
  bottomModal: {
    justifyContent: 'flex-end',
    margin: 0
  },
  confirmCancelButton: {
    alignSelf: "center",
    backgroundColor: Colors.BUTTON_COLOR,
    width: SCREEN_WIDTH-130,
    borderRadius: 3,
    padding: 10,
    marginBottom: 15,

    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center'
  },
  confirmCancelButtonText : {
    fontSize: 18,
    color: "#fff", 
    textAlign: 'center'
  },
});
