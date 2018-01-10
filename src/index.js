
/*global google*/
import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import {getLocation} from './request'
import {getDistance} from './request'
import Button from 'material-ui/Button';
import Divider from 'material-ui/Divider';
import Grid from 'material-ui/Grid';

class Header extends Component {
  constructor() {
    super()
    this.state = { 
      origin: '', 
      destination: '',
      originIp: '',
      destinationIp:'',
      travelTime:'',
      hasResult: false,
    }
    this.handleClickOnButton = this.handleClickOnButton.bind(this);
    this.getDistanceCallBack = this.getDistanceCallBack.bind(this);
  }
  componentDidMount () {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    document.getElementsByTagName('head')[0].appendChild(script);
  }
  handleClickOnButton(e) {
    if (this.state.hasResult) {
      this.setState({
        origin: '', 
        destination: '',
        originIp: '',
        destinationIp:'',
        travelTime:'',
        hasResult: false,
      });
      return;
    };
    var originLocation = getLocation(this.state.originIp)
    var geocoder = new google.maps.Geocoder();
    var originLatLong = new Promise((resolve, reject) => {
    originLocation.then(
      response => {
        if (response.data.getLocation === null){
          reject("Can't find location for the given ip address!");
          return;
        }
        var location = response.data.getLocation.location;
        geocoder.geocode({'location': {lat: parseFloat(location.latitude), lng: parseFloat(location.longitude)}}, (results, status) => {
          if (status === 'OK') {
            if (results[0]) {
              var origAddress = results[0].formatted_address;
              this.setState({origin: origAddress});              
              resolve(location);
            }
          }
        });
      }
    );
    });

    var destinationLocation = getLocation(this.state.destinationIp);
    var destinationLatLong = new Promise((resolve, reject) => {
    destinationLocation.then(
      response => {
        if (response.data.getLocation === null) {
          reject("Can't find location for the given ip address!");
          return;
        }
        var location = response.data.getLocation.location;
        geocoder.geocode({'location': {lat: parseFloat(location.latitude), lng: parseFloat(location.longitude)}}, (results, status) => {
          if (status === 'OK') {
            if (results[0]) {
              var destAddress = results[0].formatted_address;
              this.setState({destination: destAddress});
              resolve(location);
            }
          }
        });
      }
    );
    });

    Promise.all([originLatLong, destinationLatLong]).then(
      values => {
        if (this.state.destination !== '' && this.state.origin !== '') {
          this.setState({hasResult: true});
        }
        console.log("orig, dest: ", values[0], values[1]);
        getDistance(values[0], values[1], this.getDistanceCallBack);
      }
    ).catch( err =>{
        alert(err);
      });
  }


  getDistanceCallBack(response, status) {
    if (status === 'OK') {
      var result = response.rows[0].elements[0];
      if ('duration' in result){
        var travelTime = result.duration.text;
        console.log('travelTime', travelTime);
        this.setState({
          travelTime: travelTime
        });
      return;
      }
    }
    alert("Can't calculate duration between origin and destination!");
  }

  handleOriginChange(e) {
    this.setState({
      originIp: e.target.value
    })
  }
  handleDestinationChange(e) {
    this.setState({
      destinationIp: e.target.value
    })
  }

  render () {
    return(
    <div>
      <div className = 'wrapper'>
      <Grid container spacing={24}>
      <Grid item xs={1} sm={2}></Grid>
      <Grid item xs = {7} sm = {8}>
        <div className='title-field'>
        <h1>How long is the drive?</h1>
        </div>
        <Divider />
      </Grid>

      <Grid item xs={7} sm= {6} xl={12}>
        <p> Origin:</p>
        {this.state.hasResult?
          <div>
            <div className = 'address-field'>
              {this.state.origin.substring(0,this.state.origin.indexOf(', '))}
              <br/>
              {this.state.origin.substring(this.state.origin.indexOf(', ') + 1)}
            </div>
            <div className = 'address-field'>
              {this.state.destination.split(',', 1)[1]}
            </div>
          </div>
        :
          <div className = 'text-field'>
            <input 
              value = {this.state.originIp}
              onChange = {this.handleOriginChange.bind(this)} 
            />
          </div> 
        }
        </Grid>
        <Grid item xs={7} sm= {6}>
          <p> Destination:</p>
          {this.state.hasResult?
            <div>
              <div className = 'address-field'>
                {this.state.destination.substring(0,this.state.destination.indexOf(', '))}
                <br/>
                {this.state.destination.substring(this.state.destination.indexOf(', ') + 1)}
              </div>
              <div className = 'address-field'>
                {this.state.destination.split(',', 1)[1]}
              </div>
            </div>
          :
            <div className = 'text-field'>
              <input 
                value = {this.state.destinationIp}
                onChange = {this.handleDestinationChange.bind(this)} 
              />
            </div> 
          }
        </Grid>
      </Grid>
      </div>
      {this.state.travelTime?
        <Grid container spacing={24}>
        <Grid item xs={4} sm={5}></Grid>
        <Grid item xs = {5} sm = {2}>
          <h1 className='title-traveltime'>{this.state.travelTime}</h1>
        </Grid>
        </Grid>
      :
        <div className = 'submit-button' >
          <Button raised color="primary"  onClick = {this.handleClickOnButton.bind(this)}>
          {this.state.hasResult?"Try Again": "Gimme the Distance"} 
          </Button>
        </div>
      }
    </div>      
    );
  }
}

ReactDOM.render(
  <Header />, document.getElementById('root')
)
