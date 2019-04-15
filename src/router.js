import React from 'react';
import { Button } from 'react-native';
import {
  createStackNavigator,
  createSwitchNavigator,
} from 'react-navigation';
import { createDrawerNavigator, createMaterialTopTabNavigator} from 'react-navigation';
import { DrawerActions } from 'react-navigation';

import api from './api/index';
import { showMessage } from 'react-native-flash-message';
import DrawerScreen from './components/screens/Drawer';
import PopoverIcon from './components/screens/Popover';
import Login from './components/screens/Login';
import MainMenu from './components/screens/MainMenu';
import UserList from './components/screens/UserList';
import ActiveChatList from './components/screens/ActiveChatList';
import Chat from './components/screens/Chat';
import GlobalChat from './components/screens/GlobalChat';
import ResetPassword from './components/screens/ResetPassword';
import Register from './components/screens/Register';
import BackButton from './components/shared/BackButton';
import { signOutApp } from './auth';

// Authorization flow created with help from:
// https://medium.com/the-react-native-log/building-an-authentication-flow-with-react-navigation-fb5de2203b5c

export const SignedOutStack = createStackNavigator(
  {
    Login: {
      screen: Login,
      navigationOptions: {
        title: 'Login',
      },
    },
    Register: {
      screen: Register,
      navigationOptions: {
        title: 'Join',
      },
    },
    ResetPassword: {
      screen: ResetPassword,
      navigationOptions: {
        title: 'Reset Password',
      },
    },
  },
  {
    navigationOptions: ({ navigation }) => ({
      headerStyle: {
        backgroundColor: '#ffffff',
        elevation: null,
      },
      headerTintColor: '#3e659b',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }),
  },
);

const Tabs = createMaterialTopTabNavigator({
    // MainMenu: MainMenu,
    Chats: ActiveChatList,
    Contacts: UserList,
    
},{
    tabBarOptions: {
        activeTintColor: '#3e659b',
        inactiveTintColor: 'gray',
        style: {
            backgroundColor: '#fff',
        },
        indicatorStyle: {
            backgroundColor: '#3e659b',
        },
    }
});

const DrawerNavigator = createDrawerNavigator({
    Home:{
        screen: Tabs
    }
},{
    initialRouteName: 'Home',
    contentComponent: DrawerScreen,
    drawerWidth: 300
});

// const MenuImage = ({navigation}) => {
//     if(!navigation.state.isDrawerOpen){
//         return <Image source={require('../img/menu-button.png')}/>
//     }else{
//         return <Image source={require('../img/left-arrow.png')}/>
//     }
// }

export const SignedInStack = createStackNavigator({
    DrawerNavigator:{
      screen: DrawerNavigator
    },
    MainMenu: {
      screen: MainMenu,
      navigationOptions: {
        title: 'Menu',
      },
    },
    GlobalChat: {
      screen: GlobalChat,
      navigationOptions: {
        title: 'Global Chat',
      },
    },
    UserList: {
      screen: UserList,
      navigationOptions: {
        title: 'Contacts',
      },
    },
    ActiveChatList: {
      screen: ActiveChatList,
      navigationOptions: {
        title: 'Conversations',
      },
    },
    Chat: {
      screen: Chat,
      // navigationOptions: {
      //   title: 'User',
      // },
    },
  },
  {
    navigationOptions: ({ navigation }) => ({
      headerStyle: {
        backgroundColor: '#ffffff',
        elevation: null,
      },
      headerTintColor: '#3e659b',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
      headerLeft: <BackButton navigation={navigation} />,
      headerRight: <PopoverIcon navigation={navigation}/>
      // headerRight: (
        // <Button
        //   primary
        //   title="Logout"
        //   color="#3e659b"
        //   onPress={() => {
        //     api.signOutFirebase()
        //       .then(
        //         () => {
        //           signOutApp().then(() => navigation.navigate('SignedOutStack', {
        //             messageProps: {
        //               title: 'Bye-Bye',
        //               body: 'Talk to you later!',
        //               type: 'warning',
        //             },
        //           }));
        //         },
        //         (error) => {
        //           showMessage({
        //             message: 'Uh-oh',
        //             description: `${error.message} (${error.code})`,
        //             type: 'danger',
        //           });
        //         },
        //       );
        //   }}
        // >
        //   Log out
        // </Button>
      // ),
    }),
  },
);

export const createRootNavigator = (signedIn = false) => createSwitchNavigator(
  {
    SignedInStack: {
      screen: SignedInStack,
    },
    SignedOutStack: {
      screen: SignedOutStack,
    },
  },
  {
    initialRouteName: signedIn ? 'SignedInStack' : 'SignedOutStack',
  },
);
