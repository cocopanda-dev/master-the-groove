import { View, StyleSheet } from 'react-native';
import { Text, Button } from '@design-system';
import { useRouter } from 'expo-router';

const RoleScreen = () => {
  const router = useRouter();

  const handleRoleSelect = (_role: 'musician' | 'parent' | 'both') => {
    // TODO: Save role to userStore when store actions are implemented
    router.push('/(onboarding)/genres');
  };

  return (
    <View style={styles.container}>
      <Text variant="h2">I am a...</Text>
      <Button
        onPress={() => handleRoleSelect('musician')}
        accessibilityLabel="Select musician role"
      >
        Musician
      </Button>
      <Button
        onPress={() => handleRoleSelect('parent')}
        accessibilityLabel="Select parent role"
      >
        Parent
      </Button>
      <Button
        onPress={() => handleRoleSelect('both')}
        accessibilityLabel="Select both musician and parent role"
      >
        Both
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 32,
  },
});

export default RoleScreen;
