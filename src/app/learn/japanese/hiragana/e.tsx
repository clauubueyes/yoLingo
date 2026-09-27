import { useRouter } from 'expo-router';

import { KanaCharacterLesson } from '@/components/kana-character-lesson';
import { hiraganaE } from '@/content/japanese/hiragana';

export default function HiraganaELessonScreen() {
  const router = useRouter();

  return (
    <KanaCharacterLesson
      character={hiraganaE}
      onReturnToPath={() =>
        router.replace({
          pathname: '/learn/japanese/hiragana',
          params: { completed: ['a', 'i', 'u', 'e'] },
        })
      }
    />
  );
}
