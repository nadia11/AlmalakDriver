import React, { Component } from 'react';
import { View, Text, StyleSheet, TextInput, Image, ImageBackground, TouchableOpacity, Animated, Dimensions, Keyboard, Platform, Button } from 'react-native';

import { createNativeStackNavigator } from '@react-navigation/native-stack'; 
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import NoRecordIcon from '../../components/noRecords';
import { Options } from '../../config';
import RecentTransactionData from './RecentTransactionData';

const HistoryStack = createNativeStackNavigator();
export default function HistoryStackScreen() {
  return (
    <HistoryStack.Navigator screenOptions={Options.APP_OPTIONS.SCREEN_OPTIONS}>
      <HistoryStack.Screen name="createTopTabs" component={CreateTopTabs} options={{ title: "History", headerTintColor: '#fff', headerBackTitleVisible: false, headerRight: () => Options.APP_OPTIONS.HEADER_LOGO }} />
    </HistoryStack.Navigator>
  );
}

const MaterialTopTab = createMaterialTopTabNavigator();
function CreateTopTabs() {
  return(
      <MaterialTopTab.Navigator
          screenOptions={{
              tabBarLabelStyle: { fontSize: 12 }, // Moved into screenOptions
              tabBarStyle: { backgroundColor: '#fff' }, // Moved into screenOptions
              tabBarActiveTintColor: "#EF0C14", // Previously 'activeTintColor'
              tabBarIndicatorStyle: { backgroundColor: "#EF0C14" }, // Now correctly as an object
              tabBarInactiveTintColor: "#31455A", // Previously 'inactiveTintColor'
          }}
      >
          <MaterialTopTab.Screen name="ALL" component={AllTransactionTab} />
          <MaterialTopTab.Screen name="DEBIT" component={DebitTransactionTab} />
          <MaterialTopTab.Screen name="CREDIT" component={CreditTransactionTab} />
      </MaterialTopTab.Navigator>

  )
}

function AllTransactionTab(props) {
  return <RecentTransactionData {...props} tabType="All" />;
}

function DebitTransactionTab(props) {
  return <RecentTransactionData {...props} tabType="paid" />;
  //Debit
}

function CreditTransactionTab(props) {
  return <RecentTransactionData {...props} tabType="unpaid" />;
  //Credit
}


