import React, { Component } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { connect } from 'react-redux';

import { getUsers, getUsersPending } from '../redux/actions/Users'

class Users extends Component {

  constructor() {
    super();
    this.state = {
      users: []
    }
  }

  componentDidMount() {
    this.props.dispatch(getUsersPending());
    axios.get('https://jsonplaceholder.typicode.com/users')
    .then(res => {
      const users = res.data;
      this.props.dispatch(getUsers(users))
    })
  }

  render() {
    return (
      <View style={{backgroundColor:'pink',flex:1}}>
        {
          this.props.users.isLoading === false ? null : 
          <Text style={{alignContent:'center',fontSize:20}}>Loading...</Text>
        }

        {
          this.props.users.data.map(user => (
            <Text style={{fontSize:20}}>{user.name}</Text>
          ))
        }


        <TouchableOpacity 
        onPress={()=>this.props.navigation.navigate('testing')}
        style={{margin:15,backgroundColor:'tomato',padding:10}}>
          <Text style={{fontSize:20,color:'#fff'}}>testing</Text>
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

export default connect(mapStateToProps)(Users);