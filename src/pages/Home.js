import React, { Component } from 'react'
import {
   View,
   Text,
   TouchableOpacity,
   TextInput,
   AsyncStorage
} from 'react-native'
import axios from 'axios'

export default class Home extends Component {
   constructor(props){
      super(props)
      this.state={
         tableNumber:''
     }
   }

   componentWillMount(){
      AsyncStorage.getItem('tableNumber', (error, result) => {
         if (result) {
            if(result !== null){
               this.props.navigation.navigate('menu')
            }
            this.setState({
               tableNumber: result
            })
         }
      })

   }

   order = () => {
      axios({
          method: 'post',
          url: 'https://restourant-menu-api.herokuapp.com/transaction',
          data:{
            tableNumber:this.state.tableNumber
          }
      }).then((response)=>{
         AsyncStorage.setItem('transactionId', response.data.id.toString())
         AsyncStorage.setItem('tableNumber', response.data.tableNumber)
         this.props.navigation.navigate('menu')
         // console.log(response)
         // console.log(response.data.id)
      })
  }

   render() {
      return (
         <View style={{flex:1,justifyContent:'center',alignItems:'center',backgroundColor:'#ddd'}}>

            <View style={{backgroundColor:'#ddd',alignItems:'center',justifyContent:'center',padding:40,borderRadius:8,borderWidth:2,borderColor:'#fff'}}>

               <TextInput style={{padding:16,marginBottom:20,backgroundColor:'#fff',width:200,borderRadius:5,borderWidth:2,borderColor:'#eee',fontSize:16}}
               underlineColorAndroid='rgba(0,0,0,0)'
               placeholder='masukan no meja'
               keyboardType='numeric'
               onChangeText={(tableNumber)=> this.setState({tableNumber})}
               value={this.state.tableNumber}
               />
               <TouchableOpacity style={{padding:15,backgroundColor:'#0397d5',width:200,alignItems:'center',borderRadius:5,borderWidth:2,borderColor:'#fff'}}
                  onPress={this.order}
               >
                  <Text style={{color:'#fff',fontSize:17,fontWeight:'bold'}}>pesan</Text>
               </TouchableOpacity>

            </View>

         </View>
      )
   }
}

