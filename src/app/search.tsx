import { Link, useLocalSearchParams } from 'expo-router';

import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/StateView';
import { Text } from '@/components/ui/Text';
import { Screen } from '@/components/ui/Screen';

export default function SearchResultsScreen() {
  const { query } = useLocalSearchParams<{ query?: string }>();

  return (
    <Screen>
      <Text className="text-2xl font-semibold text-foreground">Results</Text>
      <Text className="mt-2 text-muted">Query: {query ?? 'Not provided'}</Text>
      <EmptyState
        className="mt-6"
        title="Search pipeline pending"
        message="Milestone 1 only wires the route and reusable states. Scraping and results arrive in later milestones."
      />
      <Link href="/torrent/placeholder" asChild>
        <Button className="mt-6" label="Open placeholder details" />
      </Link>
    </Screen>
  );
}
