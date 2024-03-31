import React, { Component } from 'react';
import { View, Text, StyleSheet, TextInput, Image, ImageBackground, TouchableOpacity, Animated, Dimensions, Keyboard, Platform, CheckBox, Button } from 'react-native';

import { createNativeStackNavigator } from '@react-navigation/native-stack'; 
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import NoRecordIcon from '../components/noRecords';
import { Options } from '../config';
import TripsHistory from '../AdminScreen/MenuScreens/TripHistory';
import TripDetails from '../AdminScreen/MenuScreens/TripDetails';
import FoodHistory from '../AdminScreen/MenuScreens/FoodHistory';
import ParcelHistory from '../AdminScreen/MenuScreens/ParcelHistory';

const HistoryStack = createNativeStackNavigator();
export default function HistoryStackScreen() {
  return (
    <HistoryStack.Navigator screenOptions={Options.APP_OPTIONS.SCREEN_OPTIONS}>
      <HistoryStack.Screen name="createTopTabs" component={CreateTopTabs} options={{ title: "History", headerTintColor: '#fff', headerBackTitleVisible: false, headerRight: () => Options.APP_OPTIONS.HEADER_LOGO }} />
      <HistoryStack.Screen name="TripDetails" component={TripDetails} options={{ title: "Trip Details", headerBackTitleVisible: false,  headerRight: () => Options.APP_OPTIONS.HEADER_LOGO }} />
    </HistoryStack.Navigator>
  );
}

const MaterialTopTab = createMaterialTopTabNavigator();
function CreateTopTabs() {
  return(
      <MaterialTopTab.Navigator
          screenOptions={{
              tabBarLabelStyle: { fontSize: 12 }, // Moved inside screenOptions
              tabBarStyle: { backgroundColor: '#fff' }, // Moved inside screenOptions
              tabBarActiveTintColor: "#EF0C14", // Previously 'activeTintColor'
              tabBarIndicatorStyle: { backgroundColor: "#EF0C14" }, // Correctly applied as an object
              tabBarInactiveTintColor: "#31455A", // Previously 'inactiveTintColor'
          }}
      >
          <MaterialTopTab.Screen name="Trips" component={TripsHistory} />
          <MaterialTopTab.Screen name="Food" component={FoodHistory} />
          <MaterialTopTab.Screen name="Parcel" component={ParcelHistory} />
      </MaterialTopTab.Navigator>

  )
}