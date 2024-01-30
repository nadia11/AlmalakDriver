import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, Platform, ImageBackground } from 'react-native';
import * as Animatable from 'react-native-animatable';
import CustomStatusBar from '../components/CustomStatusBar';
import { Colors } from '../styles';
import SliderScrollView from '../components/SliderScrollView';


const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

export const StartUp = (props) => {
  const [sliderImages, setSliderImages] = React.useState([]);
  const [fromOnline, setFromOnline] = React.useState(false);

  const getSliderImage = () => {
    return fetch('https://tutofox.com/foodapp/api.json')
      .then((response) => response.json())
      .then((responseJson) => {
        setSliderImages(responseJson.banner);
        setFromOnline(true);
        //console.log(responseJson.banner)
      })
      .catch((error) => console.error(error));
  }
  
  React.useEffect(() => {
    //getSliderImage();
  }, []);

  
  const localSliderImages = [
    require('../assets/images/slider-1.jpg'),
    require('../assets/images/slider-2.jpg'),
    require('../assets/images/slider-3.jpg'),
    require('../assets/images/slider-4.jpg'),
  ]

  return (
    <View style={styles.container}>
        <CustomStatusBar backgroundColor={Colors.BUTTON_COLOR} />

        <Animatable.View animation="zoomIn" iterationCount={1} style={{ height: 100, width: 100, alignItems: 'center', justifyContent: 'flex-start', marginBottom: 30 }}>
          <Image style={{ height: 128, width: 128, resizeMode: 'contain' }} source={require('../assets/logo.png')} />
        </Animatable.View>

        <View style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <Text style={{ fontSize: 26, fontWeight: "bold", marginBottom: 10 }}>
            Welcome to Uder Driver App
          </Text>
        </View>

        {/* <SliderFlatlist images={fromOnline ? sliderImages : localSliderImages} fromUrl={fromOnline} sliderHeight={300} dotPosition="bottom" /> */}
        <SliderScrollView images={fromOnline ? sliderImages : localSliderImages} fromUrl={fromOnline} sliderHeight={SCREEN_HEIGHT / 2} dotPosition="bottom" />

        <View style={{position: 'absolute', bottom: 10, left: 10, flexWrap: "nowrap", flexDirection: "row", justifyContent: 'center'}}>
          <TouchableOpacity style={styles.button} onPress={() => props.navigation.navigate('LoginByEmail')}><Text style={styles.btnText}>Sign In</Text></TouchableOpacity>
          <TouchableOpacity style={styles.buttonOutline} onPress={() => props.navigation.navigate('SignUpMobile')}><Text style={{ color: "#EF0C14", fontWeight: 'bold', fontSize: 16}}>Sign Up</Text></TouchableOpacity>
        </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container:{
    // flex: 1,
    // backgroundColor: 'red',
    height: SCREEN_HEIGHT - 30,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 10,
    position: 'relative'
  },
  button: {
    alignItems: "center",
    padding: 15,
    backgroundColor: Colors.BUTTON_COLOR,
    marginVertical: 10,
    marginHorizontal: 5,
    borderRadius: 3,
    height: 50,
    width: (SCREEN_WIDTH /2) - 20
  },
  buttonOutline: {
    alignItems: "center",
    padding: 15,
    borderColor: Colors.BUTTON_COLOR,
    borderWidth: 1,
    marginVertical: 10,
    marginHorizontal: 5,
    borderRadius: 3,
    height: 50,
    width: (SCREEN_WIDTH /2) - 20
  },
  btnText: {
    color: "#fff", 
    fontWeight: 'bold',
    fontSize: 16
  },
});