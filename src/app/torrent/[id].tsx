import { useLocalSearchParams } from 'expo-router';

import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/StateView';
import { Text } from '@/components/ui/Text';
import { Screen } from '@/components/ui/Screen';

export default function TorrentDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <Screen>
      <Card>
        <Text className="text-2xl font-semibold text-foreground">
          Torrent details
        </Text>
        <Text className="mt-2 text-muted">ID: {id}</Text>
      </Card>
      <ErrorState
        className="mt-6"
        title="Details unavailable"
        message="Torrent metadata, magnet actions, and provider links are placeholders for future milestones."
      />
    </Screen>
  );
}
