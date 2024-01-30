import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Button, Image, SafeAreaView, ScrollView } from 'react-native';

import Feather from "react-native-vector-icons/Feather";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import { Colors, Typography } from '../styles';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;
const Grid_Columns = 4;

// import Noticeboard from '../components/NoticeBoard';


// export function HomeDetailsScreen() {
//   return (
//     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//       <Text>Home Details!</Text>
//     </View>
//   );
// }

// export function HomeScreen2({ navigation }) {
//   return (
//     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//       <Button title="Go to Home Details" onPress={() => navigation.openDrawer('DrawerNavigator')} />
//     </View>
//   );
// }


export default function HomeScreen({ navigation }) {

  const [homePlace, setHomePlace] = React.useState();
  const [workPlace, setWorkPlace] = React.useState();

  const retrieveData = async () => {
    try {
      const homePlace = await AsyncStorage.getItem('homePlace');
      if(homePlace !== null) { setHomePlace(JSON.parse(homePlace)) }

      const workPlace = await AsyncStorage.getItem('workPlace');
      if(workPlace !== null) { setWorkPlace(JSON.parse(workPlace)) }

    } catch (error) { console.error(error); }
  }
  React.useEffect(() => { retrieveData(); }, []);


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* <Noticeboard color="green" /> */}

        <View style={styles.sectionContainer}>
          <Text style={styles.title}>Services</Text>

          <View style={styles.GridViewBlockStyle}>
            <TouchableOpacity onPress={() => navigation.navigate('MapScreen')} style={styles.GridViewBlockButton}>
              <FontAwesome5 name="motorcycle" size={40} color="#00A968" /><Text>Vehicle</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() =>alert("Comming Soon...")} style={styles.GridViewBlockButton}>
              <FontAwesome5 name="hamburger" size={40} color="#00BCD4" /><Text>Food</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => alert("Comming Soon...")} style={styles.GridViewBlockButton}>
              <FontAwesome5 name="truck-moving" size={40} color="#F53D3D" /><Text>Parcel</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.title}>Your Favourite Locations</Text>
          <TouchableOpacity onPress={() => navigation.navigate('locationPickerScreen', {name: "homePlace"})} style={styles.listItem}>
            <Feather name="home" size={25} color="#000" style={styles.leftIcon} />
            <View style={styles.listItemContent}>
              <Text style={styles.locationTitle}>Home</Text>
              <Text>{homePlace ? homePlace.secondary_text : "Set Location"}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('locationPickerScreen', {name: "workPlace"})} style={styles.listItem}>
            <Feather name="briefcase" size={25} color="#007bff" style={styles.leftIcon} />
            <View style={[styles.listItemContent, styles.listItemContentLast]}>
              <Text style={styles.locationTitle}>Work</Text>
              <Text>{workPlace ? workPlace.secondary_text : "Set Location"}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container:{
    flex: 1
  },
  sectionContainer: {
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    padding: 10,
    marginTop: 15
  },
  GridViewBlockStyle: {
    flexDirection: 'row',
    backgroundColor: '#fff',
  },
  GridViewBlockButton: {
    borderWidth: 2,
    borderColor: "#00A968",
    borderRadius: 5,
    fontSize: 14,
    backgroundColor: '#fff',
    elevation:10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    margin: 5,
    width: ((SCREEN_WIDTH-(15*Grid_Columns))/Grid_Columns),
    height: 90,
    flex: 1,
    justifyContent: 'center',
    alignItems: "center",
    fontFamily: Typography.PRIMARY_FONT_REGULAR
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: Typography.PRIMARY_FONT_BOLD,
    borderBottomColor: "#eee", 
    borderBottomWidth: 1,
    padding: 5,
    marginBottom: 10
  },
  listItem: {
    backgroundColor: "#fff",
    flexDirection: 'row',
    alignItems: 'center'
  },
  leftIcon: {
    backgroundColor: '#ddd',
    borderRadius: 50,
    width: 50,
    height: 50,
    lineHeight: 50,
    textAlign: 'center',
    marginRight: 20,
    marginLeft: 10
  },
  listItemContent: {
    borderBottomColor: "#eee", 
    borderBottomWidth: 1,
    paddingVertical: 10,
    width: '100%'
  },
  listItemContentLast: {
    borderBottomWidth: 0
  },
  locationTitle: {
    fontWeight: 'bold',
    fontFamily: Typography.PRIMARY_FONT_BOLD,
    fontSize: 16
  }
});