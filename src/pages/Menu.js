import React, { Component } from 'react'
import {
   View,
   Text,
   AsyncStorage,
   TouchableOpacity,
   ScrollView,
   Image
} from 'react-native'
import axios from 'axios'
import Modal from "react-native-modal"
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
         totalBayar:{}
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
      status:0
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
         <View style={{ width: '50%', padding: 5 }}>
            <TouchableOpacity key={item.id}
               onPress={() => this.destroyOrder(item.id, i)}
               style={{ backgroundColor: '#0397d5', padding: 7, alignItems: 'center', justifyContent: 'center', borderRadius: 6 }}>
               <Text style={{ color: '#000' }}>{item.name}</Text>
               <Text style={{ backgroundColor: '#fff', height: 20, width: 20, fontSize: 10, borderRadius: 50, textAlign: 'center', position: 'absolute', top: 3, right: 3, textAlignVertical: 'center' }}>{item.qty}</Text>

            </TouchableOpacity>
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
      url: 'http://localhost:3000/order',
      data: this.state.ordering
   }).then((response) => {
      this.setState({ bill: this.state.ordering })
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
      subTotal:total,
      discount:0,
      serviceChange:0,
      tax:0,
      total:total
   }})
   this.setState({buttonOrder:true})
   this.setState({buttonBill:false})
   this.updateTransaction()
}

updateTransaction=()=>{
   const data = {
      transactionId:this.state.totalBayar.transactionId,
      tableNumber: this.state.tableNumber,
      subtotal:this.state.totalBayar.subTotal,
      discount:this.state.totalBayar.discount,
      serviceCharge:this.state.totalBayar.serviceChange,
      tax:this.state.totalBayar.tax
   }
   axios({
      method: 'post',
      url: 'http://localhost:3000/updateTransaction',
      data: data
   }).then((response) => {
      this.updateStatus()
   })
}

updateStatus = ()=>{
   axios({
      method: 'post',
      url: 'http://localhost:3000/finishOrder',
      data:{
         transactionId: this.state.totalBayar.transactionId
      } 
   }).then((response) => {
      axios({
         method: 'post',
         url: 'http://localhost:3000/finishTransaction',
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
   },80000)
}

successTransaction=()=>{
   this.props.navigation.navigate('okTransaction')
   this.setState({bill:[]})
   this.setState({totalBayar:{}})
   AsyncStorage.getItem('tableNumber', (error, result) => {
   })
   AsyncStorage.getItem('transactionId', (error, res) => {
   })
}

   render() {
      return (
         <View style={{flex:1,backgroundColor:'#fff'}}>
            {/* <Text style={{fontSize:20,fontWeight:'200'}}>{this.state.tableNumber}</Text>
            <TouchableOpacity style={{backgroundColor:'tomato',margin:20}} onPress={this.hapus}>
               <Text style={{fontSize:20,padding:10}}>hapus no meja</Text>
            </TouchableOpacity> */}

            {/* header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 5 }}>
               <View>
                  <Text></Text>
               </View>
               <View>
                  <Text>WAITING</Text>
               </View>
               <View>
                  <Text>{this.state.tableNumber}</Text>
               </View>
            </View>
            
            {/* menus */}
            <View style={{ backgroundColor: '#fff', flexDirection: 'row' }}>
               {
                  this.state.categories.map((item, key) => (
                     <TouchableOpacity
                        key={item.id}
                        onPress={() => this.add(item.id, item.name)}
                        style={this.state.bgMenu == item.name ?
                           {
                              backgroundColor: '#ddd', margin: 1, paddingHorizontal: 4, alignItems: 'center', justifyContent: 'center', paddingVertical: 8, flex: 1, borderRadius: 4
                           } : {
                              backgroundColor: '#0397d5', margin: 1, paddingHorizontal: 4, alignItems: 'center', justifyContent: 'center', paddingVertical: 8, flex: 1, borderRadius: 4
                           }}>
                        <Text style={this.state.bgMenu == item.name ? { color: '#0397d5' } : { color: '#ddd' }}>{item.name}</Text>
                     </TouchableOpacity>
                  ))
               }
            </View>

            {/* sub menus */}
            <ScrollView showsVerticalScrollIndicator={false}>
               
               <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap' }}>
                  {this.state.menus.map((item, e) => (
                     <View style={{ width: '50%', padding: 5 }}>

                        <TouchableOpacity
                           key={e+1}
                           onPress={() => this.addOrder(item.id, item.price)}
                           style={{ backgroundColor: '#ddd', borderRadius: 8 }}>
                           <Image style={{ width: '100%', height: 140, borderTopLeftRadius: 8, borderTopRightRadius: 8 }} source={require('../images/nasgor.jpg')} />
                           <View style={{ padding: 10 }}>
                              <Text style={{ color: '#0397d5' }}>{item.name}</Text>
                              <Text style={{ color: '#0397d5' }}>Rp.{item.price}</Text>
                           </View>
                        </TouchableOpacity>

                     </View>
                  ))}
               </View>

            </ScrollView>
            
            {/* footer */}
            <View style={{ height: 140,padding: 5 ,paddingTop:0}}>

               <View style={{flex:1,borderColor:'#eee',borderWidth:2}}>
                  <ScrollView>
                     <View style={{ flexWrap: 'wrap', flexDirection: 'row', flex: 1 }}>
                     {this.renderOrdering()}
                     </View>
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
                     <Text>Confirm</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                  disabled={this.state.buttonOrder}
                  onPress={(this.saveOrder)}
                  style={this.state.buttonOrder === true?{ 
                     flex: 1, borderRadius: 8, backgroundColor: '#ddd', alignItems: 'center', justifyContent: 'center',marginHorizontal:3
                  }:{ 
                     flex: 1, borderRadius: 8, backgroundColor: '#0397d5', alignItems: 'center', justifyContent: 'center',marginHorizontal:3
                  }}>
                     <Text>Call</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                  disabled={this.state.buttonBill}
                  onPress={this.toggleModal}
                  style={this.state.buttonBill === true?{ 
                     flex: 1, borderRadius: 8, backgroundColor: '#ddd', alignItems: 'center', justifyContent: 'center',marginHorizontal:3
                  }:{ 
                     flex: 1, borderRadius: 8, backgroundColor: '#0397d5', alignItems: 'center', justifyContent: 'center',marginHorizontal:3
                  }}>
                     <Text>Bill</Text>
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
                        <TouchableOpacity onPress={this.toggleModalConfirm} style={{backgroundColor:'#0397d5',paddingVertical:8,borderRadius:4,alignItems:'center',justifyContent:'center',fontSize:16,borderWidth:2,borderColor:'#eee'}}>
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
                        <Text style={{fontSize:16}}>29 januari 2018</Text>
                     </View>
                     <View style={{marginRight:5}}>
                        <TouchableOpacity onPress={this.toggleModal} style={{backgroundColor:'red',borderRadius:50,width:20,height:20,alignItems:'center'}}>
                           <Text style={{fontWeight:'bold',color:'#fff'}}>X</Text>
                        </TouchableOpacity>
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
                                    <Text style={{fontSize:16}}>{item.name}</Text>
                                 </View>
                                 <View style={{alignItems:'flex-end'}}>
                                    <Text style={{fontSize:16}}>{item.price}</Text>
                                 </View>
                              </View>
                           ))
                        }
                     </View>

                     <View style={{height:120}}>
                        {/* sub total */}
                        <View style={{ flexDirection: 'row',}}>
                           <View style={{flex:1,alignItems:'flex-end'}}>
                              <Text style={{fontSize:16}}>Sub total</Text>
                           </View>
                           <View style={{alignItems:'flex-end',width:110}}>
                              <Text style={{fontSize:16}}>{this.state.totalBayar.subTotal}</Text>
                           </View>
                        </View>
                        {/* diskon */}
                        <View style={{ flexDirection: 'row',}}>
                           <View style={{flex:1,alignItems:'flex-end'}}>
                              <Text style={{fontSize:16}}>diskon (%)</Text>
                           </View>
                           <View style={{alignItems:'flex-end',width:110}}>
                              <Text style={{fontSize:16}}>{this.state.totalBayar.discount}</Text>
                           </View>
                        </View>
                        {/* charge service */}
                        <View style={{ flexDirection: 'row',}}>
                           <View style={{flex:1,alignItems:'flex-end'}}>
                              <Text style={{fontSize:16}}>service change (%)</Text>
                           </View>
                           <View style={{alignItems:'flex-end',width:110}}>
                              <Text style={{fontSize:16}}>{this.state.totalBayar.serviceChange}</Text>
                           </View>
                        </View>
                        {/* tax */}
                        <View style={{ flexDirection: 'row',}}>
                           <View style={{flex:1,alignItems:'flex-end'}}>
                              <Text style={{fontSize:16}}>Tax (%)</Text>
                           </View>
                           <View style={{alignItems:'flex-end',width:110}}>
                              <Text style={{fontSize:16}}>{this.state.totalBayar.tax}</Text>
                           </View>
                        </View>
                        {/* total */}
                        <View style={{ flexDirection: 'row',borderTopColor:'#515151',borderTopWidth:2,marginTop:5,paddingTop:5}}>
                           <View style={{flex:1,alignItems:'flex-end'}}>
                              <Text style={{fontWeight:'bold',fontSize:16}}>Total</Text>
                           </View>
                           <View style={{alignItems:'flex-end',width:110}}>
                              <Text style={{fontWeight:'bold',fontSize:16}}>Rp.{this.state.totalBayar.total}</Text>
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
                        <Text>BILL</Text>
                     </TouchableOpacity>
                  </View>

               </View>
            </Modal>

         </View>
      )
   }
}