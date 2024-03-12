import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Platform, BackHandler, ToastAndroid, AppState } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { useNetInfo } from '@react-native-community/netinfo';
import { NotifyService } from './AdminScreen/NotifyService';
import { AuthContext } from './AuthScreens/context';
import ActivityLoader from './components/ActivityIndicator';
import NetworkConnectionStatus from './components/NetworkConnectionStatus';
import { Colors } from './styles';
import { Options } from './config';
import CheckAppUpdate from './components/CheckAppUpdate';

/************ Authentication Section ****************/
import SplashScreen from 'react-native-splash-screen';
// import SplashScreen from './AuthScreens/Splash';
import { StartUp } from './AuthScreens/StartUp';
import SignUpMobileScreen from './AuthScreens/SignUpMobile';
import { SignUpForm } from './AuthScreens/SignUpForm';
import SelectDivision from './AuthScreens/SelectDivision';
import SelectVehicle from './AuthScreens/SelectVehicle';
import VehicleInformation from './AuthScreens/VehicleInformation';
import VehicleInformationBike from './AuthScreens/VehicleInformationBike';
import DriverStatusScreen from './AuthScreens/DriverStatusScreen';
//import LoginMobileScreen from './AuthScreens/LoginMobile';
import { OTPVerification } from './AuthScreens/OTPVerification';
import LoginByEmail from './AuthScreens/LoginByEmail';
import ForgotPassword from './AuthScreens/ForgotPassword';
import PasswordResetVerify from './AuthScreens/PasswordResetVerify';
import PasswordResetForm from './AuthScreens/PasswordResetForm';
import TermsAndConditionsModal from './AuthScreens/TermsAndConditionsModal';
import PrivacyPolicyModal from './AuthScreens/PrivacyPolicyModal';

/************ Home Section ****************/
import HomeScreen from './AdminScreen/Home';
import DriverMapScreen from './GoogleMaps/DriverMapScreen';
import agentLocator from './GoogleMaps/agentLocator';
import chatMessage from './components/chatMessage';
import driverPaymentInvoice from './GoogleMaps/driverPaymentInvoice';
import InviteFriends from './AdminScreen/MenuScreens/InviteFriends';
import InviteFriendsSelectContacts from './AdminScreen/MenuScreens/InviteFriendsSelectContacts';
import LoginMobile from './AuthScreens/LoginMobile';

const instructions = Platform.select({
  android: 'Double tap R on your keyboard to reload, \n' + 'Shake or Press menu button for dev menu.',
  ios: 'Press Cmd+R to reload, \n' + 'Cmd+D or Shake for dev menu.'
});
// {instructions}

const AuthStack = createNativeStackNavigator();
function AuthStackScreen() {
  return (
    <AuthStack.Navigator initialRouteName="StartUp" screenOptions={{ gestureEnabled: false, headerTransparent:true, headerStyle: { backgroundColor: Colors.HEADER_NAV_COLOR, height: 50 }, headerTitleAlign: 'center', headerTitleStyle: { fontWeight: 'bold' }, headerTintColor: '#fff', headerBackTitleVisible: false }} headerMode='float'>
      <AuthStack.Screen name="StartUp" component={StartUp} options={{ title:"", headerTransparent:false, headerShown: false }} />
      <AuthStack.Screen name="SignUpMobile" component={SignUpMobileScreen} options={{ title: 'Sign Up Mobile', headerTransparent:false }} />
      <AuthStack.Screen name="SelectDivision" component={SelectDivision} options={{ title: 'Division Selection', headerTransparent:false }} />
      <AuthStack.Screen name="SelectVehicle" component={SelectVehicle} options={{ title: 'Vehicle Selection', headerTransparent:false }} />
      <AuthStack.Screen name="VehicleInformation" component={VehicleInformation} options={({ route }) => ({ title: route.params.headerTitle, headerTransparent:false })} />
      <AuthStack.Screen name="VehicleInformationBike" component={VehicleInformationBike} options={{ title: 'Sign Up for Bike', headerTransparent:false }} />
      <AuthStack.Screen name="SignUpForm" component={SignUpForm} options={{ title: 'Sign Up Form', headerTransparent:false }} />
      // <AuthStack.Screen name="LoginMobile" component={LoginMobileScreen} options={{ title: 'Login By Mobile', headerTransparent:true }} />
      <AuthStack.Screen name="OTPVerification" component={OTPVerification} options={{ title: 'OTP Verification', headerTransparent:false }} />
     <AuthStack.Screen name="LoginByEmail" component={LoginByEmail} options={{ title: 'Login By Email', headerTransparent:true }} />
       <AuthStack.Screen name="LoginMobile" component={LoginMobile} options={{ title: 'Login By Mobile', headerTransparent:true }} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPassword} options={{ title: 'Forgot Password', headerTransparent:false }} />
      <AuthStack.Screen name="PasswordResetVerify" component={PasswordResetVerify} options={{ title: 'Password Reset Verify', headerTransparent:false }} />
      <AuthStack.Screen name="PasswordResetForm" component={PasswordResetForm} options={{ title: 'Password Reset Form', headerTransparent:false }} />
      <AuthStack.Screen name="DriverStatusScreen" component={DriverStatusScreen} options={{ title: '', headerTransparent:true }} />
      <AuthStack.Screen name="TermsAndConditionsModal" component={TermsAndConditionsModal} options={{ title: '', headerBackTitleVisible: false, headerTintColor: '#333' }} />
      <AuthStack.Screen name="PrivacyPolicyModal" component={PrivacyPolicyModal} options={{ title: '', headerBackTitleVisible: false, headerTintColor: '#333' }} />
    </AuthStack.Navigator>
  );
}

const AppStack = createNativeStackNavigator();
const AppStackScreen = () => (
  <AppStack.Navigator initialRouteName="DriverMapScreen" screenOptions={Options.APP_OPTIONS.SCREEN_OPTIONS} headerMode='float'>
    <AppStack.Screen name="DriverMapScreen" component={DriverMapScreen} options={{ headerShown: false }} />
    <AppStack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
    <AppStack.Screen name="chatMessage" component={chatMessage} options={{ headerShown: false }} />
    <AppStack.Screen name="InviteFriends" component={InviteFriends}  />
    <AppStack.Screen name="InviteFriendsSelectContacts" component={InviteFriendsSelectContacts} options={{ headerShown: false }} />
    <AppStack.Screen name="driverPaymentInvoice" component={driverPaymentInvoice} options={{ title:'Payment Invoice', headerTransparent: false, headerRight: () => Options.APP_OPTIONS.HEADER_LOGO }} />
    <AppStack.Screen name="agentLocator" component={agentLocator} options={{headerShown: false}} />
  </AppStack.Navigator>
);

const RootStack = createNativeStackNavigator();
export default function App(props) {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [language, setLanguage] = useState(null);
  const [mobile, setMobile] = useState();

  useEffect(() => {
    SplashScreen.hide();
    setTimeout(() => { setIsLoading(false); }, 1000);
  }, []);

  //Push Notification Init
  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);
  
  // const onNotificationOpenedApp = () => {};
  // useEffect(() => {
  //   NotifyService.configure(onNotificationOpenedApp);

  //   AppState.addEventListener('change', handleAppStateChange);
  //   //AppState.addEventListener('focus', handleAppStateChange);
  //   //AppState.addEventListener('blur', handleAppStateChange);

  //   return () => AppState.removeEventListener('change', handleAppStateChange);
  // }, []);

  const handleAppStateChange = (nextAppState) => {
    if (nextAppState === 'active') {
      //console.log("AppState: ", nextAppState);
    }

    if (nextAppState === 'background') {
      setAppStateVisible(nextAppState);
      //console.log("AppState: ", nextAppState);
    }
  };
  
  const authContext = useMemo(() => {
    return {
      signInToken: async () => { setIsLoading(false); setUserToken('1') },
      signUp: () => { setIsLoading(false); setUserToken('1') },
      signOut: async () => {
          try {
            setIsLoading(false);
            setUserToken(null);
            await AsyncStorage.removeItem('userToken');
          }
		  catch (error) { console.error(error); }
      },
    };
  }, []);

  const getUserData = async () => {
    try {
      const userToken = await AsyncStorage.getItem('userToken')
      const mobile = await AsyncStorage.getItem('mobile')
      const langStorage = await AsyncStorage.getItem('langStorage');
      
      if(userToken !== null) { setUserToken( userToken ); }
      if(mobile !== null) { setMobile( mobile ); }
      if(langStorage !== null) { setLanguage( langStorage ); }
    } 
    catch (error) { console.error(error); }
  }
  useEffect(() => { getUserData(); }, []);
  

  //For check network connection
  const netinfo = useNetInfo();
  useEffect(() => {

  }, [netinfo.isConnected]);
  

  //For back button
  const [backPressed, setBackPressed] = useState(0);
  useEffect(() => {
    const backAction = () => {
      // 2 seconds to tap second-time
      setTimeout(() => { setBackPressed(0); }, 2000);

      if (backPressed < 1) { setBackPressed(backPressed + 1); 
        ToastAndroid.show("Double Tap to exit the App", ToastAndroid.SHORT); }
      else { BackHandler.exitApp() }

      //Alert.alert('Confirm Exit', 'Do you want to Exit from App?', [ {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'}, {text: 'Exit', onPress: () => BackHandler.exitApp()} ]);
      return true;
    };
    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);

    return () => backHandler.remove();
  }, [backPressed]);

  if (isLoading) {
    return <ActivityLoader />;
  }

  return (
    <AuthContext.Provider value={authContext}>
      {/* <CheckAppUpdate /> */}

      <NavigationContainer>
        <RootStack.Navigator headerMode="none">
          {userToken == null ? (
            <RootStack.Screen name="Auth" component={AuthStackScreen} options={{ headerShown: false }} />
          ) : netinfo.isConnected !== true ? (
            <RootStack.Screen name="Network" component={NetworkConnectionStatus} />
          ) : (
            <RootStack.Screen name="App" component={AppStackScreen} options={{ headerShown: false }} />
          )}
        </RootStack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: '#36485f',
    paddingLeft: 40,
    paddingRight: 40,
    paddingTop: Platform.OS === 'ios' ? 25 : 0,
  },
});
