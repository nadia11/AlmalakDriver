import React, { Component } from 'react';
import { Text, View, StyleSheet, TextInput, TouchableOpacity, Image, TouchableWithoutFeedback, SafeAreaView, ScrollView, Keyboard, Platform, Dimensions, Alert, ActivityIndicator, ToastAndroid, PermissionsAndroid } from 'react-native';

import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";
// import { Input } from 'react-native-elements';
import axios from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import { Picker } from '@react-native-community/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

import { AuthContext } from './context';
import CustomStatusBar from '../components/CustomStatusBar';
import { Colors } from '../styles';
import { BASE_URL, SMS_API_URL } from '../config/api';
import { Options } from '../config';
import Modal from 'react-native-modal';


export const SignUpForm = (props) => {
  const { navigation } = props;
  // const { signInToken } = React.useContext(AuthContext);
  // const [userToken, setUserToken] = React.useState(null);

  const [showPass, setShowPass] = React.useState(true);
  const [press, setPress] = React.useState(false);
  const [animating, setAnimating] = React.useState(false);
  const [errorEmail, setErrorEmail] = React.useState('')

  const [date, setDate] =  React.useState(new Date());
  const [mode, setMode] = React.useState('date');
  const [show, setShow] = React.useState(false);


  let emailRef = React.createRef();
  let passwordRef = React.createRef();
  let dobRef = React.createRef();
  let nidRef = React.createRef();
  let referralCodeRef = React.createRef();
  let referralMobRef = React.createRef();


  /***Submit Form***/
  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [gender, setGender] = React.useState('');
  const [dateOfBirth, setDateOfBirth] = React.useState('');
  const [nationalId, setNationalId] = React.useState('');
  const [referralCode, setReferralCode] = React.useState('');
  const [referralMobile, setReferralMobile] = React.useState('');
  // const [userPhoto, setUserPhoto] = React.useState('');
  const [userImage, setUserImage] = React.useState(null);
  const [uploadedImage, setUploadedImage] = React.useState({});
  const [uploadImageModal, setUploadImageModal] =  React.useState(false);
  const [mobile, setMobile] = React.useState('');


  const getUserData = async () => {
    try {
      const mobile = await AsyncStorage.getItem('mobile')
      
      if(mobile !== null) { setMobile( mobile ); }
    } catch (error) { console.error(error); }
  }
  React.useEffect(() => { getUserData() }, []);



  const setDateOnChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShow(Platform.OS === 'ios' ? true : false);

    if(event.type == "set") {
      setDate(currentDate);
      setDateOfBirth(currentDate);
    } else {
      console.log("cancel button clicked");
    }
  };

  const showMode = currentMode => {
    setShow(true);
    setMode(currentMode);
  };

  const showDatepicker = () => {
    showMode('date');
  };

  const isEmailValid = () => {
      let Pattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      Pattern.test(String(email).toLowerCase()) ? setErrorEmail('') : setErrorEmail("Invalid Email Address");
  }
  
  const _handleShowPassword = () => {
    if(press == false){ setShowPass(false);  setPress(true); }
    else { setShowPass(true);  setPress(false); }
  }

  const _handleSubmit = async () => {
    setAnimating( true );
    console.log(fullName + mobile + email + password + gender + moment(dateOfBirth).format('DD/MM/YYYY') +nationalId +referralCode +referralMobile);

    await axios.post(BASE_URL+'/submit-driver-form', {
      full_name: fullName,
      mobile: mobile,
      email: email,
      password: password,
      gender: gender,
      date_of_birth: moment(dateOfBirth).format('DD/MM/YYYY'),
      national_id: nationalId,
      referral_code: referralCode,
      referral_mobile: referralMobile,
      user_image: 'data:image/jpeg;base64,' + uploadedImage?.assets[0]?.base64,
      file_name: uploadedImage?.assets[0]?.fileName === undefined ? "no_image" : uploadedImage?.assets[0]?.fileName,
    })
    .then(async response => {
      if(response.data.code === 200){
          //console.log("Response code: "+response.data.code);
          try {
            await AsyncStorage.setItem('userName', fullName );
            await AsyncStorage.setItem('email', email);
            await AsyncStorage.setItem('mobile', mobile);
            await AsyncStorage.setItem('userImage', response.data.user_image);
            await AsyncStorage.setItem('profileStatus', "complete");
            await AsyncStorage.setItem('driverStatus', "pending");

            ToastAndroid.show(response.data.message, ToastAndroid.SHORT);
            setAnimating( false );
            props.navigation.navigate('DriverStatusScreen', {userName: fullName});
          } catch (error) { console.error(error); }
        }
        else if(response.data.code === 501){
          Alert.alert('Response Error', response.data.message, [{ text: "OK" }]);
          setErrorEmail(response.data.message);
          setAnimating( false );
        }
    })
    .catch((error) => {
      console.log("Submitting Error: "+error); 
      ToastAndroid.showWithGravity(Options.APP_OPTIONS.NETWORK_ERROR_MESSAGE, ToastAndroid.SHORT, ToastAndroid.BOTTOM); 
      setAnimating( false );
    });
  }

  const getPermissionFromCamera = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA, {
          title: Options.APP_OPTIONS.AppName + " Camera Permission",
          message: Options.APP_OPTIONS.AppName + "App needs access to your camera so you can take your profile pictures.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );
      
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        getPhotoFromCamera();
      } else {
        ToastAndroid.show("Camera permission denied", ToastAndroid.SHORT); 
      }
    } catch (err) { 
      console.warn(err);
      ToastAndroid.show("Error: "+err, ToastAndroid.SHORT);
    }
  };

  const getPhotoFromCamera = () => {
    setUploadImageModal(false);

    const options = {
      mediaType: 'photo',
      quality: 1,
      maxWidth: 200,
      maxHeight: 300,
      includeBase64: true,
      //saveToPhotos: true,
      //mediaType: 'video',
      //videoQuality: 'high',
      //durationLimit: 100000, //Video max duration in seconds
      cameraType: 'front', /**'back' or 'front'**/
    };
    
    launchCamera(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } 
      else if (response.errorMessage) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } 
      else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } 
      else {
        //console.log("uri: "+ response.uri + ", filename: "+response.fileName + ", fileSize: "+response.fileSize + ", width: "+response.width + ", height: "+response.height + ", type: " + response.type + ", base64: "+ response.base64);
        setUserImage(response?.assets[0]?.base64);
        setUploadedImage(response);
      }
    });
  }

  const getPermissionFromGallery = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA, {
          title: "Cool Photo App Camera Permission",
          message: "Cool Photo App needs access to your camera " + "so you can take awesome pictures.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );
      
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        getPictureFromGallery();
      } else {
        ToastAndroid.show("Camera permission denied", ToastAndroid.SHORT); 
      }
    } catch (err) { console.warn(err); }
  };

  const getPictureFromGallery = () => {
    setUploadImageModal(false);

    const options = {
      mediaType: 'photo',
      maxWidth: 200,
      maxHeight: 300,
      includeBase64: true
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } 
      else if (response.errorMessage) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } 
      else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } 
      else {
        //console.log("uri: "+ response.uri + ", filename: "+response.fileName + ", fileSize: "+response.fileSize + ", width: "+response.width + ", height: "+response.height + ", type: " + response.type + ", base64: "+ response.base64);
        setUserImage(response?.assets[0]?.base64);
        setUploadedImage(response);
      }
    });
  }

  const _disabledBtn = () => {
    let fields = fullName && email && password && gender && dateOfBirth && nationalId && userImage;
    return (fields ===null || fields === undefined || fields === "") ? 1 : 0;
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.footerScroll} contentContainerStyle={{width: SCREEN_WIDTH, flexGrow: 1, paddingBottom: 30}}>
	  	  
        <CustomStatusBar />

        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.regform}>

            <View style={{justifyContent: 'center', alignItems: 'center', marginVertical: 30, width: SCREEN_WIDTH-60}}>
              <TouchableOpacity onPress={() => setUploadImageModal(true)} style={styles.uploadAvatar}>
                <View style={styles.avatarContainer}>
                  {userImage === null ? (
                    <Feather name="user" size={60} color="#000" style={{ height: 120, width: 120, borderRadius: 0, padding: 20 }} />
                  ) : (
                    <Image source={{uri: userImage, crop: {left: 30, top: 30, width: 60, height: 60}}} style={{ height: 120, width: 120, resizeMode: 'contain', borderRadius: 0 }} />
                  )}
                </View>
              </TouchableOpacity>

              <Modal isVisible={uploadImageModal} animationType='slide' backdropColor="#000" backdropOpacity={0.3} style={styles.bottomModal} onBackButtonPress={() => setUploadImageModal(false)} onBackdropPress={() => setUploadImageModal(false)} deviceWidth={SCREEN_WIDTH} deviceHeight={SCREEN_HEIGHT}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                  <View style={styles.modalBackground}>
                    <Text style={styles.title}>Photo</Text>

                    <TouchableOpacity onPress={getPermissionFromCamera} style={[styles.addButton, {borderBottomColor: '#ccc', borderBottomWidth: 1 }]}>
                      <Text style={styles.addButtonText}> Take From Camera</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={getPermissionFromGallery} style={styles.addButton}>
                      <Text style={styles.addButtonText}>Select From Gallery</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableWithoutFeedback>
              </Modal>

              <Text style={{fontSize: 18}}>Take your profile photo</Text>
            </View>

            <View>
              <Feather name="user" size={20} style={styles.inputIcon} />
              <TextInput style={styles.textinput} placeholder="Full Name (Same as NID/Driving License)" placeholderTextColor="rgba(0,0,0,.5)" keyboardType="default" returnKeyType="next" autoCorrect={false} underlineColorAndroid="transparent" onChangeText={val => setFullName( val )} value={fullName} onSubmitEditing={() => emailRef.current.focus()} />
            </View>
            {errorEmail !== '' && <Text style={styles.errorEmail}>{errorEmail}</Text> }
            <View>
              <Feather name="mail" size={20} style={styles.inputIcon} />
              <TextInput style={styles.textinput} placeholder="Email Address" placeholderTextColor="rgba(0,0,0,.5)" keyboardType="email-address" returnKeyType="next" autoCorrect={false} underlineColorAndroid="transparent" onChangeText={val => setEmail( val )} value={email} onEndEditing={isEmailValid} ref={emailRef} onSubmitEditing={() => passwordRef.current.focus()} />
            </View>

            <View>
              <Feather name="lock" size={20} style={styles.inputIcon} />
              <TextInput style={styles.textinput} placeholder="Enter Password" placeholderTextColor="rgba(0,0,0,.5)" returnKeyType="go" autoCorrect={false} secureTextEntry={showPass} underlineColorAndroid="transparent" onChangeText={val => setPassword( val )} value={password} ref={passwordRef} onSubmitEditing={(event) => dobRef.current.focus()} />
              <TouchableOpacity style={styles.btnEye} onPress={ _handleShowPassword }><Ionicons name={press == false ? 'eye' : 'eye-off'} size={20} color="rgba(0,0,0,0.7)"></Ionicons></TouchableOpacity>
            </View>

            <View style={{flexDirection: 'row'}}>
              <View>
                <Ionicons name="transgender" size={20} style={styles.inputIcon} />
                <Picker selectedValue={gender} onValueChange={(itemValue, itemIndex) => setGender(itemValue)} style={[styles.textinput, {width: (SCREEN_WIDTH - 70)/2, marginRight: 10, elevation: 3, shadowColor: '#000', shadowOpacity: 1, shadowOffset: {x: 0, y: 0}, shadowRadius: 5}]}>
                  <Picker.Item label="--Select Gender--" value="" />
                  <Picker.Item label="Male" value="male" />
                  <Picker.Item label="Female" value="female" />
                  <Picker.Item label="Others" value="others" />
                </Picker>
              </View>
              <View>
                <Feather name="calendar" size={20} style={styles.inputIcon} />
                <TextInput style={[styles.textinput, {width: (SCREEN_WIDTH - 70)/2}]} placeholder="Date of birth" placeholderTextColor="rgba(0,0,0,.5)" keyboardType="number-pad" returnKeyType="go" autoCorrect={false} underlineColorAndroid="transparent" onChangeText={val => setDateOfBirth( val )} value={dateOfBirth ? moment(dateOfBirth).format('DD/MM/YYYY') : ""} onFocus={showDatepicker} ref={dobRef} onSubmitEditing={(event) => nidRef.current.focus()} />
              </View>
            </View>

            {show && (
              <DateTimePicker testID="dateTimePicker" timeZoneOffsetInMinutes={0} display="default" 
              value={date} mode={mode} onChange={setDateOnChange}
              is24Hour={false} dateFormat={"dayofweek day month"} firstDayOfWeek="Saturday"
              minimumDate={new Date().setFullYear(new Date().getFullYear()-100)} maximumDate={new Date()}
              />
            )}

            <View>
              <Feather name="user-check" size={20} style={styles.inputIcon} />
              <TextInput style={styles.textinput} placeholder="National ID" placeholderTextColor="rgba(0,0,0,.5)" returnKeyType="go" keyboardType="numeric" autoCorrect={false} underlineColorAndroid="transparent" onChangeText={val => setNationalId( val )} value={nationalId} ref={nidRef} onSubmitEditing={(event) => referralCodeRef.current.focus()} />
            </View>

            <View>
              <Feather name="user-check" size={20} style={styles.inputIcon} />
              <TextInput style={styles.textinput} placeholder="Referral Code (Optional)" placeholderTextColor="rgba(0,0,0,.5)" returnKeyType="go" autoCorrect={false} underlineColorAndroid="transparent" onChangeText={val => setReferralCode( val )} value={referralCode} ref={referralCodeRef} onSubmitEditing={(event) => referralMobRef.current.focus()} />
            </View>

            <View>
              <Feather name="phone" size={20} style={styles.inputIcon} />
              <TextInput style={styles.textinput} placeholder="Referral Mobile (Optional)" placeholderTextColor="rgba(0,0,0,.5)" keyboardType="numeric" returnKeyType="go" autoCorrect={false} underlineColorAndroid="transparent" onChangeText={val => setReferralMobile( val )} value={referralMobile} maxLength={13} ref={referralMobRef} />
            </View>

            <Text style={{ fontSize: 14, lineHeight: 20, color: '#666', paddingVertical: 10, paddingHorizontal: 20, textAlign: 'justify', width: SCREEN_WIDTH-20, marginLeft: -20 }}>By tapping continue, I confirm that I have read and agree to the <Text style={styles.hyperLinkText} onPress={()=> props.navigation.navigate('TermsAndConditionsModal') }>Terms & Conditions</Text> and <Text style={styles.hyperLinkText} onPress={()=> props.navigation.navigate('PrivacyPolicyModal') }>Privacy Policy</Text> of Uder</Text>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>

      <TouchableOpacity style={[styles.button, { opacity: (_disabledBtn() == 1 ? 0.7 : 1) }]} onPress={ _handleSubmit } disabled={_disabledBtn() == 1 ? true : false}>
        <Text style={styles.btnText}>{animating === false ? "Complete Registration" : "Submitting..."}</Text>
        <ActivityIndicator animating={animating} color='#fff' size="large" style={{ position: "absolute", right: 70, top: 2}} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: SCREEN_WIDTH,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingLeft: 30,
    paddingTop: 10
  },
  bottomModal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalBackground: {
    backgroundColor: '#fff',
    // height: 200,
    margin: 10,
    borderRadius: 3
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    // marginBottom: 20,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 10,
    color: Colors.PRIMARY
  },
  addButton: {
    
  },
  addButtonText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#000',
    paddingHorizontal: 10,
    paddingVertical: 20
  },
  uploadAvatar: {
    backgroundColor: '#ccc',
    height: 100,
    width: 100,
    borderRadius: 100,
    overflow: 'hidden'
  },
  avatarContainer: {

  },
  regform: {
    alignSelf: "stretch",
    textAlign: 'center'
  },
  header: {
    //fontFamily: 'Roboto-Bold',
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
    paddingBottom: 10,
    marginBottom: 30,
    borderBottomColor: '#fff',
    borderBottomWidth: 1
  },
  textinput: {
    alignSelf: "stretch",
    fontSize: 16,
    height: 50,
    marginBottom: 15,
    color: "#333",
    borderColor: "#ccc",
    borderWidth: 1,
    backgroundColor: '#F2FBF8',
    paddingHorizontal: 15,
    paddingLeft: 45,
    borderRadius: 5,
    width: (SCREEN_WIDTH - 60)
  },
  button: {
    alignSelf: "stretch",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#EF0C14",
    marginTop: 30,
    borderRadius: 5,
    marginBottom: 30,
    width: (SCREEN_WIDTH - 60)
  },
  btnText: {
    color: "#fff", 
    fontWeight: 'bold',
    fontSize: 16,
    //fontFamily: 'Roboto-Bold'
  },
  inputIcon: {
    position: 'absolute',
    left: 15,
    top: 12,
    color: '#00A968',
    zIndex: 999
  },
  btnEye: {
    position: 'absolute',
    right: 70,
    top: 15,
  },
  hyperLinkText: {
    color: '#F53D3D',
    // textDecorationLine: 'underline',
    fontWeight: 'bold',
    padding: 3
  },
  errorEmail: {
    fontSize: 12,
    color: 'red',
    marginHorizontal: 20
  }
});
