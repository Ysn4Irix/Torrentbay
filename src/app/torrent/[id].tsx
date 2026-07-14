import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Bookmark,
  Copy,
  ExternalLink,
  Magnet,
  MoreVertical,
  Share2,
} from 'lucide-react-native';
import { ReactNode, useState } from 'react';
import {
  Linking,
  Modal,
  Pressable,
  Share as NativeShare,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { IconButton } from '@/components/ui/IconButton';
import { Screen } from '@/components/ui/Screen';
import { Snackbar } from '@/components/ui/Snackbar';
import { ErrorState } from '@/components/ui/StateView';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/theme';
import {
  deriveTorrentHealth,
  StatusBadge,
} from '@/features/torrents/components/StatusBadge';
import { Torrent } from '@/models/torrent';
import { useFavoritesStore } from '@/store/favoritesStore';
import { useSearchStore } from '@/store/searchStore';
import { useSettingsStore } from '@/store/settingsStore';
import { isMatureTorrent } from '@/utils/torrentMaturity';

type PendingMagnetAction = 'open' | 'copy' | 'share' | null;

const numberFormatter = new Intl.NumberFormat();

function normalizeRouteParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeText(value?: string): string | undefined {
  const text = value?.replace(/\s+/g, ' ').trim();
  return text || undefined;
}

function getTitle(torrent: Torrent): string {
  return normalizeText(torrent.name) ?? 'Untitled torrent';
}

function formatMetric(value?: number): string {
  return typeof value === 'number'
    ? numberFormatter.format(value)
    : 'Not available';
}

function formatRatio(seeders?: number, leechers?: number): string {
  if (
    typeof seeders !== 'number' ||
    typeof leechers !== 'number' ||
    leechers <= 0
  ) {
    return 'Not available';
  }

  return `${(seeders / leechers).toFixed(2)}:1`;
}

function getRatioAccessibilityLabel(
  seeders?: number,
  leechers?: number,
): string {
  if (
    typeof seeders !== 'number' ||
    typeof leechers !== 'number' ||
    leechers <= 0
  ) {
    return 'Seeder ratio not available';
  }

  return `Seeder ratio ${(seeders / leechers).toFixed(2)} to 1`;
}

function getCountAccessibilityLabel(
  value: number | undefined,
  availableLabel: string,
  unavailableLabel: string,
): string {
  return typeof value === 'number'
    ? `${numberFormatter.format(value)} ${availableLabel}`
    : `${unavailableLabel} not available`;
}

function getHealthAccessibilityLabel(
  health: ReturnType<typeof deriveTorrentHealth>,
): string {
  const labels: Record<ReturnType<typeof deriveTorrentHealth>, string> = {
    active: 'Active',
    healthy: 'Healthy',
    inactive: 'Inactive',
    low: 'Low',
    unknown: 'Unknown',
  };

  return `Health summary: ${labels[health]}`;
}

function decodeHtmlEntities(value: string): string {
  const namedEntities: Record<string, string> = {
    amp: '&',
    apos: "'",
    gt: '>',
    lt: '<',
    nbsp: ' ',
    quot: '"',
  };

  return value.replace(/&(#x?[\da-f]+|[a-z]+);/gi, (entity, code: string) => {
    const named = namedEntities[code.toLowerCase()];

    if (named) {
      return named;
    }

    if (code.startsWith('#x')) {
      return String.fromCodePoint(Number.parseInt(code.slice(2), 16));
    }

    if (code.startsWith('#')) {
      return String.fromCodePoint(Number.parseInt(code.slice(1), 10));
    }

    return entity;
  });
}

function sanitizeDescription(value?: string): string | undefined {
  const text = value
    ?.replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<\s*br\s*\/?\s*>/gi, '\n')
    .replace(/<\s*\/\s*p\s*>/gi, '\n\n')
    .replace(/<[^>]+>/g, ' ');

  if (!text) {
    return undefined;
  }

  const decoded = decodeHtmlEntities(text)
    .replace(/\r\n?/g, '\n')
    .replace(/[\t ]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return decoded || undefined;
}

function MetadataRow({ label, value }: { label: string; value?: string }) {
  return (
    <View className="border-b border-border py-3 last:border-b-0">
      <Text className="text-content-secondary" variant="small">
        {label}
      </Text>
      <Text className="mt-1" selectable variant="bodyStrong">
        {normalizeText(value) ?? 'Not available'}
      </Text>
    </View>
  );
}

function HealthMetric({
  accessibilityLabel,
  label,
  value,
}: {
  accessibilityLabel: string;
  label: string;
  value: string;
}) {
  return (
    <View
      accessibilityLabel={accessibilityLabel}
      accessible
      className="min-w-[112px] flex-1 rounded-md border border-border bg-surface-muted p-3"
    >
      <Text
        className="text-xl font-bold leading-[26px]"
        style={{ fontVariant: ['tabular-nums'] }}
      >
        {value}
      </Text>
      <Text className="mt-1 text-content-secondary" variant="small">
        {label}
      </Text>
    </View>
  );
}

function Section({ children, title }: { children: ReactNode; title: string }) {
  return (
    <Card className="mt-4 p-4 shadow-none">
      <Text variant="h3">{title}</Text>
      <View className="mt-3">{children}</View>
    </Card>
  );
}

export default function TorrentDetailsScreen() {
  const insets = useSafeAreaInsets();
  const { id: routeId } = useLocalSearchParams<{ id?: string | string[] }>();
  const id = normalizeRouteParam(routeId);
  const searchResults = useSearchStore((state) => state.results);
  const favorites = useFavoritesStore((state) => state.favorites);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const confirmBeforeOpeningMagnetLinks = useSettingsStore(
    (state) => state.confirmBeforeOpeningMagnetLinks,
  );
  const magnetNoticeAcknowledged = useSettingsStore(
    (state) => state.magnetNoticeAcknowledged,
  );
  const openProviderPagesExternally = useSettingsStore(
    (state) => state.openProviderPagesExternally,
  );
  const showMatureCategories = useSettingsStore(
    (state) => state.showMatureCategories,
  );
  const acknowledgeMagnetNotice = useSettingsStore(
    (state) => state.acknowledgeMagnetNotice,
  );
  const currentStoreTorrent =
    searchResults.find((item) => item.id === id) ??
    favorites.find((item) => item.id === id);
  const visibleStoreTorrent =
    currentStoreTorrent &&
    (showMatureCategories || !isMatureTorrent(currentStoreTorrent))
      ? currentStoreTorrent
      : undefined;
  const [torrentSnapshot, setTorrentSnapshot] = useState<Torrent | undefined>(
    visibleStoreTorrent,
  );
  const [pendingAction, setPendingAction] = useState<PendingMagnetAction>(null);
  const [overflowVisible, setOverflowVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  const visibleTorrentSnapshot =
    torrentSnapshot &&
    (showMatureCategories || !isMatureTorrent(torrentSnapshot))
      ? torrentSnapshot
      : undefined;
  const torrent = visibleStoreTorrent ?? visibleTorrentSnapshot;

  function showSnackbar(message: string) {
    setSnackbarMessage(message);
  }

  async function openUrl(url: string, failureMessage: string) {
    try {
      await Linking.openURL(url);
    } catch {
      showSnackbar(failureMessage);
    }
  }

  async function runMagnetAction(action: Exclude<PendingMagnetAction, null>) {
    if (!torrent?.magnet) {
      showSnackbar('Magnet link not available');
      return;
    }

    if (action === 'open') {
      await openUrl(torrent.magnet, 'No app could open this magnet link');
      return;
    }

    if (action === 'copy') {
      await Clipboard.setStringAsync(torrent.magnet);
      showSnackbar('Copied magnet link');
      return;
    }

    try {
      await NativeShare.share({ message: torrent.magnet });
      showSnackbar('Share sheet opened');
    } catch {
      showSnackbar('Magnet link could not be shared');
    }
  }

  function requestMagnetAction(action: Exclude<PendingMagnetAction, null>) {
    if (
      action === 'open' &&
      confirmBeforeOpeningMagnetLinks &&
      !magnetNoticeAcknowledged
    ) {
      setPendingAction(action);
      return;
    }

    void runMagnetAction(action);
  }

  function confirmPendingMagnetAction() {
    const action = pendingAction;

    if (!action) {
      return;
    }

    acknowledgeMagnetNotice();
    setPendingAction(null);
    void runMagnetAction(action);
  }

  function toggleTorrentFavorite() {
    if (!torrent) {
      return;
    }

    setTorrentSnapshot(torrent);
    const added = toggleFavorite(torrent);
    showSnackbar(added ? 'Added to favorites' : 'Removed from favorites');
  }

  if (!torrent) {
    return (
      <View className="flex-1 bg-background">
        <Screen contentClassName="py-4">
          <View className="min-h-14 flex-row items-center gap-3">
            <IconButton
              accessibilityLabel="Go back"
              onPress={() => router.back()}
            >
              <ArrowLeft color={colors.textPrimary} size={20} />
            </IconButton>
            <Text className="flex-1" variant="h3">
              Torrent details
            </Text>
          </View>
          <ErrorState
            className="mt-4"
            title="Details unavailable"
            message="This torrent is not available in the current search results or local favorites. Return to search and open the result again."
            actionLabel="Back to search"
            onAction={() => router.back()}
          />
        </Screen>
      </View>
    );
  }

  const title = getTitle(torrent);
  const category = normalizeText(torrent.category);
  const subcategory = normalizeText(torrent.subcategory);
  const uploaded = normalizeText(torrent.uploaded);
  const size = normalizeText(torrent.size);
  const uploader = normalizeText(torrent.uploader);
  const description = sanitizeDescription(torrent.description);
  const isFavorite = favorites.some((item) => item.id === torrent.id);
  const health = deriveTorrentHealth(torrent.seeders);
  const canUseMagnet = Boolean(torrent.magnet);
  const canOpenProvider = Boolean(
    torrent.detailsUrl && openProviderPagesExternally,
  );

  return (
    <View className="flex-1 bg-background">
      <Screen contentClassName="py-4 pb-8">
        <View className="min-h-14 flex-row items-center gap-2">
          <IconButton
            accessibilityLabel="Go back"
            onPress={() => router.back()}
          >
            <ArrowLeft color={colors.textPrimary} size={20} />
          </IconButton>
          <Text className="flex-1" variant="h3">
            Torrent details
          </Text>
          <IconButton
            accessibilityLabel={
              isFavorite
                ? `Remove ${title} torrent from favorites`
                : `Add ${title} torrent to favorites`
            }
            accessibilityState={{ checked: isFavorite }}
            onPress={toggleTorrentFavorite}
          >
            <Bookmark
              color={isFavorite ? colors.primary : colors.textSecondary}
              fill={isFavorite ? colors.primary : 'transparent'}
              size={20}
            />
          </IconButton>
          <IconButton
            accessibilityLabel={`Share magnet link for ${title}`}
            disabled={!canUseMagnet}
            onPress={() => requestMagnetAction('share')}
          >
            <Share2 color={colors.textSecondary} size={20} />
          </IconButton>
          <IconButton
            accessibilityLabel="More torrent actions"
            accessibilityState={{ expanded: overflowVisible }}
            onPress={() => setOverflowVisible(true)}
          >
            <MoreVertical color={colors.textSecondary} size={20} />
          </IconButton>
        </View>

        <View className="mt-4 flex-row flex-wrap gap-1.5">
          <StatusBadge label={category} type="category" />
          <StatusBadge label={subcategory} type="subcategory" />
          {torrent.trusted ? <StatusBadge type="trusted" /> : null}
          {torrent.vip ? <StatusBadge type="vip" /> : null}
        </View>

        <Text className="mt-3 text-2xl font-bold leading-[30px]">{title}</Text>

        <Card className="mt-4 p-4 shadow-none">
          <View className="flex-row flex-wrap gap-3">
            <HealthMetric
              accessibilityLabel={getCountAccessibilityLabel(
                torrent.seeders,
                'seeders',
                'Seeders',
              )}
              label="Seeders"
              value={formatMetric(torrent.seeders)}
            />
            <HealthMetric
              accessibilityLabel={getCountAccessibilityLabel(
                torrent.leechers,
                'leechers',
                'Leechers',
              )}
              label="Leechers"
              value={formatMetric(torrent.leechers)}
            />
            <HealthMetric
              accessibilityLabel={getRatioAccessibilityLabel(
                torrent.seeders,
                torrent.leechers,
              )}
              label="Seeder ratio"
              value={formatRatio(torrent.seeders, torrent.leechers)}
            />
          </View>
          <View
            accessibilityLabel={getHealthAccessibilityLabel(health)}
            accessible
            className="mt-3 flex-row flex-wrap items-center gap-2"
          >
            <Text className="text-content-secondary" variant="small">
              Health signal
            </Text>
            <StatusBadge health={health} type="health" />
          </View>
        </Card>

        <Section title="Metadata">
          <MetadataRow label="Category" value={category} />
          <MetadataRow label="Subcategory" value={subcategory} />
          <MetadataRow label="Uploaded" value={uploaded} />
          <MetadataRow label="Size" value={size} />
          <MetadataRow label="Uploader" value={uploader} />
          <MetadataRow label="Source" value="External provider" />
        </Section>

        <Section title="Description">
          <Text
            className="text-content-secondary"
            numberOfLines={descriptionExpanded ? undefined : 8}
            selectable
          >
            {description ?? 'Not available'}
          </Text>
          {description && description.length > 520 ? (
            <Pressable
              accessibilityLabel={
                descriptionExpanded
                  ? 'Show less description'
                  : 'Show more description'
              }
              accessibilityRole="button"
              accessibilityState={{ expanded: descriptionExpanded }}
              className="mt-3 min-h-10 justify-center self-start rounded-md px-1 active:opacity-85"
              hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
              onPress={() => setDescriptionExpanded((expanded) => !expanded)}
            >
              <Text className="font-semibold text-primary">
                {descriptionExpanded ? 'Show less' : 'Show more'}
              </Text>
            </Pressable>
          ) : null}
        </Section>

        <Card className="mt-4 gap-3 p-4 shadow-none">
          <Button
            accessibilityLabel={`Open magnet link for ${title}`}
            disabled={!canUseMagnet}
            label="Open magnet link"
            leftIcon={<Magnet color={colors.background} size={19} />}
            onPress={() => requestMagnetAction('open')}
          />
          <Text className="text-sm leading-[20px] text-content-secondary">
            Copying or sharing a magnet link hands it off to another app.
            TorrentBay does not download content.
          </Text>
          <View className="gap-3">
            <Button
              accessibilityLabel={`Copy magnet link for ${title}`}
              disabled={!canUseMagnet}
              label="Copy magnet link"
              leftIcon={<Copy color={colors.textPrimary} size={18} />}
              onPress={() => requestMagnetAction('copy')}
              variant="secondary"
            />
            <Button
              accessibilityLabel={`Share magnet link for ${title}`}
              disabled={!canUseMagnet}
              label="Share magnet link"
              leftIcon={<Share2 color={colors.textPrimary} size={18} />}
              onPress={() => requestMagnetAction('share')}
              variant="secondary"
            />
            <Button
              accessibilityHint={
                openProviderPagesExternally
                  ? 'Opens an external website in your browser.'
                  : 'Enable provider pages in Settings to open external provider links.'
              }
              accessibilityLabel="Open provider page"
              disabled={!canOpenProvider}
              label="Open provider page"
              leftIcon={<ExternalLink color={colors.textPrimary} size={18} />}
              onPress={() =>
                torrent.detailsUrl
                  ? void openUrl(
                      torrent.detailsUrl,
                      'Provider page could not be opened',
                    )
                  : showSnackbar('Provider page not available')
              }
              variant="secondary"
            />
          </View>
        </Card>

        <Card className="mt-4 border-info/35 p-4 shadow-none">
          <Text className="text-sm leading-[20px] text-content-secondary">
            TorrentBay is a search interface for publicly available metadata
            from an external provider. TorrentBay does not host files, download
            content, or verify the legality, safety, or accuracy of individual
            listings.
          </Text>
        </Card>
      </Screen>

      <ConfirmDialog
        confirmLabel="Continue"
        message="This will pass the magnet link to another app installed on your device. TorrentBay does not download the content."
        onCancel={() => setPendingAction(null)}
        onConfirm={confirmPendingMagnetAction}
        title="Open magnet link?"
        visible={pendingAction === 'open'}
      />
      <Modal
        animationType="fade"
        onRequestClose={() => setOverflowVisible(false)}
        transparent
        visible={overflowVisible}
      >
        <View
          className="flex-1 justify-end px-4"
          style={{
            backgroundColor: colors.scrim,
            paddingBottom: Math.max(insets.bottom, 16),
          }}
        >
          <Pressable
            accessibilityLabel="Dismiss torrent actions"
            accessibilityRole="button"
            className="absolute inset-0"
            onPress={() => setOverflowVisible(false)}
          />
          <View className="rounded-xl border border-border bg-surface-elevated p-4">
            <Text variant="h3">Torrent actions</Text>
            <View className="mt-3 gap-3">
              <Button
                accessibilityLabel={`Copy magnet link for ${title}`}
                disabled={!canUseMagnet}
                label="Copy magnet link"
                leftIcon={<Copy color={colors.textPrimary} size={18} />}
                onPress={() => {
                  setOverflowVisible(false);
                  requestMagnetAction('copy');
                }}
                variant="secondary"
              />
              <Button
                accessibilityHint={
                  openProviderPagesExternally
                    ? 'Opens an external website in your browser.'
                    : 'Enable provider pages in Settings to open external provider links.'
                }
                accessibilityLabel="Open provider page"
                disabled={!canOpenProvider}
                label="Open provider page"
                leftIcon={<ExternalLink color={colors.textPrimary} size={18} />}
                onPress={() => {
                  setOverflowVisible(false);

                  if (torrent.detailsUrl) {
                    void openUrl(
                      torrent.detailsUrl,
                      'Provider page could not be opened',
                    );
                    return;
                  }

                  showSnackbar('Provider page not available');
                }}
                variant="secondary"
              />
              <Button
                accessibilityLabel={
                  isFavorite
                    ? `Remove ${title} torrent from favorites`
                    : `Add ${title} torrent to favorites`
                }
                label={isFavorite ? 'Remove favorite' : 'Add favorite'}
                leftIcon={
                  <Bookmark
                    color={colors.textPrimary}
                    fill={isFavorite ? colors.textPrimary : 'transparent'}
                    size={18}
                  />
                }
                onPress={() => {
                  setOverflowVisible(false);
                  toggleTorrentFavorite();
                }}
                variant="secondary"
              />
            </View>
          </View>
        </View>
      </Modal>
      <Snackbar
        message={snackbarMessage ?? ''}
        onDismiss={() => setSnackbarMessage(null)}
        visible={Boolean(snackbarMessage)}
      />
    </View>
  );
}
