import { useRouter } from 'expo-router';

import { KanaCharacterLesson } from '@/components/kana-character-lesson';
import { hiraganaI } from '@/content/japanese/hiragana';
import { hiraganaPathId } from '@/content/japanese/hiragana-lessons';
import { progressStore } from '@/stores/progress';

export default function HiraganaILessonScreen() {
  const router = useRouter();

  return (
    <KanaCharacterLesson
      nextCharacter={{ symbol: 'う', onContinue: () => router.replace('/learn/japanese/hiragana/u') }}
      character={hiraganaI}
      onComplete={() => progressStore.completeLesson(hiraganaPathId, hiraganaI.id)}
      onReturnToPath={() => router.replace('/learn/japanese/hiragana')}
    />
  );
}
