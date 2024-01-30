import React, { Component } from 'react';
import { Text, View, StyleSheet, TextInput, TouchableOpacity, Image, TouchableWithoutFeedback, ActivityIndicator, SafeAreaView, Keyboard, KeyboardAvoidingView, Platform, Dimensions, ToastAndroid, Alert } from 'react-native';

import * as Animatable from 'react-native-animatable';
import Feather from 'react-native-vector-icons/Feather';
import axios from 'axios';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;
import { BASE_URL, SMS_API_URL } from '../../config/api';
import { Options } from '../../config';


export default function changePassword(props) {
  const [showPass, setShowPass] = React.useState(true);
  const [press, setPress] = React.useState(false);
  const [animating, setAnimating] = React.useState(false);

  const [incorrectPass, setIncorrectPass] = React.useState('');
  const [notMatchPass, setNotMatchPass] = React.useState('');
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');


  let newPasswordRef = React.createRef();
  let confirmNewPasswordRef = React.createRef();


  const handleShowPassword = () => {
    if(press == false){ setShowPass(false);  setPress(true); }
    else { setShowPass(true);  setPress(false); }
  }

  const disabledBtn = () => {
    return notMatchPass == "" && (currentPassword && password && confirmPassword !== '') ? 0 : 1;
  }

  const handleMatchPassword = () => {
    notMatchPass ? setNotMatchPass('') : setNotMatchPass("Does not match confirm password!");
  }
  

  const handleSubmit = async () => {
    setAnimating( true );
    console.log(props.route.params.email + currentPassword + password);

    await axios.post(BASE_URL+'/change-password-form-submit', {
      email: props.route.params.email,
      oldPassword: currentPassword,
      password: password
    })
    .then(async response => {
      if(response.data.code === 200){
          ToastAndroid.show(response.data.message, ToastAndroid.SHORT);
          setAnimating( false );
          props.navigation.navigate('Menu');
        }
        else if(response.data.code === 501){
          Alert.alert('Response Error', response.data.message, [{ text: "OK" }]);
          setIncorrectPass(response.data.message);
          setAnimating( false );
        }
    })
    .catch((error) => {
      console.log("Submitting Error: "+error); 
      ToastAndroid.showWithGravity(Options.APP_OPTIONS.NETWORK_ERROR_MESSAGE, ToastAndroid.SHORT, ToastAndroid.BOTTOM); 
      setAnimating( false );
    });
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : null} style={{ flex: 1, justifyContent: "flex-start" }} >
      <SafeAreaView style={{flex: 1}}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
              <View>
                <Feather name="lock" size={20} style={styles.inputIcon} />
                <Text style={styles.textLabel}>Current Password</Text>
                <TextInput style={styles.textinput} returnKeyType="next" autoCorrect={false} secureTextEntry={showPass} underlineColorAndroid="transparent" onChangeText={val => setCurrentPassword( val )} value={currentPassword} onSubmitEditing={() => newPasswordRef.current.focus()} />
                <TouchableOpacity style={styles.btnEye} onPress={ handleShowPassword }><Feather name={press == false ? 'eye' : 'eye-off'} size={25} color="rgba(0,0,0,0.7)" /></TouchableOpacity>
              </View>
                {incorrectPass !== '' && <Text style={styles.errorEmail}>{incorrectPass}</Text> }

              <View>
                  <Text style={styles.textLabel}>New Password</Text>
                  <Feather name="lock" size={20} style={styles.inputIcon} />
                  <TextInput style={styles.textinput} returnKeyType="next" autoCorrect={false} secureTextEntry={showPass} underlineColorAndroid="transparent" onChangeText={val => setPassword( val )} value={password} ref={newPasswordRef} onSubmitEditing={() => confirmNewPasswordRef.current.focus()} />
              </View>

              <View>
                  {notMatchPass !== '' && <Text style={styles.errorEmail}>{notMatchPass}</Text> }
                  {notMatchPass == '' && <Text style={styles.textLabel}>Confirm New Password</Text> }
                  <Feather name="lock" size={20} style={styles.inputIcon} />
                  <TextInput style={styles.textinput} returnKeyType="done" autoCorrect={false} secureTextEntry={showPass} underlineColorAndroid="transparent" onChangeText={val => setConfirmPassword( val )} value={confirmPassword} onEndEditing={handleMatchPassword} ref={confirmNewPasswordRef} onSubmitEditing={handleSubmit} />
              </View>
              
              <TouchableOpacity style={[styles.button, { opacity: (disabledBtn() == 1 ? 0.7 : 1) }]} onPress={ handleSubmit } disabled={disabledBtn() == 1 ? true : false}>
                <ActivityIndicator animating={animating} color='#fff' size="large" style={{ position: "absolute", left: 60, top: 5}} />
                <Text style={styles.btnText}>{animating === false ? "Change Password" : "Submitting..."}</Text>
              </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingLeft: 30,
    paddingRight: 30,
    marginTop: 50
  },
  header: {
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
    paddingBottom: 10,
    marginBottom: 30,
    borderBottomColor: '#fff',
    borderBottomWidth: 1
  },
  textinput: {
    fontSize: 16,
    alignSelf: "stretch",
    height: 45,
    marginBottom: 15,
    color: "#333",
    borderColor: "#ccc",
    borderWidth: 1,
    backgroundColor: '#F2FBF8',
    paddingHorizontal: 15,
    paddingLeft: 40,
    borderRadius: 5,
    width: SCREEN_WIDTH - 60,
  },
  textLabel: {
    fontSize: 16,
    color: '#333',
    marginLeft: 0
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    top: 32,
    color: '#00A968',
    zIndex: 999
  },
  btnEye: {
    position: 'absolute',
    right: 15,
    top: 32,
  },
  button: {
    alignSelf: "stretch",
    padding: 10,
    backgroundColor: "#EF0C14",
    marginTop: 30,
    borderRadius: 5,
    width: SCREEN_WIDTH - 60
  },
  btnText: {
    fontSize: 18,
    color: "#fff", 
    textTransform: 'uppercase'
  },
  errorEmail: {
    fontSize: 14,
    color: 'red',
    marginTop: -15,
    marginBottom: 10,
    marginLeft: 0
  }
});
