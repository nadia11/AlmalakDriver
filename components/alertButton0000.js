import React, { Component } from 'react';
import { Alert, Button, View, StyleSheet } from 'react-native';


export default class AlertButton extends Component {
  
  openAlert=()=>{
    alert('Alert with one button');
  }
  
  openTwoButtonAlert=()=>{
    Alert.alert(
      'Hey There!',
      'Two button alert dialog',
      [
        {text: 'Yes', onPress: () => console.log('Yes button clicked')},
        {text: 'No', onPress: () => console.log('No button clicked'), style: 'cancel'},
      ],
      { 
        cancelable: true 
      }
    );
  }
  
  openThreeButtonAlert=()=>{
    Alert.alert(
      'Hey There!', 'Three button alert dialog',
      [
        {text: 'Ask me later', onPress: () => console.log('Later button clicked')},
        {text: 'Yes', onPress: () => console.log('Yes button is clicked')},
        {text: 'OK', onPress: () => console.log('OK button clicked')},
      ],
      { 
        cancelable: false 
      }
    );
  }

  render() {
    return (
      <View style={styles.mainWrapper}>
        <Button title='1 button alert' onPress={this.openAlert}/>

        <Button title='2 buttons alert' onPress={this.openTwoButtonAlert}/>

        <Button title='3 buttons alert' onPress={this.openThreeButtonAlert}/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection:'row',
  }
});