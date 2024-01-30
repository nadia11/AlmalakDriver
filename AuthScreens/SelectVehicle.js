import React, { Component } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, Platform, SafeAreaView, ScrollView } from 'react-native';
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import Ionicons from "react-native-vector-icons/Ionicons";

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;


export default function SelectVehicle(props) {
    const [vehicleType, setVehicleType] = React.useState('');

  const tabs = [
    { id: 1, name: 'Bike', title: "Bike", desc: "", icon: "motorcycle", color: '#EF0C14' },
    { id: 2, name: 'Car', title: "Car", desc: "", icon: "car", color: '#28a745' },
    { id: 3, name: 'Micro', title: "Micro", desc: "", icon: "shuttle-van", color: '#007bff' },
    { id: 4, name: 'Pickup', title: "Pickup", desc: "", icon: "truck-pickup", color: '#ffae00' },
    { id: 5, name: 'Ambulance', title: "Ambulance", desc: "", icon: "ambulance", color: '#dc3545' }
  ]

  const disabledBtn = () => {
    let fields = vehicleType;
    return fields !== '' ? 0 : 1;
  }

  const handleSubmit = () => {
      if(vehicleType == 1){
        props.navigation.navigate('VehicleInformationBike', {
          vehicleType: vehicleType,
          division_id: props.route.params.division_id,
          district_id: props.route.params.district_id,
          branch_id: props.route.params.branch_id,
          mobile: props.route.params.mobile
        });
      }
      else {
        props.navigation.navigate('VehicleInformation', {
          vehicleType: vehicleType,
          division_id: props.route.params.division_id,
          district_id: props.route.params.district_id,
          branch_id: props.route.params.branch_id,
          mobile: props.route.params.mobile,
          headerTitle: 'Sign up for '+ tabs[vehicleType-1].name
        });
      }
  }

  return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.footerScroll} contentContainerStyle={{flexGrow: 1, paddingBottom: 50}}>
          <View style={{marginBottom: 25, paddingVertical: 15}}>
            <Text style={{textAlign: 'center', fontSize: 30, fontWeight: 'bold', color: '#333'}}>Select Vehicle</Text>
          </View>

            {tabs.map((obj, index) => {
                return (
                  <TouchableOpacity style={[styles.vehicleListItem, (obj.id === vehicleType ? styles.vehicleListItemActive : "")]} key={index} onPress={() => {setVehicleType(obj.id); }}>
                      <FontAwesome5 style={styles.vehicleIcon} size={40} name={obj.icon} color={obj.color} />
                      <Text style={styles.title}>{obj.title.toLocaleUpperCase()}</Text>
                      <Ionicons name="ios-arrow-forward" size={20} color="#aaa" style={styles.rightIcon} />
                  </TouchableOpacity>
                )
            })}
        </ScrollView>

        <TouchableOpacity style={[styles.button, { opacity: (disabledBtn() == 1 ? 0.7 : 1) }]} onPress={handleSubmit} disabled={disabledBtn() == 1 ? true : false}>
          <Text style={styles.btnText}>Continue Sign Up</Text>
        </TouchableOpacity>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container:{
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 20,
    // paddingTop: (Platform.OS === 'ios') ? 25 : 0
  },
  footerScroll: {
      width: SCREEN_WIDTH,
      backgroundColor: '#fff',
      paddingHorizontal: 20,
      paddingVertical: 10,
      marginBottom: 100,
  },
  vehicleListItem: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderRadius: 5,
    height: 80,
    marginBottom: 20,
    padding: 20,
    backgroundColor: '#F5F5F5',
    elevation: 3,
    shadowColor: '#2AC062',
    shadowOpacity: 0.5,
    shadowOffset: { height: 10, width: 0},
    shadowRadius: 25,
  },
  vehicleListItemActive: {
    borderColor: "red",
    borderWidth: 2,
    backgroundColor: 'rgba(255,0,0,0.1)',
    elevation: 0,
  },
  title: {
    fontSize: 20
  },
  vehicleIcon: {
    marginRight: 15
  },
  rightIcon: {
    position: 'absolute',
    right: 20,
    top: 25
  },
  button: {
    position: 'absolute',
    bottom: -10,
    left: 15,
    alignItems: "center",
    padding: 15,
    backgroundColor: "#DC2322",
    marginVertical: 30,
    marginHorizontal: 5,
    borderRadius: 3,
    height: 50,
    width: (SCREEN_WIDTH - 40)
  },
  btnText: {
    color: "#fff", 
    fontWeight: 'bold',
    fontSize: 16,
    textTransform: "uppercase"
  }
});