import React from "react";
import { StyleSheet, Text, TextInput, View, TouchableOpacity, Dimensions, ActivityIndicator, Alert, Image, TouchableWithoutFeedback, ToastAndroid, Keyboard, ScrollView } from "react-native";
import axios from 'axios';
import { Rating, AirbnbRating } from 'react-native-ratings';
import Modal from 'react-native-modal';

import { BASE_URL, GOOGLE_API_KEY, SOCKET_IO_URL } from '../config/api';
import { Colors } from '../styles';
import { Options } from '../config';
import socketIO from 'socket.io-client';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;


export default function DriverPaymentInvoice(props)
{
  // const email = '';
  // const tripNumber = 'TRHZKK7G0D0A';
  // const latitude = '23.767908';
  // const longitude = '90.423242';
  // const fare = '100';
  // const endDistanceText = '12 km';
  // const endDurationText = '50 Min';
  // const pickupLocation = 'Rampura';
  // const endDropOffLocation = 'Gulistan';
  // const paymentMethod = 'Cash';

  const { driverMobile } = props.route.params;
  const { email } = props.route.params;
  const { tripNumber } = props.route.params;
  const { fare } = props.route.params;
  const { endDistanceText } = props.route.params;
  const { endDurationText } = props.route.params;
  const { pickupLocation } = props.route.params;
  const { endDropOffLocation } = props.route.params;
  const { paymentMethod } = props.route.params;
  const { delayCancellationFee } = props.route.params;
  const { destinationChangeFee } = props.route.params;
  const [discountAmount, setDiscountAmount] = React.useState(0);

  const [animating, setAnimating] = React.useState(false);
  const [feedbackModal, setFeedbackModal] = React.useState(false);
  const [ratingsText, setRatingsText] = React.useState('');
  const [ratings, setRatings] = React.useState(3);
  let socket = socketIO(SOCKET_IO_URL);

  React.useEffect(() => {
	  socket.on("riderSentFeedback", result => {
      if(tripNumber === result.tripNumber) {
        alert('Your Rider Sent to you a '+result.ratings+' star Feedback');
        ToastAndroid.show('Your Rider Sent to you a '+result.ratings+' Feedback', ToastAndroid.LONG);
      }
    });
  }, []);


  const handleCollectPayment = () => {
    Alert.alert('Cash Collect?', 'Are you really collect cash from Rider?', [
      { text: 'No', onPress: () => console.log('No Pressed'), style: 'cancel' },
      { text: 'Yes, Collected', onPress: () => handleCollectPaymentConfirm()},
    ], { cancelable: true });
  }

  const handleCollectPaymentConfirm = async () => {
    setAnimating( true );

    await axios.post(BASE_URL+'/payment-collect', {
      email: email,
      trip_number: tripNumber,
      payment_amount: fare,
      payment_method: paymentMethod
    })
    .then(async response => {
      //console.log(response.data.message);
      if(response.data.code === 200){
        setFeedbackModal(true);
        setAnimating( false );
      } 
      else if(response.data.code === 501){
        setAnimating( false );
        Alert.alert('Response Error', response.data.message, [{ text: "OK" }]);
      }
    })
    .catch((error) => {
      console.log(error.message);
      ToastAndroid.show(Options.APP_OPTIONS.NETWORK_ERROR_MESSAGE, ToastAndroid.SHORT); 
      setAnimating( false );
    });
  }
  

  const submitRate = () => {
    Alert.alert('Thanks for Trip.', 'Your Current Trip is successfully finished.', [
      { text: 'OK', onPress: () => submitRateConfirm()},
    ]);
  }

  const submitRateConfirm = async () => {
    await axios.post(BASE_URL+'/send-feedback-to-rider', {
      trip_number: tripNumber,
      trip_ratings: ratings,
      rating_text: ratingsText
    })
    .then(response => {
      if(response.data.code === 200){
        socket.emit('driverSentFeedback', {
          tripNumber: tripNumber, 
          ratings: ratings, 
          rating_text: ratingsText 
        });
        
        setFeedbackModal( false );
        props.navigation.reset({index: 0, routes: [{name: 'DriverMapScreen'}]});
      }
    })
    .catch((error) => {
      console.log("send-feedback-to-rider: "+error.message)
      ToastAndroid.show(Options.APP_OPTIONS.NETWORK_ERROR_MESSAGE, ToastAndroid.SHORT); 
    });
  }
  
  const notNow = () => {
    setFeedbackModal( false );
	  props.navigation.reset({index: 0, routes: [{name: 'DriverMapScreen'}]});
  }

  const ratingCompleted = ( rating ) => {
    console.log( `Rating is: ${rating}` );
    setRatings( rating );
  }

  const disabledBtn = () => {
    return ratings == '' && ratingsText == "" ? 0 : 1;
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
          <Text style={{color: '#000', fontSize: 18}}>Trip ID# </Text>
          <Text style={{fontWeight: 'bold', color: 'red', fontSize: 18}}>{tripNumber}</Text>
        </View>

        <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 20, justifyContent: 'center'}}>
          <Text style={{color: '#000', fontSize: 18}}>Payment Method: </Text>
          <Text style={{fontWeight: 'bold', color: 'red', fontSize: 18}}>{paymentMethod}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.itemName}>Pickup: </Text>
          <Text style={[styles.itemValue, {width: SCREEN_WIDTH-110}]} numberOfLines={1} ellipsizeMode="tail">{pickupLocation}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.itemName}>Destination: </Text>
          <Text style={[styles.itemValue, {width: SCREEN_WIDTH-150}]} numberOfLines={1} ellipsizeMode="tail">{endDropOffLocation}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.itemName}>Distance</Text>
          <Text style={styles.itemValue}>{endDistanceText}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.itemName}>Duration</Text>
          <Text style={styles.itemValue}>{endDurationText}</Text>
        </View>

        <View style={styles.row}>
          <Text style={[styles.itemName, {color: Colors.GREEN, fontWeight: 'bold'}]}>Total Fare</Text>
          <Text style={[styles.itemValue, {color: Colors.GREEN}]}>LYD{Number(fare).toFixed(2)}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.itemName}>Promocode Discount</Text>
          <Text style={styles.itemValue}>LYD{Number(discountAmount).toFixed(2)}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.itemName}>Delay Cancellation Fee</Text>
          <Text style={styles.itemValue}>LYD{Number(delayCancellationFee).toFixed(2)}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.itemName}>Destination Change Fee</Text>
          <Text style={styles.itemValue}>LYD{Number(destinationChangeFee).toFixed(2)}</Text>
        </View>
          
        <View style={styles.row}>
          <Text style={[styles.itemName, {color: Colors.GREEN, fontWeight: 'bold'}]}>Payable Amount</Text>
          <Text style={[styles.itemValue, {color: Colors.GREEN}]}>LYD{Number(fare - discountAmount + delayCancellationFee + destinationChangeFee).toFixed(2)}</Text>
        </View>

        <View style={{backgroundColor: '#eee', padding: 15, marginTop: 30, width: SCREEN_WIDTH-60, marginLeft: 20}}>
          <Text style={{fontSize: 30, textAlign: 'center', color: Colors.GREEN, fontWeight: 'bold'}}>LYD{Number(fare - discountAmount + delayCancellationFee + destinationChangeFee).toFixed(2)}</Text>
          <Text style={{fontSize: 20, textAlign: 'center', color: Colors.GREEN}}>Please Collect Cash</Text>
        </View>
      
        <TouchableOpacity onPress={handleCollectPayment} style={styles.collectButton}>
          <ActivityIndicator animating={animating} color='#fff' size="small" />
          <Text style={styles.collectButtonText}>{animating === false ? "Cash Collected" : "Submitting..."}</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal isVisible={feedbackModal} animationType='slide' backdropColor="#000" backdropOpacity={0.7} style={styles.bottomModal} onBackButtonPress={() => setFeedbackModal(false)} onBackdropPress={() => {}} deviceWidth={SCREEN_WIDTH} deviceHeight={SCREEN_HEIGHT}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ backgroundColor: '#fff', height: "auto", borderRadius: 5 }}>
            <Text style={styles.title}>Send Feedback to User</Text>

            <AirbnbRating count={5} showRating={true}
              reviews={["Poor", "Fair", "Good", "Very Good", "Excellent"]}
              starContainerStyle={{ alignSelf: "center", backgroundColor: "#fff" }} 
              defaultRating={ratings} size={30} selectedColor="#f1c40f" unSelectedColor="#BDC3C7" reviewColor="#f1c40f" reviewSize={25}
              onFinishRating={ratingCompleted}
            />
            {/* <AirbnbRating count={5} showRating={false} isDisabled={true} defaultRating={5} size={30} selectedColor="#BDC3C7" reviewSize={25} /> */}
            
            <Text style={{paddingHorizontal: 30, fontSize: 16, textAlign: 'center', marginBottom: 20}}>Rate rider from 1 to 5 Star.</Text>
          
            <Text style={{paddingHorizontal: 30, fontSize: 16}}>Write your review here</Text>
            <TextInput keyboardType="default" autoCorrect={false} style={styles.textInput} placeholderTextColor='#444' underlineColorAndroid="transparent" onChangeText={val => setRatingsText(val) } value={ratingsText} multiline={true} />

            <View style={{flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', marginBottom: 15}}>
              <TouchableOpacity onPress={notNow} style={styles.notNowButton}>
                <Text style={styles.notNowButtonText}>Not Now</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={submitRate} style={[styles.acceptButton, { opacity: (disabledBtn() == 0 ? 0.7 : 1) }]} disabled={disabledBtn() == 0 ? true : false}>
                  <Text style={styles.acceptButtonText}>Submit Review</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
   flex: 1,
   paddingVertical: 0,
   paddingHorizontal: 10,
    width: SCREEN_WIDTH,
    backgroundColor: '#fff',
    shadowColor: "#000",
    elevation: 7,
    shadowRadius: 5,
    shadowOpacity: 1.0,
    zIndex: 9999,
    paddingTop: 15
  },
  collectButton: {
    // position: 'absolute',
    // bottom: 25,
    marginTop: 15,
	  marginBottom: 40,
    alignSelf: "center",
    backgroundColor: Colors.BUTTON_COLOR,
    width: (SCREEN_WIDTH)-110,
    padding: 10,
    borderRadius: 5,

    flexDirection: 'row',
    justifyContent: 'space-evenly',
    // alignItems: 'center'
  },
  collectButtonText : {
    fontSize: 18,
    color: "#fff", 
    textAlign: 'center',
    textTransform: 'uppercase'
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomColor: '#eee',
    borderBottomWidth: 1
  },
  itemName: {
    color: '#333', 
    fontSize: 16,
    fontWeight: 'bold'
  },
  itemValue: {
    color: '#000', 
    fontSize: 16,
    textAlign: 'right'
  },

  notNowButton: {
    alignSelf: "center",
    backgroundColor: Colors.BUTTON_COLOR,
    width: (SCREEN_WIDTH/2)-40,
    padding: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginRight: 10
  },
  notNowButtonText : {
    fontSize: 16,
    color: "#fff", 
    textAlign: 'center',
    textTransform: 'uppercase'
  },
  acceptButton: {
    alignSelf: "center",
    backgroundColor: Colors.GREEN_LIGHT,
    width: (SCREEN_WIDTH/2)-40,
    padding: 10,
    borderRadius: 5
  },
  acceptButtonText : {
    fontSize: 16,
    color: "#fff", 
    textAlign: 'center',
    textTransform: 'uppercase'
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 0,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 10,
    color: Colors.PRIMARY
  },
  bottomModal: {
    justifyContent: 'center',
    margin: 15
  },

  textInput: {
    alignSelf: "stretch",
    fontSize: 16,
    height: 80,
    marginBottom: 25,
    marginLeft: 20,
    color: "#333",
    borderColor: "#ccc",
    borderWidth: 1,
    backgroundColor: '#f1f1f1',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 5,
    width: SCREEN_WIDTH - 70
  },
});
