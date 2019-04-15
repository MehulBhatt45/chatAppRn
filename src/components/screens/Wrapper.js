import React from 'react';
import { View, StatusBar, StyleSheet } from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay';

const Wrapper = ({ children, isLoading = false }) => (
  <View style={styles.container}>
    <StatusBar barStyle="dark-content" backgroundColor="#3e659b" />
    {children}
    <Spinner visible={isLoading} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3e659b',
    padding: 20,
  },
});

export default Wrapper;
