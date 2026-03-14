import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '@design-system';
import { colors } from '@design-system/tokens';
import { useShallow } from 'zustand/shallow';
import { useBabyStore } from '@data-access/stores';
import { DuetTapScreenComponent, useBabyStage } from '@features/baby-mode';

const DuetTapScreen = () => {
  const router = useRouter();
  const { babyName, hasProfile } = useBabyStage();
  const { babyProfile } = useBabyStore(
    useShallow((s) => ({ babyProfile: s.babyProfile })),
  );

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  if (!hasProfile || !babyProfile) {
    return (
      <View style={styles.container}>
        <Text variant="body" color={colors.babyTextSecondary}>
          Set up a baby profile to use Duet Tap.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <DuetTapScreenComponent
        babyProfileId={babyProfile.id}
        babyName={babyName}
        onClose={handleClose}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.babyBackground,
  },
});

export default DuetTapScreen;
