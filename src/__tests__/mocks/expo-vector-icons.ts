import React from 'react';
import { Text } from 'react-native';

const createIconMock = (familyName: string) => {
  const IconComponent = ({ name, testID, ...props }: { name: string; testID?: string; [key: string]: unknown }) =>
    React.createElement(Text, { testID: testID ?? `${familyName}-${name}`, ...props }, name);
  IconComponent.displayName = familyName;
  return IconComponent;
};

const MaterialCommunityIcons = createIconMock('MaterialCommunityIcons');
const Ionicons = createIconMock('Ionicons');
const FontAwesome = createIconMock('FontAwesome');

export { MaterialCommunityIcons, Ionicons, FontAwesome };
