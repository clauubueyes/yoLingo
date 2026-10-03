import { useRouter } from 'expo-router';

import { KanaCharacterLesson } from '@/components/kana-character-lesson';
import { hiraganaE } from '@/content/japanese/hiragana';
import { hiraganaPathId } from '@/content/japanese/hiragana-lessons';
import { progressStore } from '@/stores/progress';

export default function HiraganaELessonScreen() {
  const router = useRouter();

  return (
    <KanaCharacterLesson
      nextCharacter={{ symbol: 'お', onContinue: () => router.replace('/learn/japanese/hiragana/o') }}
      character={hiraganaE}
      onComplete={() => progressStore.completeLesson(hiraganaPathId, hiraganaE.id)}
      onReturnToPath={() => router.replace('/learn/japanese/hiragana')}
    />
  );
}
