import React from 'react';
import { Icon } from 'react-native-elements';

const HeaderLeft = ({ navigation, runFunction = () => {} }) => (
  <Icon
    name="chevron-left"
    onPress={() => {
      runFunction();
      navigation.goBack(null);
    }}
    size={35}
    color="#3e659b"
  />
);

export default HeaderLeft;
