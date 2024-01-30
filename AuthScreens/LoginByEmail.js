import React from 'react';
import { View, Text, StyleSheet, TextInput, Image, ImageBackground, TouchableOpacity, Animated, Dimensions, Keyboard, Platform, Alert, TouchableWithoutFeedback, ActivityIndicator, SafeAreaView, ScrollView, ToastAndroid } from 'react-native';

import * as Animatable from 'react-native-animatable';
//import { Container, Header, Content, Button } from 'native-base';
// import { Button } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomStatusBar from '../components/CustomStatusBar';
import axios from "axios";
import { BASE_URL, SMS_API_URL } from '../config/api';
import { Colors } from '../styles';
import { Options } from '../config';
import { AuthContext } from './context';


const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

export default function LoginByEmail(props) {
  const [userName, setUserName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const { signInToken } = React.useContext(AuthContext);
  const [userToken, setUserToken] = React.useState(null);

  const [showPass, setShowPass] = React.useState(true);
  const [press, setPress] = React.useState(false);
  const [animating, setAnimating] = React.useState(false);

  let emailRef = React.createRef();
  let passwordRef = React.createRef();

  const getUserData = async () => {
    try {
      const userName = await AsyncStorage.getItem('userName');
      const emailAddress = await AsyncStorage.getItem('email');
      if(userName !== null) { setUserName(userName) }
      if(emailAddress !== null) { setEmail(emailAddress) }
    } catch (error) { console.error(error); }
  }
  
    React.useEffect(() => {
    getUserData();
  }, []);

  const checkLogin = async () => {
    setAnimating( true );

    if(email === "" && password === ""){
      Alert.alert('Error', 'Must provide a username and password to log in.', [{ text: "OK" }]);
      setAnimating( false );
    }
    else{
      await fetch(BASE_URL+'/login-by-email', {
        method: 'POST', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: password })
      })
      .then((response) => response.json())
      .then(async (responseJson) => {
        console.log(responseJson);
        if(responseJson.code === 200){
          try {
            await AsyncStorage.setItem('userName', responseJson.user_name);
            await AsyncStorage.setItem('email', responseJson.user_email);
            await AsyncStorage.setItem('mobile', responseJson.user_mobile);
            await AsyncStorage.setItem('userImage', responseJson.user_image);
            
            if(responseJson.profile_status === "complete" && responseJson.driver_status === "pending" ){
              props.navigation.navigate('DriverStatusScreen', {
                userName: responseJson.user_name
              });
            } else {
              await AsyncStorage.setItem('userToken', '1');
              setUserToken('1');
              signInToken(); /*This for auto redirect to home page & refresh*/
              setAnimating( false );
              props.navigation.navigate('App');
            }

          } catch (error) { console.error(error); }
        }
        else if(responseJson.code === 501){
          Alert.alert('Error', responseJson.message, [{ text: "OK" }]);
          setAnimating( false );
        }
        else if(responseJson.code === 502){
          Alert.alert('Error', responseJson.message, [{ text: "OK" }]);
          setAnimating( false );
        }
      })
      .catch((error) => {
        console.log("Submitting Error: "+error); 
        ToastAndroid.show(Options.APP_OPTIONS.NETWORK_ERROR_MESSAGE, ToastAndroid.SHORT); 
        setAnimating( false );
      });
    }
  }

  const handleShowPassword = () => {
    if(press == false){ setShowPass(false);  setPress(true); }
    else { setShowPass(true);  setPress(false); }
  }

  const disabledBtn = () => {
    return email && password ? 0 : 1;
  }

  return (
  <SafeAreaView style={styles.container}>
    <ScrollView style={styles.footerScroll}>
      <CustomStatusBar />

      <ImageBackground source={require('../assets/login-bg.jpeg')} style={{ flex: 3, justifyContent: 'center', alignItems: 'center', resizeMode: 'contain', height: SCREEN_HEIGHT-360, width: SCREEN_WIDTH, marginBottom: 0, paddingTop: 50 }}>
        {/* <Animatable.View animation="zoomIn" iterationCount={1} style={{ height: 140, width: 140, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 5, marginTop: 30 }}>
          <Image style={{ height: 130, width: 130, resizeMode: 'contain' }} source={require('../assets/logo.png')} />
        </Animatable.View> */}
      </ImageBackground>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <Animatable.View animation="slideInUp" iterationCount={1} style={{height: 330, backgroundColor: "#fff" }}>
          <Animated.View style={{ opacity: 1, alignItems: 'center', paddingHorizontal: 10 }}>
            <Text style={{ fontSize: 24 }}>Get Moving with Uder</Text>
          </Animated.View>

          <Animated.View style={{ marginTop: 10, paddingHorizontal: 10 }}>
            <Text style={styles.textLabel}>Email</Text>
            <TextInput keyboardType="email-address" autoCapitalize="none" autoCorrect={false} returnKeyType="next" style={styles.textInput} placeholderTextColor='#444' underlineColorAndroid="transparent" onChangeText={val => setEmail(val) } value={email} ref={emailRef} onSubmitEditing={() => passwordRef.current.focus()} />
          </Animated.View>
          
          <Animated.View style={{ marginTop: 10, paddingHorizontal: 10 }}>
            <Text style={styles.textLabel}>Password</Text>
            <TextInput keyboardType="default" autoCorrect={false} secureTextEntry={showPass} style={styles.textInput} placeholderTextColor='#444' underlineColorAndroid="transparent" onChangeText={val => setPassword(val) } value={password} ref={passwordRef} onSubmitEditing={ checkLogin } />
          </Animated.View>

          <View style={{flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'flex-end'}}>
            <TouchableOpacity style={{ color: '#444', backgroundColor: '#fff', marginRight: 15, padding: 5, width: 200 }} onPress={() => props.navigation.navigate('ForgotPassword')}><Text style={{textAlign: 'right'}}>Forgot your Password?</Text></TouchableOpacity>
          </View>

          <TouchableOpacity style={[styles.button, { opacity: (disabledBtn() == 1 ? 0.7 : 1) }]} onPress={ checkLogin } disabled={disabledBtn() == 1 ? true : false}>
            <Text style={styles.btnText}>{animating === false ? "Sign In" : "Checking..."}</Text>
            <ActivityIndicator animating={animating} color='#fff' size="large" style={{ position: "absolute", right: 70, top: 2}} />
          </TouchableOpacity>

          <View style={{ height: 40, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'flex-end' }}>
            <Text style={{ color: "#444" }}>Dont have an account? <Text style={styles.hyperLinkText} onPress={() => props.navigation.navigate('SignUpMobile') }>Sign Up</Text></Text>
          </View>
        </Animatable.View>{ /*Bottom Part*/ }
      </TouchableWithoutFeedback>
    </ScrollView>
  </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#00C497',
    backgroundColor: '#fff',
    overflow: 'hidden',
    paddingTop: ( Platform.OS === 'ios' ) ? 20 : 0
  },
  textInput: {
    fontSize: 15,
    color: "#333",
    backgroundColor: '#F2FBF8',
    paddingHorizontal: 15,
    paddingVertical: 5,
    height: 40,
    width: SCREEN_WIDTH - 40,
    marginLeft: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 3
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
    width: SCREEN_WIDTH - 40,
    borderRadius: 50
  },
  btnText: {
    color: "#fff", 
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 18
  },
  hyperLinkText: {
    color: '#F53D3D',
    // textDecorationLine: 'underline',
    fontWeight: 'bold'
  }
});