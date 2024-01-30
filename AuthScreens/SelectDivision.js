import React, { Component } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, ActivityIndicator, Alert, Image } from "react-native";
import {Picker} from '@react-native-community/picker';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

export default class SelectDivision extends Component{
 constructor(props) {
    super(props);
    this.state={
      divisions: [],
			districts: [],
			branches: [],
			selectedDivision: '',
			selectedDistrict: '',
			selectedBranch: ''
    };
  }

  componentDidMount() {
    this.getDivisionData();
  }

  getDivisionData = () => {
    // fetch('http://admin-panel.Uder.com/api/android/driver/divisions')
    // .then(response => response.json())
    // .then(json => {
    //   console.log("data: "+json);
    //   this.setState({ divisions: json })
    // });

    this.setState({
      "divisions": [
        {"division_id":1,"division_name":"Barishal","districts":[{"district_id":1,"district_name":"Barguna"},{"district_id":2,"district_name":"Barishal"},{"district_id":3,"district_name":"Bhola"},{"district_id":4,"district_name":"Jhalokati"},{"district_id":5,"district_name":"Patuakhali"},{"district_id":6,"district_name":"Pirojpur"}],"branches":[{"branch_id":1,"branch_name":"Barguna"},{"branch_id":2,"branch_name":"Barishal"},{"branch_id":3,"branch_name":"Bhola"},{"branch_id":4,"branch_name":"Jhalokati"},{"branch_id":5,"branch_name":"Patuakhali"},{"branch_id":6,"branch_name":"Pirojpur"}]},{"division_id":2,"division_name":"Chattogram","districts":[{"district_id":7,"district_name":"Bandarban"},{"district_id":8,"district_name":"Brahmanbaria"},{"district_id":9,"district_name":"Chandpur"},{"district_id":10,"district_name":"Chattogram"},{"district_id":11,"district_name":"Coxs Bazar"},{"district_id":12,"district_name":"Cumilla"},{"district_id":13,"district_name":"Feni"},{"district_id":14,"district_name":"Khagrachhari"},{"district_id":15,"district_name":"Lakshmipur"},{"district_id":16,"district_name":"Noakhali"},{"district_id":17,"district_name":"Rangamati"}],"branches":[{"branch_id":7,"branch_name":"Bandarban"},{"branch_id":8,"branch_name":"Brahmanbaria"},{"branch_id":9,"branch_name":"Chandpur"},{"branch_id":10,"branch_name":"Chattogram"},{"branch_id":11,"branch_name":"Coxs Bazar"},{"branch_id":12,"branch_name":"Cumilla"},{"branch_id":13,"branch_name":"Feni"},{"branch_id":14,"branch_name":"Khagrachhari"},{"branch_id":15,"branch_name":"Lakshmipur"},{"branch_id":16,"branch_name":"Noakhali"},{"branch_id":17,"branch_name":"Rangamati"}]},{"division_id":3,"division_name":"Dhaka","districts":[{"district_id":18,"district_name":"Dhaka"},{"district_id":19,"district_name":"Faridpur"},{"district_id":20,"district_name":"Gazipur"},{"district_id":21,"district_name":"Gopalganj"},{"district_id":23,"district_name":"Madaripur"},{"district_id":24,"district_name":"Manikganj"},{"district_id":25,"district_name":"Munshiganj"},{"district_id":26,"district_name":"Narayanganj"},{"district_id":27,"district_name":"Narsingdi"},{"district_id":28,"district_name":"Rajbari"},{"district_id":29,"district_name":"Shariatpur"},{"district_id":30,"district_name":"Tangail"}],"branches":[{"branch_id":18,"branch_name":"Dhaka"},{"branch_id":19,"branch_name":"Faridpur"},{"branch_id":20,"branch_name":"Gazipur"},{"branch_id":21,"branch_name":"Gopalganj"},{"branch_id":23,"branch_name":"Madaripur"},{"branch_id":24,"branch_name":"Manikganj"},{"branch_id":25,"branch_name":"Munshiganj"},{"branch_id":26,"branch_name":"Narayanganj"},{"branch_id":27,"branch_name":"Narsingdi"},{"branch_id":28,"branch_name":"Rajbari"},{"branch_id":29,"branch_name":"Shariatpur"},{"branch_id":30,"branch_name":"Tangail"}]},{"division_id":4,"division_name":"Khulna","districts":[{"district_id":31,"district_name":"Bagerhat"},{"district_id":32,"district_name":"Chuadanga"},{"district_id":33,"district_name":"Jashore"},{"district_id":34,"district_name":"Jhenaidah"},{"district_id":35,"district_name":"Khulna"},{"district_id":36,"district_name":"Kushtia"},{"district_id":37,"district_name":"Magura"},{"district_id":38,"district_name":"Meherpur"},{"district_id":39,"district_name":"Narail"},{"district_id":40,"district_name":"Satkhira"}],"branches":[{"branch_id":31,"branch_name":"Bagerhat"},{"branch_id":32,"branch_name":"Chuadanga"},{"branch_id":33,"branch_name":"Jashore"},{"branch_id":34,"branch_name":"Jhenaidah"},{"branch_id":35,"branch_name":"Khulna"},{"branch_id":36,"branch_name":"Kushtia"},{"branch_id":37,"branch_name":"Magura"},{"branch_id":38,"branch_name":"Meherpur"},{"branch_id":39,"branch_name":"Narail"},{"branch_id":40,"branch_name":"Satkhira"}]},{"division_id":5,"division_name":"Mymensingh","districts":[{"district_id":22,"district_name":"Kishoreganj"},{"district_id":41,"district_name":"Jamalpur"},{"district_id":42,"district_name":"Mymensingh"},{"district_id":43,"district_name":"Netrakona"},{"district_id":44,"district_name":"Sherpur"}],"branches":[{"branch_id":22,"branch_name":"Kishoreganj"},{"branch_id":41,"branch_name":"Jamalpur"},{"branch_id":42,"branch_name":"Mymensingh"},{"branch_id":43,"branch_name":"Netrakona"},{"branch_id":44,"branch_name":"Sherpur"}]},{"division_id":6,"division_name":"Rajshahi","districts":[{"district_id":45,"district_name":"Bogura"},{"district_id":46,"district_name":"Chapai Nawabganj"},{"district_id":47,"district_name":"Joypurhat"},{"district_id":48,"district_name":"Naogaon"},{"district_id":49,"district_name":"Natore"},{"district_id":50,"district_name":"Pabna"},{"district_id":51,"district_name":"Rajshahi"},{"district_id":52,"district_name":"Sirajganj"}],"branches":[{"branch_id":45,"branch_name":"Bogura"},{"branch_id":46,"branch_name":"Chapai Nawabganj"},{"branch_id":47,"branch_name":"Joypurhat"},{"branch_id":48,"branch_name":"Naogaon"},{"branch_id":49,"branch_name":"Natore"},{"branch_id":50,"branch_name":"Pabna"},{"branch_id":51,"branch_name":"Rajshahi"},{"branch_id":52,"branch_name":"Sirajganj"}]},{"division_id":7,"division_name":"Rangpur","districts":[{"district_id":53,"district_name":"Dinajpur"},{"district_id":54,"district_name":"Gaibandha"},{"district_id":55,"district_name":"Kurigram"},{"district_id":56,"district_name":"Lalmonirhat"},{"district_id":57,"district_name":"Nilphamari"},{"district_id":58,"district_name":"Panchagarh"},{"district_id":59,"district_name":"Rangpur"},{"district_id":60,"district_name":"Thakurgaon"}],"branches":[{"branch_id":53,"branch_name":"Dinajpur"},{"branch_id":54,"branch_name":"Gaibandha"},{"branch_id":55,"branch_name":"Kurigram"},{"branch_id":56,"branch_name":"Lalmonirhat"},{"branch_id":57,"branch_name":"Nilphamari"},{"branch_id":58,"branch_name":"Panchagarh"},{"branch_id":59,"branch_name":"Rangpur"},{"branch_id":60,"branch_name":"Thakurgaon"}]},{"division_id":8,"division_name":"Sylhet","districts":[{"district_id":61,"district_name":"Habiganj"},{"district_id":62,"district_name":"Moulvibazar"},{"district_id":63,"district_name":"Sunamganj"},{"district_id":64,"district_name":"Sylhet"}],"branches":[{"branch_id":61,"branch_name":"Habiganj"},{"branch_id":62,"branch_name":"Moulvibazar"},{"branch_id":63,"branch_name":"Sunamganj"},{"branch_id":64,"branch_name":"Sylhet"}]}
      ]
    });
  }

  changeDivision(value) {
		this.setState({selectedDivision: value});
		this.setState({districts: this.state.divisions.find(division => division.division_id === value).districts});
    this.setState({branches: this.state.divisions.find(division => division.division_id === value).branches});
	}

	changeDistrict(value) {
		this.setState({selectedDistrict: value});
    this.setState({selectedBranch: value});

    //nested branches from under districts array
		//const districts = this.state.divisions.find(division => division.division_name === this.state.selectedDivision).districts;
		//this.setState({branches: districts.find(district => district.district_name === value).branches});
	}

	changeBranch(value) {
		this.setState({selectedBranch: value});
  }
  
  disabledBtn() {
    let fields = this.state.selectedDivision && this.state.selectedDistrict && this.state.selectedBranch;
    return fields !== '' ? 0 : 1;
  }

  handleSubmit = () => {
    this.props.navigation.navigate('SelectVehicle', {
      division_id: this.state.selectedDivision,
      district_id: this.state.selectedDistrict,
      branch_id: this.state.selectedBranch,
      mobile: this.props.route.params.mobile,
    });
    //console.log("mobile: "+this.props.route.params.mobile);
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={{marginBottom: 25, padding: 15}}>
          <Text style={{textAlign: 'center', fontSize: 30, fontWeight: 'bold', color: '#DC2322'}}>Sign up to driver</Text>
          <Text style={{textAlign: 'center', fontSize: 16}}>After completion sign up, you can earn money by your vehicle.</Text>
        </View>
        <View style={styles.dropdowWrap}>
          <Text style={styles.pickerLabel}>Divisions</Text>
          <Picker selectedValue={this.state.selectedDivision} style={styles.dropdow} mode="modal" onValueChange={(itemValue, itemIndex) => this.changeDivision(itemValue) }>
          <Picker.Item label="--Choose a Divisions--" value="" key="" />
          {this.state.divisions.map( (item, index) => {
              return (<Picker.Item label={item.division_name} value={item.division_id} key={index}/>) 
          })}
          </Picker>
        </View>
        
        <View style={styles.dropdowWrap}>
          <Text style={styles.pickerLabel}>District</Text>
          <Picker selectedValue={this.state.selectedDistrict} style={styles.dropdow} mode="modal" onValueChange={(itemValue, itemIndex) => this.changeDistrict(itemValue) }>
            <Picker.Item label="--Choose a District--" value="" key="" />
            {this.state.districts.map( (item, index) => {
                return (<Picker.Item label={item.district_name} value={item.district_id} key={index} />) 
            })}
          </Picker>
        </View>
        
        <View style={styles.dropdowWrap}>
          <Text style={styles.pickerLabel}>Branch</Text>
          <Picker selectedValue={this.state.selectedBranch} style={styles.dropdow} mode="modal" onValueChange={(itemValue, itemIndex) => this.changeBranch(itemValue) }>
          <Picker.Item label="--Choose a Branch--" value="" key="" />
          {this.state.branches.map( (item, index) => {
              return (<Picker.Item label={item.branch_name} value={item.branch_id} key={index} />) 
          })}
          </Picker>
        </View>

        <TouchableOpacity style={[styles.button, { opacity: (this.disabledBtn() == 1 ? 0.7 : 1) }]} onPress={this.handleSubmit} disabled={this.disabledBtn() == 1 ? true : false}>
          <Text style={styles.btnText}>Continue sign up</Text>
        </TouchableOpacity>
      </View>
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
    borderColor: 'red',
    backgroundColor: '#eee',
    elevation: 3,
    shadowColor: '#eee',
    shadowOpacity: 0.5,
    shadowOffset: { height: 0, width: 0},
    shadowRadius: 3,
    borderRadius: 5,
    paddingLeft: 20
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
