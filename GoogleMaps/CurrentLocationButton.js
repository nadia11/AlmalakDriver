import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;


export const CurrentLocationButton = function(props) {
  const cb = props.cb ? props.cb : () => console.log('Callback function not passed to CurrentLocationButton!');
  const bottom = props.bottom ? props.bottom : 600;
  // console.log(props.bottom);

    return (
      <View style={[styles.container, {top: SCREEN_HEIGHT - bottom}]}>
        <MaterialIcons name="my-location" color="#000000" size={25} onPress={() => cb() } />
      </View>
    )
}

const styles = StyleSheet.create({
  container:{
    //position: 'absolte', thi create problem
    left: (SCREEN_WIDTH - 250),
    zIndex: 9,
    width: 45,
    height: 45,
    backgroundColor: 'white',
    borderRadius: 50,
    shadowColor: "#000000",
    elevation: 7,
    shadowRadius: 5,
    shadowOpacity: 1.0,
    alignItems: 'center',
    justifyContent: 'center'
  }
});