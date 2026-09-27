import { useRouter } from 'expo-router';

import { KanaCharacterLesson } from '@/components/kana-character-lesson';
import { hiraganaA } from '@/content/japanese/hiragana';

export default function HiraganaALessonScreen() {
  const router = useRouter();

  return (
    <KanaCharacterLesson
      character={hiraganaA}
      onReturnToPath={() =>
        router.replace({
          pathname: '/learn/japanese/hiragana',
          params: { completed: 'a' },
        })
      }
    />
  );
}
