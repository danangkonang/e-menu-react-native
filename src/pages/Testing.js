import React, { Component } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { connect } from 'react-redux';

import { getUsers, getUsersPending } from '../redux/actions/Users'

class Testing extends Component {

  constructor() {
    super();
    this.state = {
      users: []
    }
  }

  render() {
    return (
      <View style={{backgroundColor:'tomato',flex:1}}>
        {/* {
          this.props.users.isLoading === false ? null : 
          <Text style={{alignContent:'center',fontSize:20}}>Loading...</Text>
        } */}

        {
          this.props.users.data.map(user => (
            <Text style={{fontSize:20}}>{user.name}</Text>
          ))
        }


        <TouchableOpacity 
        onPress={()=>this.props.navigation.navigate('home')}
        style={{margin:15,backgroundColor:'pink',padding:10}}>
          <Text style={{fontSize:20,color:'#515151'}}>home</Text>
        </TouchableOpacity>
      </View>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    users: state.users
  }
}

export default connect(mapStateToProps)(Testing);