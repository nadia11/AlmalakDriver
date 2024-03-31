import React, { Component } from 'react';
import { Text, View, ActivityIndicator, StyleSheet, Dimensions, TouchableOpacity, ImageBackground, Linking, StatusBar, ToastAndroid, Image } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, AnimatedRegion, Animated, MarkerAnimated, Callout } from 'react-native-maps';
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import NetInfo, { useNetInfo } from "@react-native-community/netinfo";
navigator.geolocation = require('@react-native-community/geolocation');
import DeviceInfo from 'react-native-device-info';
import axios from 'axios';
import * as Animatable from 'react-native-animatable';

import customMapStyle from './CustomMapStyle.json';
import { Colors } from '../styles';
import { checkAndroidPermissions, geoErr } from '../config/helperFunctions';
import { BASE_URL } from '../config/api';
import { Options } from '../config';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;
const latitudeDelta = 0.0922;
const longitudeDelta= 0.0421;
const default_region = { latitude: 23.8103, longitude: 90.4125, latitudeDelta: 0.0922, longitudeDelta: 0.0421 };

export default class AgentLocator extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      isMapReady: false,
      userCurrentLocation: {},
      region: default_region,
      agentList: []
    };
    this.locationEnabled = null;
    this.unsubscribe = null
  }

  isLocationEnabled = () => {
    DeviceInfo.isLocationEnabled().then((status) => {
      if(status === false) { 
        this.locationEnabled = false 
        console.log('Location Enabled: '+status);
      }
    });
  }

  async componentDidMount() {
    this.unsubscribe = NetInfo.addEventListener(state => { this.setState({connectionType: state.type, isConnected: state.isConnected}); });
    const { isConnected, type, isWifiEnabled } = await NetInfo.fetch();    
    const enableHighAccuracy = (type === "wifi" || undefined) ? false : true;
    this.isLocationEnabled();
    this.getUserData();

      navigator?.geolocation?.default?.getCurrentPosition(

          (position) => {
            const region = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              latitudeDelta: latitudeDelta,
              longitudeDelta: longitudeDelta
            }
            this.setState({region: region, userCurrentLocation: region, loading: false, error: null});
          },
          (error) => {
            geoErr(error);
            this.setState({error: error.message, loading: false})
          },
          {enableHighAccuracy: enableHighAccuracy, timeout: 20000, maximumAge: 1000},
      );

  }

  componentWillUnmount() {
    if (this.unsubscribe != null) this.unsubscribe();
  }

  getUserData = async () => {
    await axios.get(`${BASE_URL}/get-nearby-agents/${this.state.region.latitude}/${this.state.region.longitude}`)
    .then(response => {
      this.setState({agentList: response.data.agent_list, photo_path: response.data.photo_path });
    })
    .catch((error) => {
      console.log('get-nearby-agents: '+error.message);
      ToastAndroid.show(Options.APP_OPTIONS.NETWORK_ERROR_MESSAGE, ToastAndroid.SHORT); 
    });
  }

  handlePhoneCall = (mobile) => {
    let dialPad = '';
    if (Platform.OS === 'android') { dialPad = 'tel:${'+mobile+'}'; }
    else { dialPad = 'telprompt:${'+mobile+'}'; }
    
    Alert.alert('Phone Call?', 'Do you want to Call?', [
      { text: 'No', onPress: () => console.log('No Pressed'), style: 'cancel' },
      { text: 'Yes, Call', onPress: () => Linking.openURL(dialPad)},
    ], { cancelable: true });
  }

  onMapReady = () => {
    this.setState({ isMapReady: true, marginTop: 0 });
  }

  centerMap() {
    const { latitude, longitude, latitudeDelta, longitudeDelta } = this.state.userCurrentLocation;
    this.map.animateToRegion({ latitude, longitude, latitudeDelta, longitudeDelta });
  }

  render() {
    if(this.locationEnabled === false){
      return (
        <ImageBackground source={require('../assets/map-bg.jpg')} style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center', resizeMode: 'contain', height: SCREEN_HEIGHT, width: SCREEN_WIDTH, paddingTop: 0 }}>
          <View style={{flex:1, backgroundColor: 'dodgerblue', paddingVertical: 10, paddingHorizontal: 30, position: 'absolute', left: 10, top: "20%", width: SCREEN_WIDTH-20, borderRadius: 5}}>
            <Text style={{color: '#fff', fontSize: 20, lineHeight: 30, textAlign: 'center'}}>To find your pick-up location automatically, turn on location services.</Text>

            <TouchableOpacity onPress={() => Linking.openSettings()} style={{ alignSelf: 'center', backgroundColor: "#333", padding: 15, width: 200, borderRadius: 5, marginTop: 20, marginBottom: 5}}>
              <Text style={{color: "#fff", textAlign: 'center'}}>Enable Location</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      )
    }

    // if (this.state.loading) {
    //   return (
    //     <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    //       <ActivityIndicator size="large" color={Colors.BUTTON_COLOR} />
    //     </View>
    //   );
    // }

    return (
      <View style={styles.container}>
        <StatusBar animated={true} backgroundColor="transparent" barStyle="dark-content" showHideTransition="fade" translucent={true} />

        {this.state.region.latitude !== 0 && (
        <View style={styles.currentLocationButton}>
          <MaterialIcons name="my-location" color="#000" size={25} onPress={() => this.centerMap() } />
        </View>
        )}

        {!!this.state.region.latitude && !!this.state.region.longitude && (
          <MapView style={styles.map} 
            provider={this.props.provider} customMapStyle={customMapStyle} 
            initialRegion={this.state.region} showsUserLocation={true} showsMyLocationButton={true}
            loadingEnabled={true} loadingIndicatorColor="#666666" loadingBackgroundColor="#eeeeee"
            zoomEnabled={true} zoomControlEnabled={true}
            onMapReady={this.onMapReady} ref={map => {this.map = map}}>
            
            <Marker.Animated coordinate={{ latitude: this.state.region.latitude, longitude: this.state.region.longitude }} ref={marker => { this.marker = marker }} anchor={{x: 0.50, y: 0.50}} style={{width: 35, height: 35}} onSelect={e => console.log('onSelect', e)} onDrag={e => console.log('onDrag', e)} onDragStart={e => console.log('onDragStart', e)} onDragEnd={e => alert('onDragEnd')} onPress={e => console.log('onPress', e)} draggable title="Current Location" image={require("../assets/images/marker.png")} />
            
            {this.state.agentList.map((marker, index) => 
              <MarkerAnimated 
                key={index} ref={marker => {this.marketRef = marker}} flat={true}
                coordinate={{latitude: marker.latitude, longitude: marker.longitude}} anchor={{x: 0.35, y: 0.32}} 
                title={marker.agent_name} description={marker.mobile}>
                <Image style={{ width: 30, height: 30 }} resizeMode="contain" source={require('../assets/images/marker-agents.png')} />
                
              <Callout style={styles.plainView}>
                <View style={styles.imageWrap}>
                  <Text>
                    {marker.agent_photo !== "" && <Image style={styles.image} source={{uri: this.state.photo_path +"/"+ marker.agent_photo, crop: {left: 0, top: 0, width: 60, height: 60}}} /> }
                    {marker.agent_photo == "" && <Image style={styles.image} source={require('../assets/avatar.png')} /> }
                  </Text>
                </View>

                  <View>
                    <Text style={{fontWeight: 'bold', fontSize: 14, color: '#000'}}>{marker.agent_name}</Text>
                    <Text style={{fontSize: 14, color: '#333'}}>{marker.branch_address} dsf ds fds fdsf dfs dfs fds fds fds fds dfs dfs dfs dfs df</Text>
                    <Text style={{fontSize: 14, color: '#333'}} onPress={() => this.handlePhoneCall(marker.mobile)}>{marker.mobile}</Text>
                  </View>
              </Callout>
              </MarkerAnimated>
            )}
          </MapView>
        )}
      </View>
    );
  }
}


const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff',
  },
  map: {
    ...StyleSheet.absoluteFillObject
  },
  currentLocationButton:{
    // position: 'absolte',
    left: (SCREEN_WIDTH - 60),
    top: SCREEN_HEIGHT-90,
    zIndex: 999,
    width: 40,
    height: 40,
    backgroundColor: 'white',
    borderRadius: 50,
    shadowColor: "#000000",
    elevation: 7,
    shadowRadius: 5,
    shadowOpacity: 1.0,
    alignItems: 'center',
    justifyContent: 'center'
  },
  plainView: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    // position: 'absolute',
    // left: 0,
    // top: SCREEN_HEIGHT-90,
    // zIndex: 999,
    minWidth: 200,
    // height: 50,
    backgroundColor: 'white',
    paddingRight: 10,
    borderRadius: 10,
    shadowColor: "#000000",
    elevation: 7,
    shadowRadius: 5,
    shadowOpacity: 1.0,
  },
  imageWrap: {
    height: 60,
    width: 60,
    // backgroundColor:"#ccc",
    borderRadius: 50,
    marginRight: 15
  },
  image: {
    height: 60,
    width: 60,
    // resizeMode: 'cover',
    borderRadius: 50,
  },
});