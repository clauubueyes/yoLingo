import { useRouter } from 'expo-router';

import { KanaCharacterLesson } from '@/components/kana-character-lesson';
import { hiraganaA } from '@/content/japanese/hiragana';
import { hiraganaPathId } from '@/content/japanese/hiragana-lessons';
import { progressStore } from '@/stores/progress';

export default function HiraganaALessonScreen() {
  const router = useRouter();

  return (
    <KanaCharacterLesson
      nextCharacter={{ symbol: 'い', onContinue: () => router.replace('/learn/japanese/hiragana/i') }}
      character={hiraganaA}
      onComplete={() => progressStore.completeLesson(hiraganaPathId, hiraganaA.id)}
      onReturnToPath={() =>
        router.replace({
          pathname: '/learn/japanese/hiragana',
          params: { completed: 'a' },
        })
      }
    />
  );
}
