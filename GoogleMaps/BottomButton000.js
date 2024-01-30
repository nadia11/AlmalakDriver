import React, { Component } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from "react-native";
import PropTypes from "prop-types";
import { Colors } from '../styles';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

export default class BottomButton extends Component {
  render() {
    return (
      <View style={styles.container}>

        <TouchableOpacity onPress={() => this.props.onPressFunction()} style={styles.bottomButton}>
          <View>
            <Text style={styles.bottomButtonText}>{this.props.buttonText}</Text>
            {this.props.children}
          </View>
        </TouchableOpacity>
      </View>
    );
  }
}

BottomButton.propTypes = {
  onPressFunction: PropTypes.func.isRequired,
  buttonText: PropTypes.string.isRequired
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: SCREEN_WIDTH,
    paddingHorizontal: 15
  },
  bottomButton: {
    alignSelf: "center",
    backgroundColor: Colors.BUTTON_COLOR,
    marginTop: 20,
    width: SCREEN_WIDTH,

    padding: 15,
    paddingLeft: 30,
    paddingRight: 30,
  },
  bottomButtonText : {
    fontSize: 20,
    color: "#fff", 
    textAlign: 'center'
  },
});
