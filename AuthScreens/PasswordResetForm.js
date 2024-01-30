import React, { Component } from 'react';
import { Text, View, StyleSheet, TextInput, TouchableOpacity, ToastAndroid, Platform, Dimensions, ActivityIndicator, Alert } from 'react-native';

import * as Animatable from 'react-native-animatable';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from "axios";
import { BASE_URL, SMS_API_URL } from '../config/api';
import CustomStatusBar from '../components/CustomStatusBar';
import { Colors } from '../styles';
import Feather from 'react-native-vector-icons/Feather';
import { Options } from '../config';


const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;


export default function PasswordResetForm(props) {
  const [email, setEmail] = React.useState(props.route.params.email);
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [animating, setAnimating] = React.useState(false);
  const [showPass, setShowPass] = React.useState(true);
  const [press, setPress] = React.useState(false);

  let confirmPasswordRef = React.createRef();

  const handleShowPassword = () => { 
    if(press == false){ setShowPass(false);  setPress(true); }
    else { setShowPass(true);  setPress(false); }
  }

  const handleResetForm = async () => {
    setAnimating(true);
    
    if(password !== confirmPassword){
      Alert.alert('Error', 'Password Dont Match.', [{ text: "OK" }]);
      setAnimating(false);
    }
    else if(password.length < 8) {
      alert('Password Must be Uppercase, Lowercase, Number & minimum 8 charecters.');
      setAnimating(false);
    }
	  else {
      await fetch(BASE_URL+'/password-reset-form-submit', {
        method: 'POST', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: password })
      })
      .then((response) => response.json())
      .then(async (responseJson) => {
        if(responseJson.code === 200){
          props.navigation.navigate('LoginByEmail');
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
  }

  const disabledBtn = () => {
    return password === "" && confirmPassword === "" ? 1 : 0;
  }

    return (
      <View style={styles.container}>
        <CustomStatusBar />

        <Animatable.View animation="slideInUp" iterationCount={1} style={{height: 330 }}>
          <View style={{ alignItems: 'center', paddingHorizontal: 10, marginBottom: 15, fontWeight: 'bold' }}>
            <Text style={{ fontSize: 24, textTransform: 'uppercase', color: Colors.PRIMARY, fontWeight: 'bold' }}>Reset Password</Text>
          </View>

          <View style={{backgroundColor: '#fff', marginHorizontal: 10, borderRadius: 5 }}>
            <View style={{ marginTop: 10 }}>
              <Text style={styles.textLabel}>Password</Text>
              <Feather name="lock" size={20} style={styles.inputIcon} />
              <TextInput style={styles.textInput} placeholder="Enter Password" placeholderTextColor="rgba(0,0,0,.5)" returnKeyType="next" autoCorrect={false} secureTextEntry={showPass} underlineColorAndroid="transparent" onChangeText={val => setPassword(val) } value={password} onSubmitEditing={() => confirmPasswordRef.current.focus()} />
              <TouchableOpacity style={styles.btnEye} onPress={handleShowPassword}><Ionicons name={press == false ? 'md-eye' : 'md-eye-off'} size={25} color="rgba(0,0,0,0.7)"></Ionicons></TouchableOpacity>
            </View>

            <View>
              <Text style={styles.textLabel}>Confirm Password</Text>
              <Feather name="lock" size={20} style={styles.inputIcon} />
              <TextInput style={styles.textInput} placeholder="Enter Confirm Password" placeholderTextColor="rgba(0,0,0,.5)" returnKeyType="go" autoCorrect={false} secureTextEntry={showPass} underlineColorAndroid="transparent" onChangeText={val => setConfirmPassword(val) } value={confirmPassword} ref={confirmPasswordRef} onSubmitEditing={ handleResetForm } />
            </View>
            <TouchableOpacity style={[styles.button, { opacity: (disabledBtn() == 1 ? 0.7 : 1) }]} onPress={ handleResetForm } disabled={disabledBtn() == 1 ? true : false}>
              <Text style={styles.btnText}>{animating === false ? "Reset Password" : "Checking..."}</Text>
              <ActivityIndicator animating={animating} color='#fff' size="small" style={{ position: "absolute", right: 70, top: 2}} />
            </TouchableOpacity>
          </View>
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
  textInput: {
    fontSize: 15,
    color: "#333",
    backgroundColor: '#F2FBF8',
    paddingHorizontal: 15,
    paddingVertical: 5,
    height: 50,
    width: SCREEN_WIDTH - 40,
    marginLeft: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 3,

    alignSelf: "stretch",
    marginBottom: 15,
    paddingLeft: 45
  },
  textLabel: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12
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
  },
  inputIcon: {
    position: 'absolute',
    left: 25,
    top: 35,
    color: '#00A968',
    zIndex: 999
  },
  btnEye: {
    position: 'absolute',
    right: 25,
    top: 30,
  }
});