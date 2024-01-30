import React from "react";
import { Dimensions, ImageBackground, StyleSheet, Text, View } from "react-native";

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;
 
export default function DriverStatusScreen(props) {
  return (
    <View style={styles.container}>
        <ImageBackground source={require('../assets/welcome-bg.jpeg')} style={{ flex: 3, justifyContent: 'center', alignItems: 'flex-start', resizeMode: 'contain', height: SCREEN_HEIGHT-400, width: SCREEN_WIDTH, marginBottom: 120, paddingTop: 50 }}>
          {/* <Animatable.View animation="zoomIn" iterationCount={1} stUderyle={{ height: 140, width: 140, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 5, marginTop: 30 }}>
            <Image style={{ height: 130, width: 130, resizeMode: 'contain' }} source={require('../assets/logo.png')} />
          </Animatable.View> */}
       

        {/* <Animatable.View animation="zoomIn" iterationCount={1} style={{ height: 140, width: 140, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 5, marginTop: 300 }}>
          <Image style={{ height: 130, width: 130, resizeMode: 'contain' }} source={require('../assets/logo.png')} />
        </Animatable.View> */}

        <View style={{marginBottom: 30, marginTop: 300}}>
          <Text style={{textAlign: 'center', fontSize: 20, color: '#333'}}>Hi, {props.route.params ? props.route.params.userName : ""}</Text>
          <Text style={styles.welcome}>Welcome to Uder Driver App</Text>
          <Text style={{textAlign: 'center', fontSize: 16, paddingHorizontal: 25, lineHeight: 25}}>Your profile is pending for approval. Please wait until is approved. When approved we will confirm you through SMS.</Text>
        </View>
        </ImageBackground>
    </View>
  );
}
 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center'
  },
  welcome: {
    textAlign: 'center', fontSize: 28, fontWeight: 'bold',
    color: '#DC2322',
    lineHeight: 30,
    marginBottom: 10
  }
});