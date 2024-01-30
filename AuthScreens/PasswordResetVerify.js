import React, { Component } from 'react';
import { Text, View, StyleSheet, TextInput, TouchableOpacity, ToastAndroid, Platform, Dimensions, ActivityIndicator, Alert } from 'react-native';

import * as Animatable from 'react-native-animatable';
import axios from "axios";
import { BASE_URL, SMS_API_URL } from '../config/api';
import CustomStatusBar from '../components/CustomStatusBar';
import { Colors } from '../styles';
import { Options } from '../config';


const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;


export default function PasswordResetVerify(props) {
  const [animating, setAnimating] = React.useState(false);
  const [code, setCode] = React.useState('');
  const [email, setEmail] = React.useState(props.route.params.email);

  const checkResetCode = async () => {
    setAnimating( true );

    await fetch(BASE_URL+'/verify-password-reset-code', {
      method: 'POST', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, reset_code: code })
    })
    .then((response) => response.json())
    .then(async (responseJson) => {
      console.log(responseJson);
      if(responseJson.code === 200){
        props.navigation.navigate('PasswordResetForm', {email: email});
        setAnimating(false);
      }
      else if(responseJson.code === 501){
        Alert.alert('Error', responseJson.message, [{ text: "OK" }]);
        setAnimating(false);
      }
    })
    .catch((error) => {
      console.log("Submitting Error: "+error); 
      ToastAndroid.show(Options.APP_OPTIONS.NETWORK_ERROR_MESSAGE, ToastAndroid.SHORT); 
    });
  }
  

  const disabledBtn = () => {
    return code.length == 10 ? 0 : 1;
  }

  return (
    <View style={styles.container}>
      <CustomStatusBar />

        <Animatable.View animation="slideInUp" iterationCount={1} style={{height: 330 }}>
          <Text style={styles.title}>Verify Reset Code?</Text>

          <View style={{backgroundColor: '#fff', marginHorizontal: 10, borderRadius: 5 }}>
            <Text style={{ marginBottom: 10, fontSize: 16, padding: 15, textAlign: 'justify', color: '#333'}}>Enter the code that you received through email. If not get the code Please resend again.</Text>

            <View style={{ marginTop: 10 }}>
              <Text style={styles.textLabel}>Reset Code</Text>
              <TextInput keyboardType="default" style={styles.textInput} placeholderTextColor='#444' underlineColorAndroid="transparent" maxLength={10} onChangeText={val => setCode(val) } value={code}></TextInput>
            </View>

            <TouchableOpacity style={[styles.button, { opacity: (disabledBtn() == 1 ? 0.7 : 1) }]} onPress={ checkResetCode } disabled={disabledBtn() == 1 ? true : false}>
              <Text style={styles.btnText}>{animating === false ? "Verify & Continue" : "Checking..."}</Text>
              <ActivityIndicator animating={animating} color='#fff' size="large" style={{ position: "absolute", right: 70, top: 4}} />
            </TouchableOpacity>
          </View>

        <TouchableOpacity style={{ height: 50, alignItems: 'center', justifyContent: 'center' }} onPress={() => props.navigation.navigate('LoginByEmail') }>
          <Text style={{color: Colors.PRIMARY, fontSize: 18, fontWeight: 'bold'}}>Login</Text>
        </TouchableOpacity>
      </Animatable.View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e9e9e9',
    paddingTop: ( Platform.OS === 'ios' ) ? 20 : 0,
    justifyContent: 'center'
  },
  title: {
    fontSize: 24,
    textTransform: 'uppercase',
    color: Colors.PRIMARY,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 10,
    marginBottom: 10
  },
  textInput: {
    fontSize: 15,
    color: "#333",
    backgroundColor: '#F2FBF8',
    paddingHorizontal: 15,
    paddingVertical: 5,
    height: 40,
    width: SCREEN_WIDTH - 60,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 3,
    alignSelf: "center",
  },
  textLabel: {
    fontSize: 16,
    color: '#333',
    marginLeft: 20
  },
  button: {
    alignSelf: "center",
    padding: 12,
    backgroundColor: Colors.BUTTON_COLOR,
    marginTop: 20,
    marginBottom: 15,
    width: SCREEN_WIDTH - 60,
    borderRadius: 3
  },
  btnText: {
    color: "#fff", 
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 18
  }
});