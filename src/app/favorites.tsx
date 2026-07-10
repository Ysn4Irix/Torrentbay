import { EmptyState } from '@/components/ui/StateView';
import { Screen } from '@/components/ui/Screen';

export default function FavoritesScreen() {
  return (
    <Screen>
      <EmptyState
        title="No favorites yet"
        message="Favorites persistence will be added in Milestone 5."
      />
    </Screen>
  );
}
