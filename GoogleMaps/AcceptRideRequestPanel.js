import React from "react";
import { StyleSheet, Text, TextInput, View, TouchableOpacity, Dimensions, ActivityIndicator, Alert, Image, TouchableWithoutFeedback, ToastAndroid, Keyboard } from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import Ionicons from "react-native-vector-icons/Ionicons";
import {Picker} from '@react-native-community/picker';
import { Rating } from 'react-native-elements';
import Modal from 'react-native-modal';
import axios from 'axios';

import { BASE_URL, SMS_API_URL } from '../config/api';
import { Colors } from '../styles';
import { Options } from '../config';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;


export default function AcceptRideRequestPanel(props)
{
  const [riderName, setRiderName] = React.useState("");
  const [riderMobile, setRiderMobile] = React.useState("");
  const [riderPhoto, setRiderPhoto] = React.useState("");
  const [ratings, setRatings] = React.useState(0);
  const [pickupLocation, setPickupLocation] = React.useState("");
  const [dropoffLocation, setDropoffLocation] = React.useState("");
  const [distance, setDistance] = React.useState("");
  const [fare, setFare] = React.useState(0);
    
  const [reason, setReason] = React.useState('');
  const [modal, setModal] =  React.useState(false);
  const [animating, setAnimating] = React.useState(false);

  const driverMobile = props.driverMobile;
  const driverEmail = props.driverEmail;
  const tripNumber = props.tripNumber;
  const latitude = props.latitude;
  const longitude = props.longitude;
  const markerHeading = props.markerHeading;


  const getUserData = async () => {
    await axios.get(BASE_URL+'/get-requested-rider-info/'+tripNumber)
    .then((response) => {
      if(response.data.code === 200) {
        setRiderName(response.data.rider_name);
        setRiderMobile(response.data.rider_mobile);
        setRiderPhoto(response.data.rider_photo);
        setRatings(response.data.rider_ratings);
        setPickupLocation(response.data.pickup_location);
        setDropoffLocation(response.data.drop_off_location);
        setDistance(response.data.distance);
        setFare(response.data.total_fare);
      }
    })
    .catch((error) => {
      console.log('get-requested-rider-info'+error.message);
      ToastAndroid.show(Options.APP_OPTIONS.NETWORK_ERROR_MESSAGE, ToastAndroid.SHORT); 
      setAnimating( false );
    });
  }
  React.useEffect(() => { 
    getUserData();
  }, []);


  const handleCancelRequest = () => {
    Alert.alert('Cancel Request?', 'Are you sure, you want to cancel ride request?', [
      { text: 'No', onPress: () => console.log('No Pressed'), style: 'cancel' },
      { text: 'Yes, Cancel', onPress: () => setModal(true)},
    ], { cancelable: true });
  }

  const handleCancelRequestConfirm = async () => {
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
        props.handleCancel();
        ToastAndroid.showWithGravity(response.data.message, ToastAndroid.LONG, ToastAndroid.CENTER);
      }
    })
    .catch((error) => {
      ToastAndroid.show(Options.APP_OPTIONS.NETWORK_ERROR_MESSAGE, ToastAndroid.SHORT); 
      setAnimating( false );
    });
  }

  const ratingCompleted = (rating) => {
    console.log("Rating is: " + rating);
  }

  const disabledBtn = () => {
    return reason == '' ? 0 : 1;
  }

  return (
    <View style={styles.container}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, paddingHorizontal: 15, marginBottom: 5, borderBottomColor: '#eee', borderBottomWidth: 1}}>
          <View style={{alignItems: 'flex-start'}}>
            <Text style={{fontWeight: 'bold', color: '#000', fontSize: 22}}>{riderName}</Text>
            <Rating type='custom' ratingCount={5} imageSize={20} startingValue={Number(ratings)} minValue={1} showRating={false} ratingColor="#F0CA02" ratingBackgroundColor='#c8c7c8' ratingTextColor="#333" onFinishRating={ratingCompleted} style={{ paddingVertical: 2 }} />
          </View>

          <View style={styles.imageWrap}>
              {riderPhoto !== "" && <Image style={styles.image} source={{uri: riderPhoto, crop: {left: 30, top: 30, width: 50, height: 50}}} /> }
              {riderPhoto == "" && <Image style={styles.image} source={require('../assets/avatar.png')} /> }
          </View>
        </View>

        <View style={{padding: 10}}>
          <View style={{position: 'absolute', left: 15, top: 12, backgroundColor: '#fff', width: 30, height: 80, zIndex: 99999}}>
            <Text style={{ position: 'absolute', left: 6.5, top: 0, width: 17, height: 17, borderColor: 'green', borderWidth: 2, borderRadius: 100}}></Text>
            <FontAwesome name="circle" size={10} color={Colors.GREEN_DEEP} style={{ position: 'absolute', left: 10.5, top: 3 }} />
            <View style={{position: 'absolute', left: -8, top: 40, borderWidth: 1, borderColor: '#333', borderStyle: 'dashed', width: 45, borderRadius: 1, transform:[{ rotate: '90deg'}] }} />
            <FontAwesome5 name="map-marker-alt" size={18} color={Colors.PRIMARY} style={{ position: 'absolute', left: 8, bottom: 0}} />
          </View>

          <View>
            <Text style={{marginLeft: 40, fontSize: 14, color: 'dodgerblue', fontWeight: 'bold', marginBottom: -10}}>Pickup Location</Text>
            <Text style={styles.pickUpLocation}>{pickupLocation}</Text>
          </View>

          <View>
            <Text style={{marginLeft: 40, fontSize: 14, color: 'dodgerblue', fontWeight: 'bold', marginBottom: -15}}>Drop off Location</Text>
            <Text style={styles.destination}>{dropoffLocation}</Text>
          </View>
        </View>
        
        <View style={{backgroundColor: '#f4f4f4', paddingHorizontal: 20, paddingVertical: 10, marginBottom: 10}}>
          <Text style={{fontSize: 18, color: '#000'}}>Distance: <Text style={{fontWeight: 'bold', color: 'red', fontSize: 18}}>{distance}</Text></Text>
          <Text style={{fontSize: 18, color: '#000'}}>Total Fare: <Text style={{fontWeight: 'bold', color: 'red', fontSize: 18}}>৳{Number(fare).toFixed(2)}</Text></Text>
        </View>

        <View style={{flexDirection: 'row', justifyContent: 'center', marginBottom: 10}}>
          <TouchableOpacity onPress={handleCancelRequest} style={styles.rejectButton}>
              <Text style={styles.rejectButtonText}>Reject</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => props.acceptRequest()} style={styles.acceptButton}>
              <Text style={styles.acceptButtonText}>Accept</Text>
          </TouchableOpacity>
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

              <TouchableOpacity onPress={() => handleCancelRequestConfirm()} style={[styles.confirmCancelButton, { opacity: (disabledBtn() == 0 ? 0.7 : 1) }]} disabled={disabledBtn() == 0 ? true : false}>
                <Text style={styles.confirmCancelButtonText}>Confirm Cancel Request</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
    </View >        
  );
}


const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: SCREEN_WIDTH-15,
    marginVertical: 8,
    marginLeft: 8,
    backgroundColor: '#fff',
    shadowColor: "#000",
    elevation: 7,
    shadowRadius: 5,
    shadowOpacity: 1.0,
    zIndex: 9999
  },
  pickUpLocation: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    padding: 10,
    marginLeft: 30,
    fontSize: 16,
    color: '#333'
  },
  destination: {
    padding: 10,
    marginLeft: 30,
    fontSize: 16,
    color: '#333'
  },
  rejectButton: {
    alignSelf: "center",
    backgroundColor: Colors.BUTTON_COLOR,
    width: (SCREEN_WIDTH/2)-20,
    padding: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginRight: 10
  },
  rejectButtonText : {
    fontSize: 18,
    color: "#fff", 
    textAlign: 'center',
    textTransform: 'uppercase'
  },
  acceptButton: {
    alignSelf: "center",
    backgroundColor: Colors.GREEN_LIGHT,
    width: (SCREEN_WIDTH/2)-30,
    padding: 10,
    paddingHorizontal: 20,
    borderRadius: 5
  },
  acceptButtonText : {
    fontSize: 18,
    color: "#fff", 
    textAlign: 'center',
    textTransform: 'uppercase'
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
});
