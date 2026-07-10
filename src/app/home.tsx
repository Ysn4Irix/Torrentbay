import { Link, router } from 'expo-router';
import { Bookmark, Search, Settings } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/StateView';
import { Text } from '@/components/ui/Text';
import { Screen } from '@/components/ui/Screen';
import { colors } from '@/constants/theme';

export default function HomeScreen() {
  return (
    <Screen>
      <View className="flex-row justify-end gap-3">
        <Link href="/favorites" asChild>
          <Pressable
            accessibilityLabel="Open favorites"
            className="rounded-full bg-surface p-3"
          >
            <Bookmark color={colors.foreground} size={20} />
          </Pressable>
        </Link>
        <Link href="/settings" asChild>
          <Pressable
            accessibilityLabel="Open settings"
            className="rounded-full bg-surface p-3"
          >
            <Settings color={colors.foreground} size={20} />
          </Pressable>
        </Link>
      </View>

      <Card className="mt-8">
        <Search color={colors.primary} size={28} />
        <Text className="mt-4 text-2xl font-semibold text-foreground">
          Search torrents
        </Text>
        <Text className="mt-2 text-muted">
          Search input and scraping are placeholders for later milestones.
        </Text>
        <Button
          className="mt-6"
          label="View placeholder results"
          onPress={() => router.push('/search?query=placeholder')}
        />
      </Card>

      <EmptyState
        className="mt-6"
        title="No recent searches"
        message="Recent searches will appear here after persistence is implemented."
      />
    </Screen>
  );
}
