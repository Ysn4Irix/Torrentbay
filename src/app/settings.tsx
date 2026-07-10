import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { Screen } from '@/components/ui/Screen';
import { APP_NAME, APP_VERSION } from '@/constants/app';

export default function SettingsScreen() {
  return (
    <Screen>
      <Card>
        <Text className="text-xl font-semibold text-foreground">
          {APP_NAME}
        </Text>
        <Text className="mt-2 text-muted">Version {APP_VERSION}</Text>
      </Card>
      <Card className="mt-4">
        <Text className="font-semibold text-foreground">
          Maintenance actions
        </Text>
        <Text className="mt-2 text-muted">
          Clear cache, favorites, and history controls are intentionally
          placeholders for Milestone 5.
        </Text>
      </Card>
    </Screen>
  );
}
