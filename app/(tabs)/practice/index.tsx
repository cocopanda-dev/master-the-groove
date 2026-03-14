import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAudioStore } from '@data-access/stores/use-audio-store';
import { colors } from '@design-system/tokens/colors';
import { spacing } from '@design-system/tokens/spacing';
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
  const audio = useAudioStore();
  const {
    status,
    selectedRatio,
    feelStatePrompt,
    onPlay,
    onPause,
    onStop,
    onSelectRatio,
    onSubmitFeelState,
    onSkipFeelState,
  } = useCorePlayer();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Visualizer */}
        <View style={styles.section}>
          <RadialVisualizer ratio={selectedRatio} isPlaying={status === 'playing'} />
        </View>

        {/* Transport */}
        <View style={styles.section}>
          <TransportControls
            status={status}
            onPlay={onPlay}
            onPause={onPause}
            onStop={onStop}
          />
        </View>

        {/* Ratio Selector */}
        <RatioSelector
          selectedRatioId={selectedRatio.id}
          onSelect={onSelectRatio}
        />

        {/* BPM Control */}
        <View style={styles.sectionCard}>
          <BpmControl
            bpm={audio.bpm}
            onBpmChange={audio.setBpm}
            onTapTempo={audio.tapTempo}
          />
        </View>

        {/* Sound Selectors */}
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

        {/* Volume Controls */}
        <View style={styles.sectionCard}>
          <VolumeControl
            layerId="A"
            volume={audio.volumeA}
            muted={audio.volumeA === 0}
            onVolumeChange={audio.setVolumeA}
            onMuteToggle={() =>
              audio.volumeA === 0 ? audio.unmuteLayer('A') : audio.muteLayer('A')
            }
          />
          <View style={styles.divider} />
          <VolumeControl
            layerId="B"
            volume={audio.volumeB}
            muted={audio.volumeB === 0}
            onVolumeChange={audio.setVolumeB}
            onMuteToggle={() =>
              audio.volumeB === 0 ? audio.unmuteLayer('B') : audio.muteLayer('B')
            }
          />
        </View>

        {/* Stereo Split */}
        <View style={styles.sectionCard}>
          <StereoSplitToggle
            enabled={audio.stereoSplit}
            onToggle={audio.setStereoSplit}
          />
        </View>
      </ScrollView>

      {/* Feel State Prompt */}
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
  },
  section: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  sectionCard: {
    marginHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 12,
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
