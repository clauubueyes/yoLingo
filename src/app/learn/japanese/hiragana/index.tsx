import { Image } from 'expo-image';
import { Platform, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackButton } from '@/components/back-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { hiraganaPath, type HiraganaPathItem } from '@/content/japanese/hiragana-path';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type PathState = 'introduction' | 'current' | 'locked';

export default function HiraganaPathScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 960;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          alwaysBounceVertical={false}
          contentContainerStyle={[styles.content, isDesktop && styles.desktopContent]}>
          <View style={[styles.topBar, isDesktop && styles.desktopTopBar]}>
            <BackButton
              accessibilityLabel="Volver a seleccionar idioma"
              fallbackHref="/select-language"
            />
            <View style={styles.brand}>
              <Image
                accessible={false}
                contentFit="contain"
                source={require('@/assets/images/welcome/logo.png')}
                style={styles.logo}
              />
              <ThemedText style={styles.brandName}>yoLingo</ThemedText>
            </View>
          </View>

          <View style={[styles.main, isDesktop && styles.desktopMain]}>
            <View style={[styles.introduction, isDesktop && styles.desktopIntroduction]}>
              <ThemedText themeColor="decorationPurple" style={styles.eyebrow}>
                JAPONÉS · PRIMEROS PASOS
              </ThemedText>
              <ThemedText accessibilityRole="header" style={[styles.title, isDesktop && styles.desktopTitle]}>
                Hiragana
              </ThemedText>
              <ThemedText themeColor="textSecondary" style={[styles.description, isDesktop && styles.desktopDescription]}>
                Aprende cada grupo poco a poco: reconoce el sonido, observa los trazos y practica su escritura.
              </ThemedText>

              <ThemedView type="backgroundSelected" style={styles.nextStep}>
                <ThemedText style={styles.nextStepLabel}>TU PRÓXIMO PASO</ThemedText>
                <ThemedText style={styles.nextStepTitle}>Vocales · あいうえお</ThemedText>
                <ThemedText themeColor="textSecondary" style={styles.nextStepDescription}>
                  Empezarás por あ y avanzarás un carácter cada vez.
                </ThemedText>
              </ThemedView>
            </View>

            <View accessibilityLabel="Ruta de aprendizaje de Hiragana" style={styles.path}>
              {hiraganaPath.map((item, index) => {
                const state: PathState =
                  item.kind === 'introduction' ? 'introduction' : item.id === 'vowels' ? 'current' : 'locked';

                return (
                  <PathItem
                    isLast={index === hiraganaPath.length - 1}
                    item={item}
                    key={item.id}
                    state={state}
                  />
                );
              })}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function PathItem({
  isLast,
  item,
  state,
}: {
  isLast: boolean;
  item: HiraganaPathItem;
  state: PathState;
}) {
  const theme = useTheme();
  const isCurrent = state === 'current';
  const isLocked = state === 'locked';
  const status = state === 'introduction' ? 'Orientación' : isCurrent ? 'Empieza aquí' : 'Bloqueado';

  return (
    <View
      accessibilityLabel={`${item.title}. ${item.description}. ${status}`}
      style={styles.pathRow}>
      <View style={styles.markerColumn}>
        <View
          style={[
            styles.marker,
            {
              backgroundColor: isCurrent ? theme.backgroundSelected : theme.backgroundElement,
              borderColor: isCurrent ? theme.accent : theme.backgroundSelected,
              opacity: isLocked ? 0.62 : 1,
            },
          ]}>
          <ThemedText
            style={[
              styles.markerSymbol,
              { color: isCurrent ? theme.decorationPurple : theme.textSecondary },
            ]}>
            {item.symbol}
          </ThemedText>
        </View>
        {!isLast && (
          <View
            style={[
              styles.connector,
              { backgroundColor: isCurrent ? theme.accent : theme.backgroundSelected },
            ]}
          />
        )}
      </View>

      <View style={[styles.pathDetails, { opacity: isLocked ? 0.62 : 1 }]}>
        <View style={styles.pathHeading}>
          <ThemedText style={styles.pathTitle}>{item.title}</ThemedText>
          <ThemedText
            style={[
              styles.status,
              { color: isCurrent ? theme.accentPressed : theme.textSecondary },
            ]}>
            {status}
          </ThemedText>
        </View>
        <ThemedText themeColor="textSecondary" style={styles.pathDescription}>
          {item.description}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center' },
  safeArea: { flex: 1, width: '100%', maxWidth: 1280 },
  content: { flexGrow: 1, padding: Spacing.three, paddingBottom: 48 },
  topBar: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logo: { width: 34, aspectRatio: 62 / 53 },
  brandName: { fontSize: 28, lineHeight: 34, fontWeight: 800 },
  main: { width: '100%', alignItems: 'center', gap: Spacing.five, paddingTop: Spacing.four },
  introduction: { width: '100%', maxWidth: 620, gap: 10 },
  eyebrow: { fontSize: 12, lineHeight: 17, fontWeight: 800, letterSpacing: 1 },
  title: { fontSize: 36, lineHeight: 43, fontWeight: 800 },
  description: { fontSize: 16, lineHeight: 24 },
  nextStep: { marginTop: Spacing.three, borderRadius: 22, padding: Spacing.three, gap: 5 },
  nextStepLabel: { fontSize: 11, lineHeight: 16, fontWeight: 800, letterSpacing: 1 },
  nextStepTitle: { fontSize: 20, lineHeight: 27, fontWeight: 800 },
  nextStepDescription: { fontSize: 14, lineHeight: 20 },
  path: { width: '100%', maxWidth: 620 },
  pathRow: { minHeight: 112, flexDirection: 'row', gap: Spacing.three },
  markerColumn: { width: 76, alignItems: 'center' },
  marker: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerSymbol: { fontSize: 34, lineHeight: 44, fontWeight: 700 },
  connector: { width: 6, flex: 1, minHeight: 28, marginVertical: 5, borderRadius: 3 },
  pathDetails: { flex: 1, paddingTop: 9, gap: 4 },
  pathHeading: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', justifyContent: 'space-between', gap: 6 },
  pathTitle: { fontSize: 21, lineHeight: 28, fontWeight: 800 },
  status: { fontSize: 12, lineHeight: 17, fontWeight: 700 },
  pathDescription: { fontSize: 16, lineHeight: 23 },
  desktopContent: { paddingHorizontal: 48, paddingTop: Spacing.four, paddingBottom: 64 },
  desktopTopBar: { justifyContent: 'flex-start', gap: Spacing.three },
  desktopMain: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 72, paddingTop: 64 },
  desktopIntroduction: { flex: 1, maxWidth: 500, paddingTop: Spacing.four },
  desktopTitle: { fontSize: 52, lineHeight: 60 },
  desktopDescription: { fontSize: 18, lineHeight: 28 },
});
