import { useLocalSearchParams } from 'expo-router';
import { LessonScreen } from '@features/feel-lessons';

const LessonRoute = () => {
  const { polyrhythmId } = useLocalSearchParams<{ polyrhythmId: string }>();

  return <LessonScreen polyrhythmId={polyrhythmId ?? ''} />;
};

export default LessonRoute;
