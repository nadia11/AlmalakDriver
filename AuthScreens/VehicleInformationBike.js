import React, { Component } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, ActivityIndicator, Alert, TextInput, SafeAreaView, ScrollView, Platform } from "react-native";
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";

import { BASE_URL, SMS_API_URL } from '../config/api';
// import { Colors } from '../../styles';
const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;



export default class VehicleInformation extends Component{
  constructor(props) {
    super(props);
    this.state={
      isLoading: false,
      animating: false,
      
			manufacturers: [],
			models: [],
			years: [],
			selectedManufacturer: '',
			selectedModel: '',
			selectedYear: '',
      drivingLicence: '',
      vehicle_reg_number: '',
      vehicle_tax_token: '',
      tax_renewal_date: '',
      insurance_number: '',
      insurance_renewal_date: '',
      fitness_certificate: '',
      
      tokenDatePicker: new Date(),
      tokenDatePickerShow: '',
      insuranceDatePicker: new Date(),
      insuranceDatePickerShow: '',
    };

    this.drivingLicenceRef = React.createRef();
    this.regNumberRef = React.createRef();
    this.taxTokenRef = React.createRef();
    this.taxRenewalDateRef = React.createRef();
    this.insuranceNumberRef = React.createRef();
    this.insuranceRenewalDateRef = React.createRef();
    this.fitnessCertificateRef = React.createRef();
  }

  componentDidMount() {
    console.log(
      "mobile:"+ this.props.route.params.mobile +
      "division:"+ this.props.route.params.division_id +
      "district:"+ this.props.route.params.district_id +
      "branch:"+ this.props.route.params.branch_id +
      "vehicleType:"+ this.props.route.params.vehicleType
    );
  }

  setTokenDateOnChange = (event, selectedDate) => {
    const currentDate = selectedDate || this.state.tokenDatePicker;
    this.setState({ tokenDatePickerShow: Platform.OS === 'ios' ? true : false});
    
    if(event.type == "set") {
      this.setState({ tokenDatePicker: currentDate });
      this.setState({ tax_renewal_date: currentDate });
    } else {
      console.log("cancel button clicked");
    }
  };

  setInsuranceDateOnChange = (event, selectedDate) => {
    const currentDate = selectedDate || this.state.tokenDatePicker;
    this.setState({ insuranceDatePickerShow: Platform.OS === 'ios' ? true : false});
    
    if(event.type == "set") {
      this.setState({ insuranceDatePicker: currentDate });
      this.setState({ insurance_renewal_date: currentDate });
    } else {
      console.log("cancel button clicked");
    }
  };

  disabledBtn() {
    let fields = this.state.drivingLicence && this.state.vehicle_reg_number && this.state.vehicle_tax_token && this.state.tax_renewal_date && this.state.insurance_number && this.state.insurance_renewal_date && this.state.fitness_certificate;
    return fields !== '' ? 0 : 1;
  }

  handleSubmit = async () => {
    this.setState({ animating: true });
    //console.log("division_id: "+this.props.route.params.division_id +"district_id: "+ this.props.route.params.district_id +"branch_id: "+ this.props.route.params.branch_id +"vehicleType: "+ this.props.route.params.vehicleType +"mobile: "+ this.props.route.params.mobile + this.state.drivingLicence + this.state.vehicle_reg_number + this.state.vehicle_tax_token + moment(this.state.tax_renewal_date).format('DD/MM/YYYY') + this.state.insurance_number + moment(this.state.insurance_renewal_date).format('DD/MM/YYYY') + this.state.fitness_certificate);

    await axios.post(BASE_URL+'/submit-driver-partial-form', {
      division_id: this.props.route.params.division_id,
      district_id: this.props.route.params.district_id,
      branch_id: this.props.route.params.branch_id,
      vehicle_type_id: this.props.route.params.vehicleType,
      mobile: this.props.route.params.mobile,
      
      driving_licence: this.state.drivingLicence,
      vehicle_reg_number: this.state.vehicle_reg_number,
      vehicle_tax_token: this.state.vehicle_tax_token,
      tax_renewal_date: moment(this.state.tax_renewal_date).format('DD/MM/YYYY'),
      insurance_number: this.state.insurance_number,
      insurance_renewal_date: moment(this.state.insurance_renewal_date).format('DD/MM/YYYY'),
      fitness_certificate: this.state.fitness_certificate
    })
    .then(async response => {
      if(response.data.code === 200){
        //console.log("Response Message: "+response.data.code +" - "+response.data.message);
        try {
          await AsyncStorage.setItem('profileStatus', "incomplete");
          await AsyncStorage.setItem('mobile', this.props.route.params.mobile);

          this.setState({ animating: false });
          this.props.navigation.navigate('SignUpForm');
        } 
        catch (error) { console.error(error); }
      }
      else if(response.data.code === 501){
        this.setState({ animating: false });
        this.props.navigation.navigate('SignUpForm');
      }
    })
    .catch((error) => console.warn("Submitting Error: "+error));
  }
  

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.footerScroll} contentContainerStyle={{flexGrow: 1, paddingBottom: 40}}>
          <View style={{marginBottom: 30}}>
            <Text style={{textAlign: 'center', fontSize: 28, fontWeight: 'bold', color: '#DC2322'}}>Enter Bike information</Text>
            <Text style={{textAlign: 'center', fontSize: 16}}>You are at least 19 years old and have a vehicle from 1997 or later.</Text>
          </View>
                    
          <View style={styles.dropdowWrap}>
            <Text style={styles.pickerLabel}>Driving Licence Number</Text>
            <TextInput style={styles.textInput} placeholder="Enter Driving Licence Number" placeholderTextColor="rgba(0,0,0,.5)" returnKeyType="go" autoCorrect={false} onChangeText={val => this.setState({drivingLicence: val})} value={this.state.drivingLicence} maxLength={15} onSubmitEditing={() => this.regNumberRef.current.focus()} />
          </View>
          
          <View style={styles.dropdowWrap}>
            <Text style={styles.pickerLabel}>Vehicle Reg. Number</Text>
            <TextInput style={styles.textInput} placeholder="Enter Vehicle Reg. Number" placeholderTextColor="rgba(0,0,0,.5)" returnKeyType="go" autoCorrect={false} onChangeText={val => this.setState({vehicle_reg_number: val})} value={this.state.vehicle_reg_number} ref={this.regNumberRef} onSubmitEditing={() => this.taxTokenRef.current.focus()} />
          </View>
          
          <View style={styles.dropdowWrap}>
            <Text style={styles.pickerLabel}>Tax Token Number</Text>
            <TextInput style={styles.textInput} placeholder="Enter Tax Token Number" placeholderTextColor="rgba(0,0,0,.5)" returnKeyType="go" autoCorrect={false} onChangeText={val => this.setState({vehicle_tax_token: val})} value={this.state.vehicle_tax_token} ref={this.taxTokenRef} onSubmitEditing={() => this.taxRenewalDateRef.current.focus()} />
          </View>
          
          <View style={styles.dropdowWrap}>
            <Text style={styles.pickerLabel}>Token Renewal Date</Text>
            <TextInput style={styles.textInput} placeholder="Enter Token Renewal Date" placeholderTextColor="rgba(0,0,0,.5)" returnKeyType="go" autoCorrect={false} onChangeText={val => this.setState({tax_renewal_date: val})} value={this.state.tax_renewal_date ? moment(this.state.tax_renewal_date).format('DD/MM/YYYY') : ""} onFocus={() => this.setState({tokenDatePickerShow: true})} ref={this.taxRenewalDateRef} onSubmitEditing={() => this.insuranceNumberRef.current.focus()} />

            {this.state.tokenDatePickerShow === true && 
              <DateTimePicker testID="dateTimePicker" timeZoneOffsetInMinutes={0} display="spinner" 
              value={this.state.tokenDatePicker} mode="date" onChange={this.setTokenDateOnChange}
              is24Hour={false} dateFormat={"dayofweek day month"} firstDayOfWeek="Saturday"
              minimumDate={new Date().setFullYear(new Date().getFullYear()-3)} maximumDate={new Date().setFullYear(new Date().getFullYear()+5)}
              />
            }
          </View>
          
          <View style={styles.dropdowWrap}>
            <Text style={styles.pickerLabel}>Insurance Number</Text>
            <TextInput style={styles.textInput} placeholder="Enter Insurance Number" placeholderTextColor="rgba(0,0,0,.5)" returnKeyType="go" autoCorrect={false} onChangeText={val => this.setState({insurance_number: val})} value={this.state.insurance_number} ref={this.insuranceNumberRef} onSubmitEditing={() => this.insuranceRenewalDateRef.current.focus()} />
          </View>
          
          <View style={styles.dropdowWrap}>
            <Text style={styles.pickerLabel}>Insurance Renewal Date</Text>
            <TextInput style={styles.textInput} placeholder="Enter Insurance Renewal Date" placeholderTextColor="rgba(0,0,0,.5)" returnKeyType="go" autoCorrect={false} onChangeText={val => this.setState({insurance_renewal_date: val})} value={this.state.insurance_renewal_date ? moment(this.state.insurance_renewal_date).format('DD/MM/YYYY') : ""} onFocus={() => this.setState({insuranceDatePickerShow: true})} ref={this.insuranceRenewalDateRef} onSubmitEditing={() => this.fitnessCertificateRef.current.focus()} />
            
            {this.state.insuranceDatePickerShow === true && 
              <DateTimePicker testID="dateTimePicker" timeZoneOffsetInMinutes={0} display="spinner" 
              value={this.state.insuranceDatePicker} mode="date" onChange={this.setInsuranceDateOnChange}
              is24Hour={false} dateFormat={"dayofweek day month"} firstDayOfWeek="Saturday"
              minimumDate={new Date().setFullYear(new Date().getFullYear()-3)} maximumDate={new Date().setFullYear(new Date().getFullYear()+5)}
              />
            }
          </View>

          <View style={styles.dropdowWrap}>
            <Text style={styles.pickerLabel}>Fitness Certificate</Text>
            <TextInput style={styles.textInput} placeholder="Enter Fitness Certificate" placeholderTextColor="rgba(0,0,0,.5)" returnKeyType="go" autoCorrect={false} onChangeText={val => this.setState({fitness_certificate: val})} value={this.state.fitness_certificate} ref={this.fitnessCertificateRef} />
          </View>
        </ScrollView>
        
        <TouchableOpacity style={[styles.button, { opacity: (this.disabledBtn() == 1 ? 0.7 : 1) }]} onPress={this.handleSubmit} disabled={this.disabledBtn() == 1 ? true : false}>
            <Text style={styles.btnText}>{this.state.animating === false ? "Continue Sign Up" : "Submitting Partial Data"}</Text>
            <ActivityIndicator animating={this.state.animating} color='#fff' size="large" style={{ position: "absolute", right: 70, top: 2}} />
        </TouchableOpacity>
    </SafeAreaView>
    );
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 20
  },
  footerScroll: {
      width: SCREEN_WIDTH,
      backgroundColor: '#fff',
      paddingHorizontal: 20,
      paddingVertical: 10,
      marginBottom: 100,
  },
  dropdowWrap: {
    marginBottom: 30,
    justifyContent: 'flex-start',
    alignItems: 'flex-start'
  },
  pickerLabel: {
    fontSize: 18,
    marginBottom: 5,
    fontWeight: 'bold'
  },
  dropdow: {
    height: 50,
    width: SCREEN_WIDTH-40,
    borderWidth: 3,
    borderColor: '#eee',
    backgroundColor: '#eee',
    elevation: 3,
    shadowColor: '#eee',
    shadowOpacity: 0.5,
    shadowOffset: { height: 0, width: 0},
    shadowRadius: 3,
    borderRadius: 5
  },
  textInput: {
    fontSize: 18,
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    width: SCREEN_WIDTH-40,
    backgroundColor: '#fff',
    borderRadius: 5,
    paddingHorizontal: 15,
    paddingVertical: 5,
    elevation: 2,
    shadowColor: '#eee',
    shadowOpacity: 0.5,
    shadowOffset: { height: 0, width: 0},
    shadowRadius: 3
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
