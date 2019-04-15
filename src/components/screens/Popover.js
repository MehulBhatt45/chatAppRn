import React, { Component } from 'react';
import Popover from 'react-native-popover-view';
import { Icon, Input } from 'react-native-elements';
import api from '../../api/index';
import { showMessage } from 'react-native-flash-message';
import TextInput from '../shared/TextInput';
import {
  AppRegistry,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
  Button,
  Platform,
  StatusBar,
  Modal,
  Alert,
  TouchableOpacity,
  FormInput
} from 'react-native';
import { signOutApp } from '../../auth';
 
export default class PopoverIcon extends Component {
  constructor(props){
    super(props);
    // console.log("++++++++++++++++=====================>",this.props)
  }
  state = {
    isVisible: false
  }
 
  showPopover() {
    this.setState({isVisible: true});
  }
 
  closePopover() {
    this.setState({isVisible: false});
  }
 
  render() {
   const PLACEMENT_OPTIONS = Popover.PLACEMENT_OPTIONS;
    return (
      <View style={styles.container}>
      <TouchablePopover popoverOptions={{placement: PLACEMENT_OPTIONS.BOTTOM}} {...this.props}/>
        {/*<TouchableHighlight ref={ref => this.touchable = ref} style={styles.button} onPress={() => this.showPopover()}>
                  <Text>Press me</Text>
                </TouchableHighlight>*/}
 
        
      </View>
    );
  }
}

class TouchablePopover extends React.Component {

  constructor(props){
    super(props);
    console.log("++++++++++++++++=====================>",this.props)
  }

  state = {
    show: false,
    touchable: null,
    modalVisible: false,
    groupName: ""
  }

  componentWillMount() {
    // not currently used, but can be enabled for testing usage with isVisible initially being true
    if (this.props.showInitially)
      this.setState({show: true});
  }

  setModalVisible(visible) {
    this.setState({modalVisible: visible, show: false});
  }

  render() {
    let buttonWidth = StyleSheet.flatten(styles.button).width;
    let buttonHeight = StyleSheet.flatten(styles.button).height;

    return (
      <React.Fragment>
        <Icon
        name="more-vert"
        ref={ref => !this.state.touchable && this.setState({touchable: ref})}
        onPress={() => this.setState({show: true})}
        size={35}
        color="#3e659b"
        />
        <Popover 
            isVisible={this.state.show} 
            onClose={this.props.noBackgroundTap ? () => true : () => this.setState({show: false})} 
            fromView={this.state.touchable}
            verticalOffset={Platform.OS === 'android' ? -StatusBar.currentHeight : 0}
            {...this.props.popoverOptions}>
            <Button
            primary
            title="Logout"
            color="#3e659b"
            onPress={() => {
              api.signOutFirebase()
              .then(
                () => {
                  signOutApp().then(() => {
                    this.props.navigation.navigate('SignedOutStack', {
                      messageProps: {
                        title: 'Bye-Bye',
                        body: 'Talk to you later!',
                        type: 'warning',
                      },
                    })
                  });
                },
                (error) => {
                  showMessage({
                    message: 'Uh-oh',
                    description: `${error.message} (${error.code})`,
                    type: 'danger',
                  });
                },
                );
            }}
            >
            Log out
            </Button>
            <Button
            primary
            title="Create Group"
            color="#3e659b"
            onPress={() => {
              this.setModalVisible(true);
            }}
            >
            Create Group
            </Button>
        </Popover>
        <Modal
          animationType="fade"
          transparent={true}
          visible={this.state.modalVisible}
          onRequestClose={() => {
            Alert.alert('Modal has been closed.');
          }}>
          <View style={{
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'}}>
            <View style={{
              width: 300,
              height: 300}}>
              <View style={{ flexDirection: 'row', justifyContent:'flex-end' }}>
                <TouchableOpacity onPress={() => this.setState({ modalVisible: false })} >
                  <Icon name="close" color="grey" size={25} />
                </TouchableOpacity>
              </View>
              <View>
                <TextInput
                  placeholder="Enter Group Name"
                  value={this.state.groupName}
                  onChangeText={groupName => this.setState({ groupName })}
                />
              </View>

              <Button
                backgroundColor="#03A9F4"
                buttonStyle={{ borderRadius: 0, marginLeft: 0, marginRight: 0, marginBottom: 0 }}
                title='Create Group'
                onPress={()=>api.createGroup(this.state.groupName)}
              />
          </View>
        </View>
        </Modal>
      </React.Fragment>
    )
  }
}
 
var styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerView:{
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  button: {
    borderRadius: 4,
    padding: 10,
    marginLeft: 10,
    marginRight: 10,
    backgroundColor: '#ccc',
    borderColor: '#333',
    borderWidth: 1,
  }
});