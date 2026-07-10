import { View } from 'react-native';

import { BottomShortcuts } from '@/components/navigation/BottomShortcuts';
import { EmptyState } from '@/components/ui/StateView';
import { Screen } from '@/components/ui/Screen';

export default function FavoritesScreen() {
  return (
    <View className="flex-1 bg-background">
      <Screen contentClassName="pb-32">
        <EmptyState
          title="No favorites yet"
          message="Favorites persistence will be added in Milestone 5."
        />
      </Screen>
      <BottomShortcuts active="favorites" />
    </View>
  );
}
