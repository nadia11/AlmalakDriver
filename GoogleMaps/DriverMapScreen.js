import React, {Component} from 'react';
import { StyleSheet, View, Text, Dimensions, ActivityIndicator, Image, Linking, Platform, Alert, PermissionsAndroid, ToastAndroid, ImageBackground, TouchableOpacity } from 'react-native';
import NetInfo, { useNetInfo } from "@react-native-community/netinfo";

import MapView, { PROVIDER_GOOGLE, Marker, Polyline, AnimatedRegion, Animated, MarkerAnimated } from 'react-native-maps';
//navigator.geolocation = require('@react-native-community/geolocation');
import Geolocation from '@react-native-community/geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";
import DeviceInfo from 'react-native-device-info';
import PolyLine from '@mapbox/polyline';
import{ io } from 'socket.io-client';
import * as Animatable from 'react-native-animatable';
// import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';
import Ionicons from 'react-native-vector-icons/Ionicons';
import RNAndroidLocationEnabler from 'react-native-android-location-enabler';

import { Colors } from '../styles';
import { Options } from '../config';
import CustomStatusBar from '../components/CustomStatusBar';
import { GOOGLE_API_KEY, SOCKET_IO_URL, BASE_URL, SMS_API_URL } from '../config/api';
import CustomMapStyle from './CustomMapStyleDriver.json';
import { getPixelSize, checkAndroidPermissions, getLatLonDiffInMeters, geoErr } from '../config/helperFunctions';

import TodaysSummery from './TodaysSummery';
import BatteryLowMessage from '../components/BatteryLowMessage';
import AcceptRideRequestPanel from './AcceptRideRequestPanel';
import TripControlScreen from './TripControlScreen';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

// const default_region = { latitude: 23.8103, longitude: 90.4125, latitudeDelta: 0.015, longitudeDelta: 0.0121 };
const default_region = { latitude: 23.8103, longitude: 90.4125, latitudeDelta: 0.0922, longitudeDelta: 0.0421 };

const ASPECT_RATIO = SCREEN_WIDTH / SCREEN_HEIGHT;
// const LATITUDE_DELTA = 0.9271;
const LATITUDE_DELTA = 0.0921;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;



export default class DriverMapScreen extends Component {
  constructor(props){
    super(props)
    this.state = {
      animating: false,
      mobile: "",
      email: "",

      latitude: default_region.latitude,
      longitude: default_region.longitude,
      latitudeDelta: default_region.latitudeDelta,
      longitudeDelta: default_region.longitudeDelta,
      destination: "",
      destinationPlaceId: "",
      predictions: [],
      pointCoords: [],
      startLatitude: 0,
      startLongitude: 0,

      tripNumber: '',
      riderName: '',
      riderMobile: '',
      driverStatus: false, 
      tripStatus: false,

      summeryStatus: true,
      lookingForPassengers: false,
      passengerFound: false,
      driverArrive: false,
      startTrip: false,
      completeTrip: false,
      markerHeading: 0,
      titleText: "On the way to Rider."
    }
    this.acceptPassengerRequest = this.acceptPassengerRequest.bind(this);
    this.findPassengers = this.findPassengers.bind(this);
    this.locationEnabled = null;
    this.socket = null;
    this.unsubscribe = null
  }

  isLocationEnabled = () => {
    DeviceInfo.isLocationEnabled().then((status) => {
      console.log('Location Enabled: '+status);
      if(status === false) { this.locationEnabled = false }
    });
  }

  async componentDidMount() {
    this.unsubscribe = NetInfo.addEventListener(state => { this.setState({connectionType: state.type, isConnected: state.isConnected}); });
    const { isConnected, type, isWifiEnabled } = await NetInfo.fetch();    
    const enableHighAccuracy = (type === "wifi" || undefined) ? false : true;
    // this.isLocationEnabled();
    this.getUserData();

    let granted = false;
    if (Platform.OS === "ios") { granted = true; }
    else { granted = await checkAndroidPermissions(); }

    if (granted){
      Geolocation.getCurrentPosition(
        position => {
          this.setState({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            markerHeading: position.coords.heading
          });
          // this.map.animateToRegion({ latitude: position.coords.latitude, longitude: position.coords.longitude, latitudeDelta: 0.0921, longitudeDelta: 0.0421 }, 10000);
        },
        error => geoErr(error),
        { enableHighAccuracy: enableHighAccuracy, timeout: 20000, maximumAge: 1000 }
      );

	    //enableHighAccuracy: true, get more accurate location
      this.watchId = Geolocation.watchPosition(
        position => {
          this.setState({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            markerHeading: position.coords.heading,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            altitudeAccuracy: position.coords.altitudeAccuracy,
            speed: position.coords.speed
          });
          
          if(this.state.driverStatus) {
            axios.post(`${BASE_URL}/update-all-driver-route`, {
              email: this.state.email,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              marker_heading: position.coords.heading
            })
            .then((response) => {
              if(response.data.code === 200){ 
                console.log('update-all-driver-route: ' + response.data.code); 
              }
            });
          }
          
          //add code for sending driver's current location to the rider
          if(this.state.driverStatus && this.state.tripNumber) {
            this.socket.emit('updateDriverCurrentLocation', {
              tripNumber: this.state.tripNumber, 
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              markerHeading: position.coords.heading
            });

            if(this.state.pointCoords[0]) {
              let diff_in_meters = getLatLonDiffInMeters(this.state.latitude, this.state.longitude, this.state.pointCoords[0].latitude, this.state.pointCoords[0].longitude);
              console.log('this.state.pointCoords', this.state.pointCoords[0].latitude, diff_in_meters);
  
              if(diff_in_meters <= 200) {
                Alert.alert('Rider is in 200 meter', 'Rider is around 200 meters from your current location');
              } else if(diff_in_meters <= 50) {
                Alert.alert('Rider is almost near', 'Rider is around 50 meters from your current location');
              }
            }
          }
        },
        error => geoErr(error),
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 2000, distanceFilter: 10 }
      );
    }

    /*
    BackgroundGeolocation.configure({
      desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
      stationaryRadius: 50,
      distanceFilter: 50,
      // notificationTitle: 'Background tracking',
      // notificationText: 'enabled',
      debug: false,
      startOnBoot: false,
      stopOnTerminate: true,
      locationProvider: BackgroundGeolocation.ACTIVITY_PROVIDER,
      interval: 10000,
      fastestInterval: 5000,
      activitiesInterval: 10000,
      stopOnStillActivity: false
    });

    BackgroundGeolocation.on('authorization', (status) => {
      console.log('[INFO] BackgroundGeolocation authorization status: ' + status);
      if (status !== BackgroundGeolocation.AUTHORIZED) {
        // we need to set delay or otherwise alert may not be shown
        setTimeout(() =>
          Alert.alert('App requires location tracking permission', 'Would you like to open app settings?', [
            { text: 'Yes', onPress: () => BackgroundGeolocation.showAppSettings() },
            { text: 'No', onPress: () => console.log('No Pressed'), style: 'cancel' }
          ]), 1000);
      }
    });
    */
  }

  componentWillUnmount() {
    if (this.watchId) { Geolocation.clearWatch(this.watchId); }
    if (this.unsubscribe != null) this.unsubscribe();
  }

  // static getDerivedStateFromProps(nextProps, prevState) {
  //   const duration = 500
  //   console.log("nextProps.coordinate", nextProps.driverCoordinate);

  //   if (prevState.driverCoordinate !== nextProps.driverCoordinate) {
  //     if (Platform.OS === 'android') {
  //       if (this.marker) {
  //         this.marker.animateMarkerToCoordinate( nextProps.driverCoordinate, duration );
  //       }
  //     } else {
  //       this.state.driverCoordinate.timing({ ...nextProps.driverCoordinate, duration }).start();
  //     }
  //   }
  // }

  getUserData = async () => {
    try {
      const mobile = await AsyncStorage.getItem('mobile');
      const email = await AsyncStorage.getItem('email');
      
      if(mobile !== null) { this.setState({mobile: mobile}) }
      if(email !== null) { this.setState({email: email}) }
    } catch (error) { console.error(error); }
  }

  handleLocationEnable = () => {
    if (Platform.OS === 'android') {
      RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({interval: 10000, fastInterval: 5000})
      .then(data => {
        this.props.navigation.replace( 'DriverMapScreen', null, null );
      })
      .catch(err =>  Alert.alert("Error " + err.message + ", Code : " + err.code));
    }
  }

  async getRouteDirections(destinationPlaceId) {
    try {
      const response = await fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=${this.state.latitude},${this.state.longitude}&destination=place_id:${destinationPlaceId}&key=${GOOGLE_API_KEY}`);
      const json = await response.json();

      const points = PolyLine.decode(json.routes[0].overview_polyline.points);
      const pointCoords = points.map(point => {
        return { latitude: point[0], longitude: point[1] }
      });

      this.setState({ pointCoords, routeResponse: json });
      this.map?.fitToCoordinates(pointCoords, { edgePadding: {top: 20, bottom: 20, left: 20, right: 20}, animated: true });
    } 
    catch (error) { console.error(error) }
  }


  async activeDriverStatus() {
    // this.setState({ animating: true, driverStatus: true });
    this.findPassengers();

    await axios.post(`${BASE_URL}/change-driver-status`, {
      driver_status: 'online',
      email: this.state.email,
      latitude: this.state.latitude,
      longitude: this.state.longitude,
      marker_heading: this.state.markerHeading
    })
    .then(async response => {
      if(response.data.code === 200){
          try {
            await AsyncStorage.setItem('driverStatus', 'online');
            this.setState({ animating: false });
          } 
          catch (error) { console.error(error); }
        }
    })
    .catch((error) => {
      this.setState({ animating: false });
      console.log("change-driver-status: ", error.message);
      ToastAndroid.showWithGravity(Options.APP_OPTIONS.NETWORK_ERROR_MESSAGE, ToastAndroid.LONG, ToastAndroid.CENTER);
    });
  }

  async deactiveDriverStatus() {
    this.setState({ driverStatus: false, animating: true });
    
    await axios.post(`${BASE_URL}/change-driver-status`, {
      driver_status: 'offline',
      email: this.state.email,
      latitude: this.state.latitude,
      longitude: this.state.longitude,
      marker_heading: this.state.markerHeading
    })
    .then(async response => {
      if(response.data.code === 200){
        try {
          await AsyncStorage.setItem('driverStatus', 'offline');
          this.setState({ animating: false });
        } 
        catch (error) { console.error(error); }
      }
    })
    .catch((error) => {
      this.setState({ animating: false });
      console.log("change-driver-status: ", error.message);
      ToastAndroid.showWithGravity(Options.APP_OPTIONS.NETWORK_ERROR_MESSAGE, ToastAndroid.LONG, ToastAndroid.CENTER);
    });
  }

  findPassengers() {
    this.socket = io("https://71a6-27-147-170-201.ngrok-free.app");
    //console.log('findPassengers: true');
    
    if (!this.state.lookingForPassengers && (this.state.tripStatus === false)) {
      this.setState({ lookingForPassengers: true });
      
      this.socket.on("connect", () => {
        this.socket.emit("passengerRequest");
       // console.log("Looking Passenger: "+this.state.lookingForPassengers);
      }); //Socket Connection

      this.socket.on("taxiRequest", request => {
        console.log(request.routeResponse);
        
        this.setState({
          lookingForPassengers: false, 
          tripNumber: request.tripNumber,
          passengerFound: true,
          routeResponse: request.routeResponse,
          //destinationPlaceId: request.routeResponse.geocoded_waypoints[0].place_id,
          destinationPlaceId: request.destinationPlaceId
        });
        this.getRouteDirections(request?.routeResponse?.geocoded_waypoints[0]?.place_id);
      });

      this.socket.on("cancelTripByRider", (number) => {
        if(number.tripNumber === this.state.tripNumber) {
			    alert("Rider has Cancelled this Trip.");
          this.props.navigation.reset({index: 0, routes: [{name: 'DriverMapScreen'}]});
        }
      });
      
      this.socket.on('resetDriverUI', (result) => {
        if((result.driverMobile !== this.state.mobile) && (this.state.driverStatus !== true) && (result.tripNumber !== this.state.tripNumber)) {
          this.props.navigation.reset({index: 0, routes: [{name: 'DriverMapScreen'}]});
        }
      });
    }
  }

  async acceptPassengerRequest() {
    this.setState({
      summeryStatus: false,
      passengerFound: false,
      driverArrive: true,
      animating: true
    });

    //BackgroundGeolocation.on('location', location => {
    //send driver location to passenger
    // this.socket.emit("driverGeoLocation", {
      // latitude: location.latitude, 
      // longitude: location.longitude
    // });

    
    //BackgroundGeolocation.startTask(taskKey => { BackgroundGeolocation.endTask(taskKey); });
	  //triggers start on start event
    // BackgroundGeolocation.checkStatus(status => {
      // if (!status.isRunning) { BackgroundGeolocation.start(); }
    // });

    await axios.post(BASE_URL+'/assign-driver-to-rider-trip', {
      email: this.state.email,
      trip_number: this.state.tripNumber,
      latitude: this.state.latitude, 
      longitude: this.state.longitude,
      marker_heading: this.state.markerHeading
    })
    .then(async response => {
      if(response.data.code === 200){
        this.setState({
          riderName: response.data.rider_name,
          riderMobile: response.data.rider_mobile,
          //riderGender: response.data.rider_gender,
          riderPhoto: response.data.rider_photo,
          riderRatings: response.data.rider_ratings,
          distance: response.data.distance,
          duration: response.data.duration,
          totalFare: response.data.total_fare,
          pickupLocation: response.data.pickup_location,
          dropOffLocation: response.data.drop_off_location,
          startLatitude: response.data.origin_lat,
          startLongitude: response.data.origin_long,
          tripStatus: 'active'
        });
        
        this.socket.emit("driverLocation", {
          latitude: this.state.latitude, 
          longitude: this.state.longitude,
          markerHeading: this.state.markerHeading
        });

        this.socket.emit("assignedDriverMobile", {
          driverMobile: this.state.mobile
        });

        this.socket.emit("resetDriverUI", {
          driverMobile: this.state.mobile,
          tripNumber: this.state.tripNumber
        });

        this.setState({
          passengerFound: false,
          driverArrive: true,
          animating: false
        });
      }
    })
    .catch((error) => {
      console.log("assign-driver error: "+error.message);
      ToastAndroid.show(Options.APP_OPTIONS.NETWORK_ERROR_MESSAGE, ToastAndroid.SHORT); 
      this.setState({ animating: false });
    });
  }

  handleCancel() {
    this.setState({ destination: "", driverStatus: false });
	  this.socket.emit("cancelTripByDriver", {tripNumber: this.state.tripNumber});
    this.map.animateToRegion({ latitude: this.state.latitude, longitude: this.state.longitude, latitudeDelta: this.state.latitudeDelta, longitudeDelta: this.state.longitudeDelta }, 700);
    this.props.navigation.reset({index: 0, routes: [{name: 'DriverMapScreen'}]});
  }

  showsTraffic() {
    let showsTraffic = !this.state.showsTraffic ? true : false;
    this.setState({ showsTraffic: showsTraffic });
  }

  driverArriveHandle() {
    this.socket.emit("arriveDriver", {driverArrive: true});

    this.setState({
      driverArrive: false, 
      startTrip: true,
      titleText: "Arrived to Rider Location."
    });
  }

  async startTrip() {
    this.socket.emit("startTrip", {
      latitude: this.state.latitude, 
      longitude: this.state.longitude
    });

    this.setState({
      driverArrive: false,
      startTrip: false,
      completeTrip: true,
      titleText: "Trip is running (" +(this.state.tripNumber)+ ")"
    });

    //Redraw ride route from rider place to destination
    //this.getRouteDirections(this.state.destinationPlaceId);
  }

  navigationHandle() {
    const passengerLocation = this.state.pointCoords[this.state.pointCoords.length - 1];
    const sourceapp = '&x-source=SourceApp&x-success=sourceapp://?resume=true';
    const label = this.state.dropOffLocation;

    const url = Platform.select({
      ios: `http://maps.apple.com/?daddr=${passengerLocation.latitude},${passengerLocation.longitude}&directionsmode=driving&center=${passengerLocation.latitude},${passengerLocation.longitude}&q=${this.state.dropOffLocation}${sourceapp}`,
      android: `geo:0,0?q=${passengerLocation.latitude},${passengerLocation.longitude}(${label})&directionsmode=driving&center=${passengerLocation.latitude},${passengerLocation.longitude}${sourceapp}`
    });

    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        return Linking.openURL(url);
      } else {
        return Linking.openURL("https://www.google.de/maps/@"+ passengerLocation.latitude +","+ passengerLocation.longitude + sourceapp);
      }
    });
  }


  async completeTrip() {
    this.socket.emit("completeTrip", {
      latitude: this.state.latitude, 
      longitude: this.state.longitude
    });

    this.setState({
      driverArrive: false,
      startTrip: false,
      completeTrip: false
    });
  }


  render() {
    let startMarker = null;
    let endMarker = null;
    //if (!this.state.latitude) return null; /**Remove blue screen on load map**/

    if (this.state.pointCoords.length > 1) {
      endMarker = (
        <Marker.Animated coordinate={this.state.pointCoords[this.state.pointCoords.length - 1]} >
          <Image style={{ width: 30, height: 30 }} resizeMode="contain" source={require("../assets/images/person-marker.png")} />
        </Marker.Animated>
      );
    }

    if (this.state.latitude && this.state.driverStatus) {
      startMarker = (
        <View>
          <MarkerAnimated coordinate={{ latitude: this.state.latitude, longitude: this.state.longitude }} ref={marker => { this.marker = marker }} anchor={{x: 0.50, y: 0.50}} style={{width: 35, height: 35}}>
            <Image style={{ width: 35, height: 35, transform: [{ rotate: `${this.state.markerHeading}deg` }] }} resizeMode="contain" source={require("../assets/images/bike.png")} />
          </MarkerAnimated>

          <MapView.Circle key={(this.state.latitude + this.state.longitude).toString() }
            center={{latitude: this.state.latitude, longitude: this.state.longitude}}
            radius={1000} zIndex={0} strokeWidth={1} strokeColor='#1a66ff' fillColor='rgba(230,238,255,0.5)'
            onRegionChangeComplete={{ latitude: this.state.latitude, longitude: this.state.longitude, latitudeDelta: this.state.latitudeDelta, longitudeDelta: this.state.longitudeDelta }}
          />
        </View>
      );
    }

	if(this.locationEnabled === false) {
      return (
        <ImageBackground source={require('../assets/map-bg.jpg')} style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center', resizeMode: 'contain', height: SCREEN_HEIGHT, width: SCREEN_WIDTH, paddingTop: 0 }}>
          <View style={{flex:1, backgroundColor: 'dodgerblue', paddingVertical: 10, paddingHorizontal: 30, position: 'absolute', left: 10, top: "15%", width: SCREEN_WIDTH-20, borderRadius: 5}}>
            <Ionicons name="swap-vertical" size={100} color="red" style={{textAlign: 'center'}} />
            <Text style={{color: '#fff', fontSize: 18, lineHeight: 30, textAlign: 'center'}}>To find your pick-up location automatically, turn on location services (Mobile Data).</Text>

            <TouchableOpacity onPress={this.handleLocationEnable} style={{ alignSelf: 'center', fontSize: 16, backgroundColor: "#333", padding: 15, width: 200, borderRadius: 5, marginTop: 20, marginBottom: 5}}>
              <Text style={{color: "#fff", textAlign: 'center'}}>Enable Location</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      )
    }
	
    return(
      <View style={styles.container}>
        <CustomStatusBar />
        <BatteryLowMessage {...this.props} />

        {this.state.latitude !== 0 && (
        <MapView style={styles.mapStyle} provider={PROVIDER_GOOGLE} customMapStyle={CustomMapStyle}
            region={{ latitude: this.state.latitude, longitude: this.state.longitude, latitudeDelta: this.state.latitudeDelta, longitudeDelta: this.state.longitudeDelta }}
            showsUserLocation={false} followsUserLocation={true} showsMyLocationButton={false} 
            loadingEnabled={true} loadingIndicatorColor="#666666" loadingBackgroundColor="#eeeeee"
            zoomEnabled={true} zoomControlEnabled={true} showsTraffic={this.state.showsTraffic}
            showsCompass={true} rotateEnabled={false}   ref={ref => { this.map = ref; }}
            >
            <Polyline coordinates={this.state.pointCoords} strokeWidth={3} strokeColor="red" />
            {endMarker}
            {startMarker}
        </MapView>
        )}
        
        {this.state.summeryStatus === true && (
          <TodaysSummery 
          {...this.props} 
          activeDriverStatus={() => this.activeDriverStatus()} 
          deactiveDriverStatus={() => this.deactiveDriverStatus()} 
          driverMobile={this.state.mobile} 
          />
        )}
        
        {this.state.driverStatus === true && this.state.passengerFound === true && (
          <AcceptRideRequestPanel 
          {...this.props} 
          handleCancel={() => this.handleCancel()} 
          acceptRequest={() => this.acceptPassengerRequest()} 
          // riderName={this.state.riderName}
          // riderRatings={this.state.riderRatings}
          // pickupLocation={this.state.pickupLocation}
          // dropOffLocation={this.state.dropOffLocation}
          // distance={this.state.distance}
          // total_fare={this.state.total_fare}
          driverEmail={this.state.email}
          driverMobile={this.state.mobile}
          tripNumber={this.state.tripNumber}
          latitude={this.state.latitude}
          longitude={this.state.longitude}
          markerHeading={this.state.markerHeading}
          />
        )}
         
        {((this.state.driverArrive === true) || (this.state.startTrip === true) || (this.state.completeTrip === true)) && (
          <TripControlScreen 
          {...this.props} 
          driverArriveHandle={() => this.driverArriveHandle()}  
          driverArriveStatus={this.state.driverArrive}  
          startTripStatus={this.state.startTrip}  
          startTripHandle={() => this.startTrip()}  
          completeTripStatus={this.state.completeTrip}  
          completeTripHandle={() => this.completeTrip()}  
          navigationHandle={() => this.navigationHandle()}  
          handleCancel={() => this.handleCancel()} 
          showsTraffic={() => this.showsTraffic()} 
          
          email={this.state.email}
          driverMobile={this.state.mobile}
          tripNumber={this.state.tripNumber}
          pickupLocation={this.state.pickupLocation}
          dropOffLocation={this.state.dropOffLocation}
          distance={this.state.distance}
          duration={this.state.duration}
          initialFare={this.state.totalFare}
          riderName={this.state.riderName}
          riderMobile={this.state.riderMobile}
          riderPhoto={this.state.riderPhoto}
          latitude={this.state.latitude}
          longitude={this.state.longitude}
          markerHeading={this.state.markerHeading}
          startLatitude={this.state.startLatitude}
          startLongitude={this.state.startLongitude}
          titleText={this.state.titleText}

          LatLongAndDelta={default_region} 
          mapRef={this.map}
          />
        )}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#F5FCFF"
  },
  mapStyle: {
    ...StyleSheet.absoluteFillObject,
    // marginTop: 50,
    // marginBottom: 150,
  },
  spinnerView: {
    backgroundColor: 'white',
    width: 100,
    height: 100,
    paddingTop: 30,
    position: 'absolute',
    top: (SCREEN_HEIGHT / 2 ) - 50,
    left: (SCREEN_WIDTH / 2) - 10,
    zIndex: 99999,
    borderRadius: 5
  },
  destinationInput: {
    position: 'absolute',
    top: 50,
    left: 15,
    width: (SCREEN_WIDTH - 30),
    height: 40,
    borderWidth: 1,
    borderColor: 'red',
    padding: 5,
    backgroundColor: "white"
  },
  suggestions: {
    backgroundColor: 'white',
    padding: 5,
    fontSize: 18,
    borderWidth: 0.5,
    marginLeft: 5,
    marginRight: 5,
    width: (SCREEN_WIDTH - 30)
  },
  findDriver: {
    backgroundColor: "black",
    marginTop: "auto",
    margin: 20,
    padding: 15,
    paddingLeft: 30,
    paddingRight: 30,
    alignSelf: "center"
  },
  findDriverText: {
    fontSize: 20,
    color: "white",
    fontWeight: "600"
  }
 });