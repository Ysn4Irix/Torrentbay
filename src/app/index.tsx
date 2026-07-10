import { Link } from 'expo-router';
import { Search } from 'lucide-react-native';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { APP_NAME, APP_TAGLINE } from '@/constants/app';
import { colors } from '@/constants/theme';

export default function SplashScreen() {
  return (
    <Screen centered>
      <Search color={colors.primary} size={56} strokeWidth={2.4} />
      <Text className="mt-6 text-center text-4xl font-bold text-foreground">
        {APP_NAME}
      </Text>
      <Text className="mt-3 text-center text-base text-muted">
        {APP_TAGLINE}
      </Text>
      <Link href="/home" asChild>
        <Button className="mt-8" label="Enter app" />
      </Link>
    </Screen>
  );
}
