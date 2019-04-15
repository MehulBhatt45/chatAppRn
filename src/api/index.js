/* eslint class-methods-use-this: 0 */

import { snapshotToArray } from '../helpers/index';
import firebase from '../lib/firebase';

class api {
  uid = '';

  messagesRef = null;

  constructor() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.setDbRef();
        this.setCurrentUser();
      }
    });
  }

  setDbRef() {
    this.dbRef = firebase.database().ref();
  }

  async setCurrentUser() {
    var cuser = firebase.auth().currentUser;
    const allUsers = this.dbRef.child('users');

    const allUsersSnapshot = await allUsers.once('value');
    const users = snapshotToArray(allUsersSnapshot)
      .filter(user => user.email == cuser.email)
      .map(user => ({
        name: user.name,
        uid: user.id,
        email: user.email,
        photoURL: user.photoURL,
      }));
      console.log(users)
    this.currentUser = users[0];
    this.setUid(users[0].uid);
    // console.log("IN api current user",this.currentUser)
  }

  setUid(value) {
    this.uid = value;
  }

  getUid() {
    return this.uid;
  }

  // retrieve the messages from the Backend
  loadMessages(callback) {
    this.messagesRef = firebase.database().ref('messages');
    this.messagesRef.off();
    const onReceive = (data) => {
      const message = data.val();
      callback({
        _id: data.key,
        text: message.text,
        createdAt: new Date(message.createdAt),
        user: {
          _id: message.user._id,
          name: message.user.name,
        },
      });
    };
    this.messagesRef.limitToLast(20).on('child_added', onReceive);
  }

  // send the message to the Backend
  sendMessage(message) {
    for (let i = 0; i < message.length; i++) {
      this.messagesRef.push({
        text: message[i].text,
        user: message[i].user,
        createdAt: firebase.database.ServerValue.TIMESTAMP,
      });
    }
  }

  // close the connection to the Backend
  closeChat() {
    if (this.messagesRef) {
      this.messagesRef.off();
    }
  }

  signOutFirebase() {
    return firebase.auth().signOut();
  }

  createGroup(gName) {
    console.log("Create Group called", gName);

  }

  sendPasswordResetEmail(email) {
    return firebase
      .auth()
      .sendPasswordResetEmail(email);
  }

  /**
   * Get detailed information about all rooms for a specified user
   * @param  {String}  userId
   * @return {Promise} An array of objects with detailed information about each room
   */
  getRoomsByUserId = async (userId) => {
    // Get the room ids for the user
    console.log("User ID in api===================>", userId);
    const roomIds = await this.getUserRoomIds(userId);
    console.log("Room IDs in api===================>", roomIds);
    // Get detailed information about each room by its id
    return this.getRoomsByIds(roomIds);
  }

  /**
   * Get detailed information about each room id in a list
   * @param  {Array}  roomIds
   * @return {Promise} An array of objects with detailed information about each room
   */
  getRoomsByIds = async roomIds => Promise.all(roomIds.map(async (roomId) => {
    console.log("roomId in api===================>", roomId);
    // Get the user ids of all the users in the current room in the loop
    const roomUserIds = await this.getRoomUserIds(roomId);
    console.log("roomUserIds in api===================>", roomUserIds);

    // Get detailed information about each user by their id
    const users = await this.getUsersByIds(roomUserIds);
    console.log("Users in api===================>", users);

    return {
      id: roomId,
      users,
    };
  }));

  /**
   * Get the user ids for the users in a specified room
   * @param  {String}  roomId
   * @return {Promise} An array of all the users ids of the users in the room
   */
  getRoomUserIds = async (roomId) => {
    const roomUserIdsSnap = await this.dbRef.child(`roomUsers/${roomId}`).once('value');
    return snapshotToArray(roomUserIdsSnap);
  }

  /**
   * Get the rooms for a specified user
   * @param  {String}  userId
   * @return {Promise}  An array of all the room ids that a user is in
   */
  getUserRoomIds = async (userId) => {
    const userRoomsRef = this.dbRef.child(`userRooms/${userId}`);
    console.log("userRoomsRef in api===================>", userRoomsRef);
    const userRoomsSnap = await userRoomsRef.once('value');
    console.log("userRoomsSnap in api===================>", userRoomsSnap);
    return snapshotToArray(userRoomsSnap);
  }

  /**
   * Get detailed information about each user id in a list
   * @param  {Array]  userIds
   * @return {Promise}  An array of objects with detailed information about each user
   */
  getUsersByIds = async userIds => Promise.all(userIds.map(async (userId) => {
    // Get the user's name that matches the id for the user
    const userSnap = await this.dbRef.child(`users/${userId}`).once('value');
    const user = userSnap.val();
    // console.log("159 getUsersByIds============>", user)
    return {
      name: user.name,
      email: user.email,
      photoURL: user.photoURL,
      uid: userId,
    };
  }));

  /**
   * Create room name by the following priority
   * 1. An assigned room name
   * 2. A comma separated list of all the user's names in the room
   * @param  {Object} room  Detailed information about a room
   * @param  {Array}  [userIds=[]] An array of user ids with which to filter out users
   * @return {String} Assigned room name or Comma separated list of all users
   */
  getRoomName = (room, userIdsToFilterOut = []) => room.name || room.users
    .filter(({ uid }) => !userIdsToFilterOut.includes(uid))
    .map(({ name }) => name)
    .join(', ')

  getRoomProfile = (room, userIdsToFilterOut = []) => room.name || room.users
    .filter(({ uid }) => !userIdsToFilterOut.includes(uid))
    .map(({ photoURL }) => photoURL)
    .join(', ')


  setOrIncrementUnreadMessageCount = ({ roomId, userIds, isCountBeingReset }) => {
    userIds.forEach((userId) => {
      const userUnreadMessagesRef = this.dbRef.child(`unreadMessagesCount/${roomId}/${userId}`);
      userUnreadMessagesRef.transaction(currentCount => (isCountBeingReset ? 0 : (currentCount || 0) + 1));
    });
  }

  /**
   * Save this chat room to the userRooms collection for all specified user ids
   */
  setUsersRoom = async (chatRoomId, userIds) => {
    console.log("userIds in api", userIds, chatRoomId);
    const userRoomsRef = this.dbRef.child('userRooms');
    // const userData = userIds.reduce((usersRoom, userId) => ({
    //   ...usersRoom,
    //   [userId]: {
    //     [userRoomsRef.push().key]: chatRoomId,
    //   },
    // }), {});
    const data = await this.dbRef.child('userRooms').once('value');
    const userData = data.val();
    console.log("userData in api", userData);
    userIds.forEach((userId)=>{
      //userData[userId][userRoomsRef.push().key] = chatRoomId;
      console.log("userData in api", userData[userId]);
    })
    // Example structure being created
    // userRoomsRef.update({
    //   [this.currentUser.uid]: {
    //     [userRoomsRef.push().key]: chatRoomId,
    //   },
    //   [this.selectedUser.uid]: {
    //     [userRoomsRef.push().key]: chatRoomId,
    //   },
    // });

    // userRoomsRef.update(userData);
  }

  /**
   * Save the users for this chat room to the roomUsers collection
   */
  setRoomUsers = (chatRoomId, userIds) => {
    // console.log(userIds);
    // const roomUsersRef = this.dbRef.child(`roomUsers/${chatRoomId}`);

    // const roomData = userIds.reduce((roomUsers, userId) => ({
    //   ...roomUsers,
    //   [roomUsersRef.push().key]: userId,
    // }), {});
    // console.log("roomData in api", roomData);
    // roomUsersRef.update(roomData);

    // Example structure being created
    // roomUsersRef.update({
    //   [roomUsersRef.push().key]: this.currentUser.uid,
    //   [roomUsersRef.push().key]: this.selectedUser.uid,
    // });
  }
}

export default new api();
