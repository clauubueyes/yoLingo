import { useRouter } from 'expo-router';

import { KanaCharacterLesson } from '@/components/kana-character-lesson';
import { hiraganaU } from '@/content/japanese/hiragana';

export default function HiraganaULessonScreen() {
  const router = useRouter();

  return (
    <KanaCharacterLesson
      nextCharacter={{ symbol: 'え', onContinue: () => router.replace('/learn/japanese/hiragana/e') }}
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
