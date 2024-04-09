import React, { Component } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, ActivityIndicator, Alert, Image, TextInput, SafeAreaView, ScrollView, Platform } from "react-native";
import {Picker} from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";

import { BASE_URL, SMS_API_URL } from '../config/api';
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
    this.getVehicleData();

    console.log(
      "mobile:"+ this.props.route.params.mobile +
      "division:"+ this.props.route.params.division_id +
      "district:"+ this.props.route.params.district_id +
      "branch:"+ this.props.route.params.branch_id +
      "vehicleType:"+ this.props.route.params.vehicleType
    );
  }

  getVehicleData = () => {
    // fetch('http://admin-panel.Uder.com/api/android/driver/divisions')
    // .then(response => response.json())
    // .then(json => {
    //   console.log("data: "+json);
    //   // this.setState({ manufacturers: json })
    // });

    
    // axios.get('http://admin-panel.Uder.com/api/android/driver/divisions')
    // .then(function (response) {
    //   console.log(response.data);
    //   this.setState({ manufacturers: response.data });
    // })
    // .catch( (error) =>  console.log(error) );

    const current_year = new Date().getFullYear();    
    const year_range = Array(current_year - (current_year - 20)).fill('').map((v, idx) => JSON.stringify(current_year - idx));
    this.setState({"years": year_range });

    this.setState({
      "manufacturers": [
        {"manufacturer_name":"Daihatsu",
          "models":[
            {"model_name":"Move"},
          ]
        },
        {"manufacturer_name":"Ford",
          "models":[
            {"model_name":"Fiesta"},
          ]
        },
        {"manufacturer_name":"Honda",
          "models":[
            {"model_name":"Accord"},
            {"model_name":"Airwave"},
            {"model_name":"City"},
            {"model_name":"Civic"},
            {"model_name":"Domani"}
          ]
        },
        {"manufacturer_name":"Hyundai",
          "models":[
            {"model_name":"Accent"},
            {"model_name":"Elantra"},
            {"model_name":"Sonata"},
          ]
        },
        {"manufacturer_name":"MarutiSuzuki",
          "models":[
            {"model_name":"Esteem"},
            {"model_name":"Wagon R"},
          ]
        },
        {"manufacturer_name":"Mazda",
          "models":[
            {"model_name":"Axela"},
          ]
        },
        {"manufacturer_name":"Mitsubishi",
          "models":[
            {"model_name":"Galant"},
            {"model_name":"Lancer"},
          ]
        },
        {"manufacturer_name":"Nissan",
          "models":[
            {"model_name":"Bluebird"},
            {"model_name":"Cedric"},
            {"model_name":"Cefiro"},
            {"model_name":"Presage"},
            {"model_name":"Primera"},
            {"model_name":"Sunny"},
            {"model_name":"Sylphy"},
            {"model_name":"Tiida"},
            {"model_name":"Versa"}
          ]
        },
        {"manufacturer_name":"Tata",
          "models":[
            {"model_name":"Indica"},
            {"model_name":"Indigo"},
          ]
        },
        {"manufacturer_name":"Toyota",
          "models":[
            {"model_name":"Camry"},
            {"model_name":"Corolla"},
            {"model_name":"Vios"},
            {"model_name":"Yaris"},
            {"model_name":"Premio"},
            {"model_name":"Allion"},
            {"model_name":"Noah"},
            {"model_name":"Avanza"},
            {"model_name":"Axio"},
            {"model_name":"AxioFielder"},
            {"model_name":"Carina"},
            {"model_name":"Ceres"},
            {"model_name":"Fun Cargo"},
            {"model_name":"Probox"},
            {"model_name":"Mark ||"},
            {"model_name":"Raum"},
            {"model_name":"Sprinter"},
            {"model_name":"Spacio"},
            {"model_name":"Hi-Ace"},
            {"model_name":"Succeed"},
            {"model_name":"Rumion"},
            {"model_name":"Corolla Runx"},
            {"model_name":"Platz"},
            {"model_name":"Fielder"},
          ]
        },
      ]
    });
  }

  changeManufacturer(value) {
		this.setState({selectedManufacturer: value});
		this.setState({models: this.state.manufacturers.find(manufacturer => manufacturer.manufacturer_name === value).models});
	}

	changeModel(value) {
		this.setState({selectedModel: value});
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
    let fields = this.state.selectedManufacturer && this.state.selectedModel && this.state.selectedYear && this.state.drivingLicence && this.state.vehicle_reg_number && this.state.vehicle_tax_token  && this.state.fitness_certificate;
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
      
      manufacturer: this.state.selectedManufacturer,
      model: this.state.selectedModel,
      year: this.state.selectedYear,
      driving_licence: this.state.drivingLicence,
      vehicle_reg_number: this.state.vehicle_reg_number,
      vehicle_tax_token: this.state.vehicle_tax_token,
     // tax_renewal_date: moment(this.state.tax_renewal_date).format('DD/MM/YYYY'),
      insurance_number: null,
      tax_renewal_date: null,
      //insurance_renewal_date: moment(this.state.insurance_renewal_date).format('DD/MM/YYYY'),
      insurance_renewal_date: null,
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
        } catch (error) { console.error(error); }
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
            <Text style={{textAlign: 'center', fontSize: 28, fontWeight: 'bold', color: '#DC2322'}}>Enter {(this.props.route.params.headerTitle).replace("Sign up for ", "")} information</Text>
            <Text style={{textAlign: 'center', fontSize: 16}}>You are at least 19 years old and have a vehicle from 1997 or later.</Text>
          </View>
          <View style={styles.dropdowWrap}>
            <Text style={styles.pickerLabel}>Manufacturer</Text>
            <Picker selectedValue={this.state.selectedManufacturer} style={styles.dropdow} mode="modal" onValueChange={(itemValue, itemIndex) => this.changeManufacturer(itemValue) }>
            <Picker.Item label="--Select a Manufacturer--" />
            {this.state.manufacturers.map( (item, index) => {
                return (<Picker.Item label={item.manufacturer_name} value={item.manufacturer_name} key={index}/>) 
            })}
            </Picker>
          </View>
          
          <View style={styles.dropdowWrap}>
            <Text style={styles.pickerLabel}>Model</Text>
            <Picker selectedValue={this.state.selectedModel} style={styles.dropdow} mode="modal" onValueChange={(itemValue, itemIndex) => this.changeModel(itemValue) }>
            <Picker.Item label="--Select a Model--" />
            {this.state.models.map( (item, index) => {
                return (<Picker.Item label={item.model_name} value={item.model_name} key={index} />) 
            })}
            </Picker>
          </View>
          
          <View style={styles.dropdowWrap}>
            <Text style={styles.pickerLabel}>Year</Text>
            <Picker selectedValue={this.state.selectedYear} style={styles.dropdow} mode="modal" onValueChange={(itemValue, itemIndex) => this.setState({selectedYear: itemValue})}>
            <Picker.Item label="--Select a year--" />
            {this.state.years.map( (item, index) => {
                return (<Picker.Item label={item} value={item} key={index} />) 
            })}
            </Picker>
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
          
          {/*<View style={styles.dropdowWrap}>*/}
          {/*  <Text style={styles.pickerLabel}>Token Renewal Date</Text>*/}
          {/*  <TextInput style={styles.textInput} placeholder="Enter Token Renewal Date" placeholderTextColor="rgba(0,0,0,.5)" returnKeyType="go" autoCorrect={false} onChangeText={val => this.setState({tax_renewal_date: val})} value={this.state.tax_renewal_date ? moment(this.state.tax_renewal_date).format('DD/MM/YYYY') : ""} onFocus={() => this.setState({tokenDatePickerShow: true})} ref={this.taxRenewalDateRef} onSubmitEditing={() => this.insuranceNumberRef.current.focus()} />*/}

          {/*  {this.state.tokenDatePickerShow === true && */}
          {/*    <DateTimePicker testID="dateTimePicker" timeZoneOffsetInMinutes={0} display="spinner" */}
          {/*    value={this.state.tokenDatePicker} mode="date" onChange={this.setTokenDateOnChange}*/}
          {/*    is24Hour={false} dateFormat={"dayofweek day month"} firstDayOfWeek="Saturday"*/}
          {/*    minimumDate={new Date().setFullYear(new Date().getFullYear()-3)} maximumDate={new Date().setFullYear(new Date().getFullYear()+5)}*/}
          {/*    />*/}
          {/*  }*/}
          {/*</View>*/}
          
          {/*<View style={styles.dropdowWrap}>*/}
          {/*  <Text style={styles.pickerLabel}>Insurance Number</Text>*/}
          {/*  <TextInput style={styles.textInput} placeholder="Enter Insurance Number" placeholderTextColor="rgba(0,0,0,.5)" returnKeyType="go" autoCorrect={false} onChangeText={val => this.setState({insurance_number: val})} value={this.state.insurance_number} ref={this.insuranceNumberRef} onSubmitEditing={() => this.insuranceRenewalDateRef.current.focus()} />*/}
          {/*</View>*/}
          
          {/*<View style={styles.dropdowWrap}>*/}
          {/*  <Text style={styles.pickerLabel}>Insurance Renewal Date</Text>*/}
          {/*  <TextInput style={styles.textInput} placeholder="Enter Insurance Renewal Date" placeholderTextColor="rgba(0,0,0,.5)" returnKeyType="go" autoCorrect={false} onChangeText={val => this.setState({insurance_renewal_date: val})} value={this.state.insurance_renewal_date ? moment(this.state.insurance_renewal_date).format('DD/MM/YYYY') : ""} onFocus={() => this.setState({insuranceDatePickerShow: true})} ref={this.insuranceRenewalDateRef} onSubmitEditing={() => this.fitnessCertificateRef.current.focus()} />*/}
          {/*  */}
          {/*  {this.state.insuranceDatePickerShow === true && */}
          {/*    <DateTimePicker testID="dateTimePicker" timeZoneOffsetInMinutes={0} display="spinner" */}
          {/*    value={this.state.insuranceDatePicker} mode="date" onChange={this.setInsuranceDateOnChange}*/}
          {/*    is24Hour={false} dateFormat={"dayofweek day month"} firstDayOfWeek="Saturday"*/}
          {/*    minimumDate={new Date().setFullYear(new Date().getFullYear()-3)} maximumDate={new Date().setFullYear(new Date().getFullYear()+5)}*/}
          {/*    />*/}
          {/*  }*/}
          {/*</View>*/}

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
