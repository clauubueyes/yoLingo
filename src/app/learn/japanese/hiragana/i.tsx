import { useRouter } from 'expo-router';

import { KanaCharacterLesson } from '@/components/kana-character-lesson';
import { hiraganaI } from '@/content/japanese/hiragana';

export default function HiraganaILessonScreen() {
  const router = useRouter();

  return (
    <KanaCharacterLesson
      character={hiraganaI}
      onReturnToPath={() =>
        router.replace({
          pathname: '/learn/japanese/hiragana',
          params: { completed: ['a', 'i'] },
        })
      }
    />
  );
}
