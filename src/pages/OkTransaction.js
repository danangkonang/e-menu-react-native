import React, { Component } from 'react'
import {
   View,
   Text,
   TouchableOpacity,
   Image
} from 'react-native'
// import QRCode from 'react-native-qrcode'
export default class OkTransaction extends Component {
   

   render() {
      return (
         <View style={{flex:1,backgroundColor:'#515151'}}>
            <View style={{flex:1,alignItems:'center',justifyContent:'flex-end'}}>
               <Text style={{fontSize:20,color:'#fff'}}>Tolong bawa ini ke kasir</Text>
               <Text style={{fontSize:20,color:'#fff'}}>untuk menyelesaikan pembayaran</Text>
            </View>
            <View style={{justifyContent:'center',alignItems:'center',paddingVertical:15}}>
               <Text style={{fontSize:20,color:'#fff'}}>E-MENU</Text>
               <Image source={{uri:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSap2uDAFf-HMFDnMIok_ocvDoOELQOLALhAbHlfRwllIquOmDQ'}} style={{backgroundColor:'#fff',width:120,height:120,marginTop:5,borderRadius:2}}/>
                  
            </View>
            <View style={{flex:1}}>
               <View style={{flex:1,justifyContent:'flex-start',alignItems:'center'}}>
                  <Text style={{fontSize:20,color:'#fff'}}>Terima kasih</Text>
               </View>
               <View style={{flex:1,justifyContent:'flex-start',alignItems:'center'}}>
                  <TouchableOpacity 
                     onPress={()=>this.props.navigation.navigate('home')}
                  style={{backgroundColor:'#0397d5',paddingHorizontal:15,paddingVertical:10,borderRadius:7,borderWidth:2,borderColor:'#f1f1f1'}}>
                     <Text style={{fontSize:18,color:'#f1f1f1'}}>Pesan lagi</Text>
                  </TouchableOpacity>
               </View>
            </View>
         </View>
      )
   }
}