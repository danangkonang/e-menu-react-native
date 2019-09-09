import { 
    createAppContainer, 
    createStackNavigator,
} from 'react-navigation';
import Home from './pages/Home';
import Users from './pages/Users'
import Testing from './pages/Testing'
import Menu from './pages/Menu'
import OkTransaction from './pages/OkTransaction'
const AppNavigator = createStackNavigator({
    
    home: {
        screen : Home,
        navigationOptions:{
            header:null
        }
    },
    menu: {
        screen : Menu,
        navigationOptions:{
            header:null
        }
    },
    okTransaction: {
        screen : OkTransaction,
        navigationOptions:{
            header:null
        }
    },



    
    users:{
        screen : Users,
        navigationOptions:{
            header:null
        }
    },
    testing:{
        screen : Testing,
        navigationOptions:{
            header:null
        }
    },
});

const Routes = createAppContainer(AppNavigator);
export default Routes;