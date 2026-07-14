import { Info, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Switch, View } from 'react-native';

import { BottomShortcuts } from '@/components/navigation/BottomShortcuts';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Screen } from '@/components/ui/Screen';
import { Snackbar } from '@/components/ui/Snackbar';
import { Text } from '@/components/ui/Text';
import { APP_NAME, APP_VERSION } from '@/constants/app';
import { colors } from '@/constants/theme';
import { useFavoritesStore } from '@/store/favoritesStore';
import { useHistoryStore } from '@/store/historyStore';
import { useSettingsStore } from '@/store/settingsStore';

type ConfirmAction = 'history' | 'favorites' | null;

function Section({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <Card className="mt-4 p-0 shadow-none">
      <View className="border-b border-border px-4 py-3">
        <Text className="text-sm font-semibold text-content-secondary">
          {title}
        </Text>
      </View>
      {children}
    </Card>
  );
}

function SettingsRow({
  title,
  description,
  destructive = false,
  onPress,
  right,
}: {
  title: string;
  description?: string;
  destructive?: boolean;
  onPress?: () => void;
  right?: React.ReactNode;
}) {
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      className="min-h-16 flex-row items-center gap-3 border-b border-border px-4 py-3 last:border-b-0 active:opacity-85"
      disabled={!onPress}
      onPress={onPress}
    >
      <View className="flex-1">
        <Text
          className={destructive ? 'font-semibold text-error' : 'font-semibold'}
        >
          {title}
        </Text>
        {description ? (
          <Text className="mt-1 text-sm text-content-secondary">
            {description}
          </Text>
        ) : null}
      </View>
      {right}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const showMatureCategories = useSettingsStore(
    (state) => state.showMatureCategories,
  );
  const confirmBeforeOpeningMagnetLinks = useSettingsStore(
    (state) => state.confirmBeforeOpeningMagnetLinks,
  );
  const openProviderPagesExternally = useSettingsStore(
    (state) => state.openProviderPagesExternally,
  );
  const setShowMatureCategories = useSettingsStore(
    (state) => state.setShowMatureCategories,
  );
  const setConfirmBeforeOpeningMagnetLinks = useSettingsStore(
    (state) => state.setConfirmBeforeOpeningMagnetLinks,
  );
  const setOpenProviderPagesExternally = useSettingsStore(
    (state) => state.setOpenProviderPagesExternally,
  );
  const clearHistory = useHistoryStore((state) => state.clearHistory);
  const clearFavorites = useFavoritesStore((state) => state.clearFavorites);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  function confirmDestructiveAction() {
    if (confirmAction === 'history') {
      clearHistory();
      setSnackbarMessage('Search history cleared');
    }

    if (confirmAction === 'favorites') {
      clearFavorites();
      setSnackbarMessage('Favorites cleared');
    }

    setConfirmAction(null);
  }

  const confirmTitle =
    confirmAction === 'favorites'
      ? 'Clear favorites?'
      : 'Clear search history?';
  const confirmMessage =
    confirmAction === 'favorites'
      ? 'This removes all locally saved torrent metadata from favorites.'
      : 'This removes all locally stored search history.';
  const confirmLabel =
    confirmAction === 'favorites' ? 'Clear favorites' : 'Clear history';

  return (
    <View className="flex-1 bg-background">
      <Screen contentClassName="pb-32 pt-5">
        <View className="flex-row items-center gap-3">
          <View className="h-11 w-11 items-center justify-center rounded-2xl bg-primary/15">
            <Info color={colors.primary} size={21} />
          </View>
          <View>
            <Text variant="h1">Settings</Text>
            <Text className="mt-1 text-sm text-content-secondary">
              Local preferences and storage controls.
            </Text>
          </View>
        </View>

        <Section title="Content Preferences">
          <SettingsRow
            description="Reveal mature-content categories in search filters. Hidden by default."
            right={
              <Switch
                accessibilityHint="Reveals mature-content categories in search filters when enabled."
                accessibilityLabel="Show mature-content categories"
                accessibilityRole="switch"
                accessibilityState={{ checked: showMatureCategories }}
                onValueChange={setShowMatureCategories}
                thumbColor={
                  showMatureCategories ? colors.primary : colors.textMuted
                }
                trackColor={{
                  false: colors.surfaceMuted,
                  true: colors.primarySoft,
                }}
                value={showMatureCategories}
              />
            }
            title="Show mature-content categories"
          />
        </Section>

        <Section title="Storage">
          <SettingsRow
            description="No separate network cache is currently stored."
            onPress={() => setSnackbarMessage('No cache to clear')}
            right={<Trash2 color={colors.textSecondary} size={18} />}
            title="Clear cache"
          />
          <SettingsRow
            destructive
            onPress={() => setConfirmAction('history')}
            right={<Trash2 color={colors.error} size={18} />}
            title="Clear search history"
          />
          <SettingsRow
            destructive
            onPress={() => setConfirmAction('favorites')}
            right={<Trash2 color={colors.error} size={18} />}
            title="Clear favorites"
          />
        </Section>

        <Section title="Behavior">
          <SettingsRow
            description="Ask before handing magnet links to another app."
            right={
              <Switch
                accessibilityHint="Asks for confirmation before passing magnet links to another app when enabled."
                accessibilityLabel="Confirm before opening magnet links"
                accessibilityRole="switch"
                accessibilityState={{
                  checked: confirmBeforeOpeningMagnetLinks,
                }}
                onValueChange={setConfirmBeforeOpeningMagnetLinks}
                thumbColor={
                  confirmBeforeOpeningMagnetLinks
                    ? colors.primary
                    : colors.textMuted
                }
                trackColor={{
                  false: colors.surfaceMuted,
                  true: colors.primarySoft,
                }}
                value={confirmBeforeOpeningMagnetLinks}
              />
            }
            title="Confirm before opening magnet links"
          />
          <SettingsRow
            description="Provider pages open in your external browser when selected."
            right={
              <Switch
                accessibilityHint="Opens provider pages in your external browser when enabled."
                accessibilityLabel="Open provider pages in external browser"
                accessibilityRole="switch"
                accessibilityState={{ checked: openProviderPagesExternally }}
                onValueChange={setOpenProviderPagesExternally}
                thumbColor={
                  openProviderPagesExternally
                    ? colors.primary
                    : colors.textMuted
                }
                trackColor={{
                  false: colors.surfaceMuted,
                  true: colors.primarySoft,
                }}
                value={openProviderPagesExternally}
              />
            }
            title="Open provider pages in external browser"
          />
        </Section>

        <Section title="Accessibility">
          <SettingsRow
            description="Animations follow the Android system Reduce motion preference by default."
            title="Reduce motion"
          />
          <SettingsRow
            description="Future option. Android system contrast settings are not changed without your intent."
            title="High-contrast mode"
          />
        </Section>

        <Section title="About">
          <SettingsRow
            title={APP_NAME}
            description={`Version ${APP_VERSION}`}
          />
          <SettingsRow
            description="TorrentBay indexes public metadata from an external provider. It does not host or download files."
            title="Data source"
          />
          <SettingsRow
            description="Search history, favorites, and settings are stored locally on this device."
            title="Privacy"
          />
          <SettingsRow
            description="TorrentBay is a search interface for publicly available metadata from an external provider. TorrentBay does not host files, download content, or verify the legality, safety, or accuracy of individual listings."
            title="Terms and legal notice"
          />
          <SettingsRow
            description="Open-source dependency licenses are provided by the application package metadata."
            title="Open-source licenses"
          />
        </Section>
      </Screen>
      <BottomShortcuts active="settings" />
      <ConfirmDialog
        confirmLabel={confirmLabel}
        destructive
        message={confirmMessage}
        onCancel={() => setConfirmAction(null)}
        onConfirm={confirmDestructiveAction}
        title={confirmTitle}
        visible={confirmAction !== null}
      />
      <Snackbar
        bottomOffset={88}
        message={snackbarMessage ?? ''}
        onDismiss={() => setSnackbarMessage(null)}
        visible={Boolean(snackbarMessage)}
      />
    </View>
  );
}
