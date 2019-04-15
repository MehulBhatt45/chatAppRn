import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image
} from 'react-native';

import api from '../../api/index';
import firebase from '../../lib/firebase';
import Wrapper from './Wrapper';
import IconTitleSet from '../shared/IconTitleSet';
import Button from '../shared/Button';

export default class ActiveChatList extends Component {
  state = {
    rooms: [],
    isLoading: false,
  };

  componentDidMount() {
    firebase.auth().onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setTimeout(async ()=>{
        // Get the rooms for the current user
        const rooms = await api.getRoomsByUserId(api.currentUser.uid);

        const roomIds = rooms.map(room => room.id);
        await this.setUnreadMessagesCounts(roomIds);
        console.log("ROOMS+++++++++++++++++++++++++++++++++++++++++++++++++>>>>>>>>>>>>>>>", rooms);
        this.setState({
          rooms,
          isLoading: false,
        });
        },3000);
      }
    });
  }

  setUnreadMessagesCounts = async (roomIds) => {
    // Get the counts of unread messages for each room that the current user is in
    const currentUserUnreadMessagesCounts = await this.getUserUnreadMessagesCounts(roomIds, api.currentUser.uid);
    this.setState(prevState => ({
      unreadMessagesCounts: { ...prevState.unreadMessagesCounts, ...currentUserUnreadMessagesCounts },
    }));
  }

  getUserUnreadMessagesCounts = async (roomIds, userId) => {
    // Get unread messages as an array of objects
    const unreadMessages = await Promise.all(roomIds.map(async (roomId) => {
      // Get the unread message count for the current user and the room being looped over
      const roomUnreadMessagesCount = await this.getUserUnreadMessagesCount(roomId, userId);

      return {
        roomId,
        count: roomUnreadMessagesCount,
      };
    }));

    // Convert the array of objects to an object using the room id as the key and the unread messages count as the value
    return unreadMessages.reduce((obj, item) => ({
      ...obj,
      [item.roomId]: item.count,
    }), {});
  };

  getUserUnreadMessagesCount = async (roomId, userId) => {
    const unreadMessagesCountSnap = await api.dbRef.child(`unreadMessagesCount/${roomId}/${userId}`).once('value');
    return unreadMessagesCountSnap.val() || 0;
  }

  renderRow = ({ item: room }) => (
    <TouchableOpacity
      onPress={() => this.props.navigation.navigate('Chat', {
        roomId: room.id,
        runFunction: async () => { await this.setUnreadMessagesCounts([room.id]); },
      })}
      style={styles.userButton}
    >
      <View style={styles.profileContainer}>
      <Image
            source={{
              uri: api.getRoomProfile(room, [api.currentUser.uid]),
            }}
            style={styles.profileImage}
          />
        <Text style={styles.profileName}>{api.getRoomName(room, [api.currentUser.uid])} ({this.state.unreadMessagesCounts[room.id]})</Text>
      </View>
    </TouchableOpacity>
  );

  render() {
    return (
      <Wrapper isLoading={this.state.isLoading}>
        <View style={styles.container}>
          {
            // <IconTitleSet
            //           iconName="chat"
            //           style={styles.iconTitleSet}
            //         >
            //           Conversations
            //         </IconTitleSet>
          }
          <FlatList
            data={this.state.rooms}
            renderItem={this.renderRow}
            keyExtractor={room => room.id}
            style={{ flex: 1 }}
          />
        </View>
      </Wrapper>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  iconTitleSet: {
    marginBottom: 20,
  },
  userButton: {
    marginBottom: 10,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  profileImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    transform: [{ rotate: '90deg'}]
  },
  profileName: {
    marginLeft: 6,
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '700',
  },
});