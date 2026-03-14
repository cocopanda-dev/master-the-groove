import React, { useCallback } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAudioStore } from '@data-access/stores/use-audio-store';
import { useShallow } from 'zustand/shallow';
import { colors } from '@design-system/tokens/colors';
import { spacing } from '@design-system/tokens/spacing';
import { borderRadius } from '@design-system/tokens/border-radius';
import {
  RadialVisualizer,
  RatioSelector,
  BpmControl,
  SoundSelector,
  VolumeControl,
  StereoSplitToggle,
  TransportControls,
  FeelStatePrompt,
  useCorePlayer,
} from '@features/core-player';

const PracticeScreen = () => {
  const audio = useAudioStore(
    useShallow((s) => ({
      bpm: s.bpm,
      soundA: s.soundA,
      soundB: s.soundB,
      volumeA: s.volumeA,
      volumeB: s.volumeB,
      stereoSplit: s.stereoSplit,
      setBpm: s.setBpm,
      tapTempo: s.tapTempo,
      setSoundA: s.setSoundA,
      setSoundB: s.setSoundB,
      setVolumeA: s.setVolumeA,
      setVolumeB: s.setVolumeB,
      muteLayer: s.muteLayer,
      unmuteLayer: s.unmuteLayer,
      setStereoSplit: s.setStereoSplit,
    })),
  );

  const {
    status,
    selectedRatio,
    feelStatePrompt,
    mutedA,
    mutedB,
    onPlay,
    onPause,
    onStop,
    onSelectRatio,
    onSubmitFeelState,
    onSkipFeelState,
  } = useCorePlayer();

  const onMuteToggleA = useCallback(
    () => (mutedA ? audio.unmuteLayer('A') : audio.muteLayer('A')),
    [mutedA, audio],
  );

  const onMuteToggleB = useCallback(
    () => (mutedB ? audio.unmuteLayer('B') : audio.muteLayer('B')),
    [mutedB, audio],
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <RadialVisualizer ratio={selectedRatio} isPlaying={status === 'playing'} />

        <TransportControls
          status={status}
          onPlay={onPlay}
          onPause={onPause}
          onStop={onStop}
        />

        <RatioSelector
          selectedRatioId={selectedRatio.id}
          onSelect={onSelectRatio}
        />

        <View style={styles.sectionCard}>
          <BpmControl
            bpm={audio.bpm}
            ratioA={selectedRatio.ratioA}
            ratioB={selectedRatio.ratioB}
            onBpmChange={audio.setBpm}
            onTapTempo={audio.tapTempo}
          />
        </View>

        <View style={styles.sectionCard}>
          <SoundSelector
            layerId="A"
            selectedSound={audio.soundA}
            onSoundChange={audio.setSoundA}
          />
          <View style={styles.divider} />
          <SoundSelector
            layerId="B"
            selectedSound={audio.soundB}
            onSoundChange={audio.setSoundB}
          />
        </View>

        <View style={styles.sectionCard}>
          <VolumeControl
            layerId="A"
            volume={audio.volumeA}
            muted={mutedA}
            onVolumeChange={audio.setVolumeA}
            onMuteToggle={onMuteToggleA}
          />
          <View style={styles.divider} />
          <VolumeControl
            layerId="B"
            volume={audio.volumeB}
            muted={mutedB}
            onVolumeChange={audio.setVolumeB}
            onMuteToggle={onMuteToggleB}
          />
        </View>

        <View style={styles.sectionCard}>
          <StereoSplitToggle
            enabled={audio.stereoSplit}
            onToggle={audio.setStereoSplit}
          />
        </View>
      </ScrollView>

      <FeelStatePrompt
        visible={feelStatePrompt.visible}
        sessionDuration={feelStatePrompt.sessionDuration}
        onSelect={onSubmitFeelState}
        onSkip={onSkipFeelState}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing['2xl'],
    gap: spacing.md,
    paddingHorizontal: spacing.md,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
});

export default PracticeScreen;
