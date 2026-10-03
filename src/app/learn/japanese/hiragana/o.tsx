import { useRouter } from 'expo-router';

import { KanaCharacterLesson } from '@/components/kana-character-lesson';
import { hiraganaO } from '@/content/japanese/hiragana';
import { hiraganaPathId } from '@/content/japanese/hiragana-lessons';
import { progressStore } from '@/stores/progress';

export default function HiraganaOLessonScreen() {
  const router = useRouter();

  return (
    <KanaCharacterLesson
      onReviewVowels={() => router.replace('/learn/japanese/hiragana/a')}
      character={hiraganaO}
      onComplete={() => progressStore.completeLesson(hiraganaPathId, hiraganaO.id)}
      onReturnToPath={() =>
        router.replace({
          pathname: '/learn/japanese/hiragana',
          params: { completed: ['a', 'i', 'u', 'e', 'o'] },
        })
      }
    />
  );
}
