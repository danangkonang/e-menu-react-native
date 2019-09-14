import React, { Component } from 'react'
import {
   View,
   Text,
   TouchableOpacity,
   ScrollView,
   Image
} from 'react-native'

import AsyncStorage from '@react-native-community/async-storage'
import{ convertToRupiah } from './function/Rupiah'
import axios from 'axios'
import Modal from "react-native-modal"
import { from } from 'rxjs'
export default class Menu extends Component {
   constructor(props){
      super(props)
      this.state={
         allData: [],
         tableNumber:'',
         categories: [],
         menus: [],
         bgMenu: 'Promo',
         sub: '1',
         ordering: [],
         transaction:{},
         buttonOrder:true,
         buttonConfirm:true,
         buttonBill:true,
         isModalVisibleConfirm: false,
         isModalVisible: false,
         bill:[],
         totalBayar:{},
         btnAddMenu: false,
         tanggal: ''
   }
}

componentWillMount(){


   AsyncStorage.getItem('tableNumber', (error, result) => {
      if (result) {
         this.setState({
            tableNumber: result
         })
      }
      // console.log(result)
   })

   AsyncStorage.getItem('transactionId', (error, res) => {
      if (res) {
         this.setState({
            transaction:{
               transactionId:res,
               subTotal:0,
               discount:0,
               serviceChange:0,
               tax:0,
               total:0
            }
         })
      }
      
      // console.log(this.state.transaction)
   })

   axios.get('https://restourant-menu-api.herokuapp.com/categories')
   .then((response) => {
      const categories = response.data
      this.setState({ categories })
   })

   axios.get('https://restourant-menu-api.herokuapp.com/menus')
   .then((response) => {
      const data = response.data
      this.setState({ allData: data })
      const result = data.filter(data => data.idCategori == this.state.sub)
      this.setState({ menus: result })
   })

   // const today = new Date()
   const dd = new Date().getDate()
   const mm = new Date().getMonth()+1
   const yyyy = new Date().getFullYear()
   const today = mm+'/'+dd+'/'+yyyy
   // const tgl = '21 09 89'
   this.setState({tanggal: today})
}

// hapus 
hapus=()=>{
   AsyncStorage.removeItem('tableNumber')

   AsyncStorage.getItem('tableNumber', (error, result) => {
      if (result) {
         console.log(result)
      }
   })

}

add = (id, name) => {
   const data = this.state.allData
   const dataFilter = data.filter(data => data.idCategori == id)
   this.setState({ menus: dataFilter })
   this.setState({ bgMenu: name })
}

addOrder = (id, price) => {
   const store = this.state.allData
   const data = store.filter(store => store.id == id)//data yg di input user
   const arr = this.state.ordering//data yang di pesan
   const newData = {
      menuId: data[0].id,
      // idCategori: data[0].idCategori,
      name:data[0].name,
      transactionId: this.state.transaction.transactionId,
      qty: 1,
      price: data[0].price,
      status:0,
      image: data[0].image
   }
   for (var i = 0; i < arr.length; i++) {
      if (arr[i].menuId === data[0].id) {
         arr[i].qty++
         arr[i].price = data[0].price*arr[i].qty
         this.setState({ ordering: arr })
         return
      }
   }
   arr.push(newData)
   this.setState({ ordering: arr })
   this.setState({buttonConfirm:false})
   // console.log(arr)
   // this.setState({buttonConfirm:true})
   this.setState({buttonOrder:true})
}

destroyOrder = (id, index) => {
   const order = this.state.ordering
   order.splice(index, 1)
   this.setState({ ordering: order })
   if(order.length==[]){
      this.setState({buttonConfirm:true})
   }
}

renderOrdering() {
   return this.state.ordering.map((item, i) => {
      return (
         <View style={{flex:1,backgroundColor:'pink',marginRight:10,borderRadius:5,alignItems:'center'}}>
            <Image style={{width:100,height:90,borderRadius:5}} source={{uri: item.image}}/>
               <Text style={{ backgroundColor: '#ddd',color:'#000', height: 20, width: 20, fontSize: 10, borderRadius: 50, textAlign: 'center', position: 'absolute', top: 3, left: 3, textAlignVertical: 'center',fontWeight:'bold',fontSize:13,borderWidth:2,borderColor:'#fff' }}>{item.qty}</Text>
            <TouchableOpacity 
            onPress={() => this.destroyOrder(item.id, i)}
            style={{backgroundColor:'red',height:20,width:20,borderRadius:50,position:'absolute',top:0,right:0}}>
               <Text style={{ fontSize:13,textAlign:'center', textAlignVertical: 'center',fontWeight:'bold',color:'#fff'}}>X</Text>
            </TouchableOpacity>
               <Text style={{position: 'absolute',fontSize:12,bottom:15,fontWeight:'bold'}}>{item.name}</Text>
               <Text style={{position: 'absolute',fontSize:10,bottom:3,fontWeight:'bold'}}>Rp.{item.price}</Text>
      </View>
      )
   })
}

toggleModalConfirm = () => {
   this.setState({ isModalVisibleConfirm: !this.state.isModalVisibleConfirm })
}

toggleModal = () => {
   this.setState({ isModalVisible: !this.state.isModalVisible })
}

confirmOk =()=>{
   this.setState({buttonOrder:false})
   this.setState({buttonConfirm:true})
   this.setState({ isModalVisibleConfirm: !this.state.isModalVisibleConfirm })
}

saveOrder=()=>{
   axios({
      method: 'post',
      url: 'https://restourant-menu-api.herokuapp.com/order',
      data: this.state.ordering
   }).then((response) => {
      // const newArr = this.state.bill.push(this.state.ordering)
      this.setState({ bill: this.state.ordering })
      this.setState({btnAddMenu: true})
      this.setState({ ordering: [] })
      this.totalNya()
   })
}

totalNya(){
   var cart = this.state.bill
   var total =0
   for(var i=0;i<cart.length;i++){
      total +=cart[i].price
   }
   this.setState({totalBayar:{
      transactionId:this.state.transaction.transactionId,
      subTotal:convertToRupiah(total),
      discount:0,
      serviceChange:0,
      tax:0,
      total:convertToRupiah(total)
   }})
   this.setState({buttonOrder:true})
   this.setState({buttonBill:false})
   this.updateTransaction()
}

updateTransaction=()=>{
   const data = {
      transactionId:this.state.totalBayar.transactionId,
      tableNumber: this.state.tableNumber,
      subtotal: this.state.totalBayar.subTotal,
      discount:this.state.totalBayar.discount,
      serviceCharge:this.state.totalBayar.serviceChange,
      tax:this.state.totalBayar.tax
   }
   axios({
      method: 'post',
      url: 'https://restourant-menu-api.herokuapp.com/updateTransaction',
      data: data
   }).then((response) => {
      this.updateStatus()
   })
}

updateStatus = ()=>{
   axios({
      method: 'post',
      url: 'https://restourant-menu-api.herokuapp.com/finishOrder',
      data:{
         transactionId: this.state.totalBayar.transactionId
      } 
   }).then((response) => {
      axios({
         method: 'post',
         url: 'https://restourant-menu-api.herokuapp.com/finishTransaction',
         data: {
            transactionId: this.state.totalBayar.transactionId,
            finishedTime: new Date()
         }
      }).then((response) => {})
   })
      
   setTimeout( ()=>{
      const newBill = this.state.bill
      for(var i=0; i<newBill.length;i++){
         newBill[i].status= 1
         this.setState({bill:newBill})
      }
   },70000)
}

successTransaction=()=>{
   this.setState({ isModalVisible: !this.state.isModalVisible })
   this.props.navigation.navigate('okTransaction')
   this.setState({bill:[]})
   this.setState({totalBayar:{}})
   AsyncStorage.removeItem('transactionId')
   AsyncStorage.removeItem('tableNumber')
   // AsyncStorage.getItem('tableNumber', (error, result) => {
   // })
   // AsyncStorage.getItem('transactionId', (error, res) => {
   // })
}

// convertToRupiah(angka=0){
//    // console.log(angka)
//    const rupiah = '';
//    const angkarev = angka.toString().split('').reverse().join('');
//    for(const i = 0; i < angkarev.length; i++)
//    if(i%3 == 0) rupiah += angkarev.substr(i,3)+'.';
//    return rupiah.split('',rupiah.length-1).reverse().join('');
// }

tanggal(){
   const tgl = '21 09 89'
   this.setState({tanggal: tgl})
}

   render() {
      return (
         <View style={{flex:1,backgroundColor:'#eee'}}>

            {/* <TouchableOpacity style={{backgroundColor:'tomato',margin:15,padding:10}} onPress={this.hapus}>
               <Text>hapus</Text>
            </TouchableOpacity> */}

            {/* header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 5 }}>
               <View>
                  <Text></Text>
               </View>
               <View>
                  <Text style={{fontWeight:'bold',color:'#999'}}>Selamat datang</Text>
               </View>
               <View style={{alignItems:'center',justifyContent:'center',backgroundColor:'#0397d5',width:20,height:20,borderRadius:50}}>
                  <Text style={{fontWeight:'bold',color:'#fff',}}>{this.state.tableNumber}</Text>
               </View>
            </View>
            
            {/* menus */}
            <View style={{flexDirection: 'row' }}>
               {
                  this.state.categories.map((item, key) => (
                     <TouchableOpacity
                     
                        key={item.id}
                        onPress={() => this.add(item.id, item.name)}
                        style={this.state.bgMenu == item.name ?
                           {
                              backgroundColor: '#0397d5', margin: 1, paddingHorizontal: 4, alignItems: 'center', justifyContent: 'center', paddingVertical: 8, flex: 1, borderRadius: 4
                           } : {
                              backgroundColor: '#5bbbe4', margin: 1, paddingHorizontal: 4, alignItems: 'center', justifyContent: 'center', paddingVertical: 8, flex: 1, borderRadius: 4
                           }}>
                        <Text style={this.state.bgMenu == item.name ? { color: '#f1f1f1',fontWeight:'bold'} : { color: '#f1f1f1',fontWeight:'bold'}}>{item.name}</Text>
                     </TouchableOpacity>
                  ))
               }
            </View>

            {/* sub menus */}
            <ScrollView showsVerticalScrollIndicator={false}>
               
               <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap' }}>
                  {this.state.menus.map((item, e) => (
                     <View style={{ width: '50%', padding: 5 }} key={item.id}>

                        <TouchableOpacity
                           disabled={this.state.btnAddMenu}
                           onPress={() => this.addOrder(item.id, item.price)}
                           style={{ backgroundColor: '#ddd', borderRadius: 8, }}>
                           <Image style={{ width: '100%', height: 160, borderTopLeftRadius: 8, borderTopRightRadius: 8, }} source={{uri: item.image}}/>
                           
                           <View style={{ padding: 10 }}>
                              <Text style={{ color: '#0397d5',fontWeight:'bold' }}>{item.name}</Text>
                              <Text style={{ color: '#0397d5',fontWeight:'bold' }}>Rp.{item.price}</Text>
                           </View>
                        </TouchableOpacity>

                     </View>
                     
                  ))
                  
                  
                  }
               </View>

            </ScrollView>
            
            {/* footer */}
            <View style={this.state.buttonConfirm === true?{
               padding: 5 ,paddingTop:0}:{
                  height: 150,padding: 5 ,paddingTop:0
            }}>

               <View style={{flex:1,borderColor:'#ddd',borderWidth:2}}>
                  <ScrollView horizontal style={{flexDirection:'row',padding:3}}>
                     {this.renderOrdering()}
                  </ScrollView>
               </View>

               <View style={{height:50,flexDirection:'row',paddingTop:5}}>

                  <TouchableOpacity 
                  disabled={this.state.buttonConfirm}
                  onPress={this.toggleModalConfirm} 
                  style={this.state.buttonConfirm === true?{ 
                     flex: 1, borderRadius: 8, backgroundColor: '#ddd', alignItems: 'center', justifyContent: 'center',marginHorizontal:3
                  }:{ 
                     flex: 1, borderRadius: 8, backgroundColor: '#0397d5', alignItems: 'center', justifyContent: 'center',marginHorizontal:3
                  }}>
                     <Text style={{color:'#f1f1f1',fontWeight:'bold'}}>Confirm</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                  disabled={this.state.buttonOrder}
                  onPress={(this.saveOrder)}
                  style={this.state.buttonOrder === true?{ 
                     flex: 1, borderRadius: 8, backgroundColor: '#ddd', alignItems: 'center', justifyContent: 'center',marginHorizontal:3
                  }:{ 
                     flex: 1, borderRadius: 8, backgroundColor: '#0397d5', alignItems: 'center', justifyContent: 'center',marginHorizontal:3
                  }}>
                     <Text style={{color:'#f1f1f1',fontWeight:'bold'}}>Call</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                  disabled={this.state.buttonBill}
                  onPress={this.toggleModal}
                  style={this.state.buttonBill === true?{ 
                     flex: 1, borderRadius: 8, backgroundColor: '#ddd', alignItems: 'center', justifyContent: 'center',marginHorizontal:3
                  }:{ 
                     flex: 1, borderRadius: 8, backgroundColor: '#0397d5', alignItems: 'center', justifyContent: 'center',marginHorizontal:3
                  }}>
                     <Text style={{color:'#f1f1f1',fontWeight:'bold'}}>Bill</Text>
                  </TouchableOpacity>

               </View>
            </View>

            {/* modal confirm */}
            <Modal
               animationIn='zoomIn'
               animationOut='slideOutDown'
               animationInTiming={1000}
               backdropTransitionInTiming={800}
               backdropTransitionInTiming={800}
               isVisible={this.state.isModalVisibleConfirm}>

               <View style={{ backgroundColor: '#ddd', borderRadius:6}}>

                  <View style={{padding:10}}>
                     <Text style={{fontSize:17,fontWeight:'bold',color:'#515151'}}> yakinn ingin memesan ini</Text>
                  </View>
                  <View style={{flexDirection:'row'}}>
                     <View style={{flex:1,padding:10}}>
                        <TouchableOpacity onPress={this.toggleModalConfirm} style={{backgroundColor:'red',paddingVertical:8,borderRadius:4,alignItems:'center',justifyContent:'center',fontSize:16,borderWidth:2,borderColor:'#eee'}}>
                              <Text style={{fontSize:16,color:'#f1f1f1'}}>close</Text>
                        </TouchableOpacity>
                     </View>
                     <View style={{flex:1,padding:10}}>
                        <TouchableOpacity onPress={this.confirmOk} style={{backgroundColor:'#0397d5',paddingVertical:8,borderRadius:4,alignItems:'center',justifyContent:'center',fontSize:16,borderWidth:2,borderColor:'#eee'}}>
                              <Text style={{fontSize:16,color:'#f1f1f1'}}>Pesan</Text>
                        </TouchableOpacity>
                     </View>
                  </View>
               </View>

            </Modal>
            

            {/* modal nota */}
            <Modal
               animationIn='zoomIn'
               animationOut='slideOutDown'
               animationInTiming={1000}
               backdropTransitionInTiming={800}
               backdropTransitionInTiming={800}
               isVisible={this.state.isModalVisible}>

               <View style={{backgroundColor:'#fff',borderRadius:10,paddingTop:10,paddingBottom:10,flex:1,maxHeight:400}}>
                  <View style={{paddingBottom:10,flexDirection:'row'}}>
                     <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
                        <Text style={{fontSize:16,color:'#515151'}}>{ this.state.tanggal}</Text>
                     </View>
                     <View style={{marginRight:5}}>
                        {/* <TouchableOpacity onPress={this.toggleModal} style={{backgroundColor:'red',borderRadius:50,width:20,height:20,alignItems:'center'}}>
                           <Text style={{fontWeight:'bold',color:'#fff'}}>X</Text>
                        </TouchableOpacity> */}
                     </View>
                  </View>
                  <View style={{paddingHorizontal:10,flex:1}}>
                     <View style={{flex:1}}>
                        {/* looping */}
                        {
                           this.state.bill.map((item, key) => (
                              <View style={{ flexDirection: 'row',}}>
                                 <View style={{paddingHorizontal:10}}>
                                 {item.status ===0?
                                    <Text style={{fontSize:16,color:'red'}}>Waiting</Text>:
                                    <Text style={{fontSize:16,color:'green'}}>Sent</Text>
                                 }
                                 </View>
                                 <View style={{flex:1,paddingLeft:5}}>
                                    <Text style={{fontSize:16,color:'#515151'}}>{item.name}</Text>
                                 </View>
                                 <View style={{alignItems:'flex-end'}}>
                                    <Text style={{fontSize:16,color:'#515151'}}>{convertToRupiah(item.price)}</Text>
                                 </View>
                              </View>
                           ))
                        }
                     </View>

                     <View style={{height:120}}>
                        {/* sub total */}
                        <View style={{ flexDirection: 'row',}}>
                           <View style={{flex:1,alignItems:'flex-end'}}>
                              <Text style={{fontSize:16,color:'#515151',fontWeight:'bold'}}>Sub total</Text>
                           </View>
                           <View style={{alignItems:'flex-end',width:110}}>
                              <Text style={{fontSize:16,color:'#515151'}}>{this.state.totalBayar.subTotal}</Text>
                           </View>
                        </View>
                        {/* diskon */}
                        <View style={{ flexDirection: 'row',}}>
                           <View style={{flex:1,alignItems:'flex-end'}}>
                              <Text style={{fontSize:16,color:'#515151'}}>diskon (%)</Text>
                           </View>
                           <View style={{alignItems:'flex-end',width:110}}>
                              <Text style={{fontSize:16,color:'#515151'}}>{this.state.totalBayar.discount}</Text>
                           </View>
                        </View>
                        {/* charge service */}
                        <View style={{ flexDirection: 'row',}}>
                           <View style={{flex:1,alignItems:'flex-end'}}>
                              <Text style={{fontSize:16,color:'#515151'}}>service change (%)</Text>
                           </View>
                           <View style={{alignItems:'flex-end',width:110}}>
                              <Text style={{fontSize:16,color:'#515151'}}>{this.state.totalBayar.serviceChange}</Text>
                           </View>
                        </View>
                        {/* tax */}
                        <View style={{ flexDirection: 'row',}}>
                           <View style={{flex:1,alignItems:'flex-end'}}>
                              <Text style={{fontSize:16,color:'#515151'}}>Tax (%)</Text>
                           </View>
                           <View style={{alignItems:'flex-end',width:110}}>
                              <Text style={{fontSize:16,color:'#515151'}}>{this.state.totalBayar.tax}</Text>
                           </View>
                        </View>
                        {/* total */}
                        <View style={{ flexDirection: 'row',borderTopColor:'#515151',borderTopWidth:2,marginTop:5,paddingTop:5}}>
                           <View style={{flex:1,alignItems:'flex-end'}}>
                              <Text style={{fontWeight:'bold',fontSize:16,color:'#515151'}}>Total</Text>
                           </View>
                           <View style={{alignItems:'flex-end',width:110}}>
                              <Text style={{fontWeight:'bold',fontSize:16,color:'#515151'}}>Rp.{this.state.totalBayar.total}</Text>
                           </View>
                        </View>
                     </View>
                  </View>
                  <View style={{paddingHorizontal:10,paddingTop:5}}>
                     <TouchableOpacity 
                     onPress={(this.successTransaction)}
                     style={{
                           borderRadius: 5,
                           backgroundColor: '#0397d5',
                           alignItems: 'center',
                           justifyContent: 'center',
                           paddingVertical: 10
                        }}>
                        <Text style={{color:'#fff',fontWeight:'bold'}}>BILL</Text>
                     </TouchableOpacity>
                  </View>

               </View>
            </Modal>

         </View>
      )
   }
}