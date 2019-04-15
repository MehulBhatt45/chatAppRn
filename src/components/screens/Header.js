import React from 'react';
import { StyleSheet, SafeAreaView, ScrollView, Text, Image, View } from 'react-native';
import { Header, Icon } from 'react-native-elements';
import { createDrawerNavigator, DrawerActions, DrawerItems } from 'react-navigation';
import Menu from './Drawer';

const MenuContainer = () => {
  let pressMenu;
  
  return(
    <React.Fragment>
      <Header
        placement="left"
        leftComponent={
          <Icon
            name="apps"
            color='#fff'
            onPress={() => {
              pressMenu.dispatch(DrawerActions.toggleDrawer())
                }}
           />
        }
        centerComponent={{ text: 'MY TITLE', style: { color: '#fff' } }}
        rightComponent={{ icon: 'home', color: '#fff' }}
      />
      <Menu
         ref={navigatorRef => { pressMenu = navigatorRef}}
      />
    </React.Fragment>
  )
}
export default MenuContainer;

const styles = StyleSheet.create({
  header : {
    height: 80,
    marginTop: 20,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderBottomWidth: 4,
    borderBottomColor: '#ccc'
  },
  cart: {
    width: 40,
    height: 40
  },
  logo: {
    fontSize: 20,
    marginLeft: 10,
    fontStyle: 'italic',
    color: '#292929'
  }
});
