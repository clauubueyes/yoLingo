import { useRouter } from 'expo-router';

import { KanaCharacterLesson } from '@/components/kana-character-lesson';
import { hiraganaU } from '@/content/japanese/hiragana';

export default function HiraganaULessonScreen() {
  const router = useRouter();

  return (
    <KanaCharacterLesson
      character={hiraganaU}
      onReturnToPath={() =>
        router.replace({
          pathname: '/learn/japanese/hiragana',
          params: { completed: ['a', 'i', 'u'] },
        })
      }
    />
  );
}
