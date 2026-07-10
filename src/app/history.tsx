import { router } from 'expo-router';
import { Clock3, Search } from 'lucide-react-native';
import { View } from 'react-native';

import { BottomShortcuts } from '@/components/navigation/BottomShortcuts';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/StateView';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/theme';
import { useSearchStore } from '@/store/searchStore';

export default function HistoryScreen() {
  const recentSearches = useSearchStore((state) => state.recentSearches);
  const setInputQuery = useSearchStore((state) => state.setInputQuery);

  function searchAgain(query: string) {
    setInputQuery(query);
    router.push({ pathname: '/search', params: { query } });
  }

  return (
    <View className="flex-1 bg-background">
      <Screen contentClassName="pb-32">
        <View className="flex-row items-center gap-3">
          <View className="h-11 w-11 items-center justify-center rounded-2xl bg-primary/15">
            <Clock3 color={colors.primarySoft} size={21} />
          </View>
          <View className="flex-1">
            <Text className="text-xl font-bold text-foreground">History</Text>
            <Text className="mt-1 text-sm text-muted">
              Recent searches from this session.
            </Text>
          </View>
        </View>

        <Card className="mt-5 p-4 shadow-none">
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-semibold text-foreground">
              Recent Searches
            </Text>
            <Search color={colors.muted} size={17} />
          </View>

          {recentSearches.length > 0 ? (
            <View className="mt-4 flex-row flex-wrap gap-2">
              {recentSearches.map((recent) => (
                <Chip
                  accessibilityLabel={`Search again for ${recent}`}
                  className="min-h-9 px-3 py-1"
                  key={recent}
                  label={recent}
                  onPress={() => searchAgain(recent)}
                />
              ))}
            </View>
          ) : (
            <EmptyState
              title="No history yet"
              message="Searches you run will appear here for quick access."
            />
          )}
        </Card>
      </Screen>
      <BottomShortcuts active="history" />
    </View>
  );
}
