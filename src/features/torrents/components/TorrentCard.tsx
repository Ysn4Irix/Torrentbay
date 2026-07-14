import { memo } from 'react';
import {
  Bookmark,
  ChevronRight,
  Magnet,
  MoreVertical,
} from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { IconButton } from '@/components/ui/IconButton';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/theme';
import { Torrent } from '@/models/torrent';
import { cn } from '@/utils/cn';

import { MetricPill } from './MetricPill';
import { deriveTorrentHealth, StatusBadge } from './StatusBadge';

export type TorrentCardVariant =
  'standard' | 'compact' | 'favorite' | 'skeleton';

export type TorrentCardProps = {
  torrent?: Torrent;
  variant?: TorrentCardVariant;
  favorite?: boolean;
  cached?: boolean;
  className?: string;
  onPress?: (torrent: Torrent) => void;
  onDetailsPress?: (torrent: Torrent) => void;
  onMagnetPress?: (torrent: Torrent) => void;
  onFavoritePress?: (torrent: Torrent) => void;
  onOverflowPress?: (torrent: Torrent) => void;
  showSwarmStats?: boolean;
};

function normalizeText(value?: string): string | undefined {
  const text = value?.replace(/\s+/g, ' ').trim();
  return text || undefined;
}

function getTitle(torrent: Torrent): string {
  return normalizeText(torrent.name) ?? 'Untitled torrent';
}

function callIfReady(
  torrent: Torrent | undefined,
  handler?: (torrent: Torrent) => void,
) {
  if (torrent && handler) {
    handler(torrent);
  }
}

function TorrentCardSkeleton({ className }: { className?: string }) {
  return (
    <View
      accessibilityLabel="Loading torrent result"
      accessible
      className={cn(
        'mb-3 rounded-lg border border-border bg-surface-elevated p-4',
        className,
      )}
    >
      <View className="flex-row justify-between gap-3">
        <View className="h-7 w-24 rounded-sm bg-surface-muted" />
        <View className="h-7 w-20 rounded-sm bg-surface-muted" />
      </View>
      <View className="mt-4 h-5 w-11/12 rounded-sm bg-surface-muted" />
      <View className="mt-2 h-5 w-8/12 rounded-sm bg-surface-muted" />
      <View className="mt-4 flex-row gap-2">
        <View className="h-8 w-20 rounded-full bg-surface-muted" />
        <View className="h-8 w-24 rounded-full bg-surface-muted" />
        <View className="h-8 w-16 rounded-full bg-surface-muted" />
      </View>
      <View className="mt-4 flex-row gap-3">
        <View className="h-12 flex-1 rounded-md bg-surface-muted" />
        <View className="h-12 w-28 rounded-md bg-surface-muted" />
      </View>
    </View>
  );
}

function FavoriteControl({
  favorite = false,
  onPress,
  title,
}: {
  favorite?: boolean;
  onPress?: () => void;
  title: string;
}) {
  return (
    <IconButton
      accessibilityLabel={
        favorite
          ? `Remove ${title} torrent from favorites`
          : `Add ${title} torrent to favorites`
      }
      accessibilityState={{ checked: favorite, disabled: !onPress }}
      className="border-transparent bg-transparent"
      disabled={!onPress}
      onPress={onPress}
    >
      <Bookmark
        color={favorite ? colors.primary : colors.textSecondary}
        fill={favorite ? colors.primary : 'transparent'}
        size={21}
      />
    </IconButton>
  );
}

function TorrentCardComponent({
  torrent,
  variant = 'standard',
  favorite = false,
  cached = false,
  className,
  onPress,
  onDetailsPress,
  onMagnetPress,
  onFavoritePress,
  onOverflowPress,
  showSwarmStats = true,
}: TorrentCardProps) {
  if (variant === 'skeleton' || !torrent) {
    return <TorrentCardSkeleton className={className} />;
  }

  const title = getTitle(torrent);
  const category = normalizeText(torrent.category);
  const subcategory = normalizeText(torrent.subcategory);
  const uploaded = normalizeText(torrent.uploaded);
  const size = normalizeText(torrent.size);
  const uploader = normalizeText(torrent.uploader);
  const health = deriveTorrentHealth(torrent.seeders);
  const detailsHandler = onDetailsPress ?? onPress;
  const isCompact = variant === 'compact' || variant === 'favorite';
  const canOpenMagnet = Boolean(torrent.magnet && onMagnetPress);

  if (isCompact) {
    return (
      <Pressable
        accessibilityLabel={`Open torrent details for ${title}`}
        accessibilityRole="button"
        className={cn(
          'mb-2 rounded-lg border border-border bg-surface-elevated p-3 active:opacity-85',
          className,
        )}
        onPress={() => callIfReady(torrent, detailsHandler)}
      >
        <View className="flex-row items-start gap-3">
          <View className="flex-1">
            <Text
              className="text-[15px] font-semibold leading-[21px]"
              numberOfLines={2}
            >
              {title}
            </Text>
            <View className="mt-2 flex-row flex-wrap gap-1.5">
              <StatusBadge label={category} type="category" />
              {cached || variant === 'favorite' ? (
                <StatusBadge type="cached" />
              ) : null}
              <MetricPill compact type="size" value={size} />
              {showSwarmStats ? (
                <>
                  <MetricPill compact type="seeders" value={torrent.seeders} />
                  <MetricPill
                    compact
                    type="leechers"
                    value={torrent.leechers}
                  />
                </>
              ) : null}
            </View>
          </View>
          <FavoriteControl
            favorite={favorite}
            onPress={
              onFavoritePress ? () => onFavoritePress(torrent) : undefined
            }
            title={title}
          />
          {variant === 'favorite' ? (
            <ChevronRight color={colors.textMuted} size={20} />
          ) : null}
        </View>
      </Pressable>
    );
  }

  return (
    <View
      accessibilityLabel={`Torrent result ${title}`}
      accessible
      className={cn(
        'mb-3 rounded-lg border border-border bg-surface-elevated p-4',
        className,
      )}
    >
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 flex-row flex-wrap gap-1.5">
          <StatusBadge label={category} type="category" />
          <StatusBadge label={subcategory} type="subcategory" />
          {cached ? <StatusBadge type="cached" /> : null}
        </View>
        <View className="flex-row items-center gap-1">
          {torrent.trusted ? <StatusBadge type="trusted" /> : null}
          {torrent.vip ? <StatusBadge type="vip" /> : null}
          <FavoriteControl
            favorite={favorite}
            onPress={
              onFavoritePress ? () => onFavoritePress(torrent) : undefined
            }
            title={title}
          />
        </View>
      </View>

      <Text
        className="mt-3 text-[16px] font-semibold leading-[22px]"
        numberOfLines={2}
      >
        {title}
      </Text>

      <View className="mt-3 flex-row flex-wrap gap-2">
        <MetricPill type="size" value={size} />
        <MetricPill type="date" value={uploaded} />
        <MetricPill type="uploader" value={uploader} />
      </View>

      <View className="mt-3 flex-row flex-wrap items-center gap-2">
        <MetricPill type="seeders" value={torrent.seeders} />
        <MetricPill type="leechers" value={torrent.leechers} />
        <StatusBadge health={health} type="health" />
      </View>

      <View className="mt-4 flex-row items-center gap-3">
        <Pressable
          accessibilityLabel={`Open details for ${title}`}
          accessibilityRole="button"
          accessibilityState={{ disabled: !detailsHandler }}
          className={cn(
            'min-h-12 flex-1 items-center justify-center rounded-md border border-border bg-surface-muted px-4 active:bg-surface active:opacity-85',
            !detailsHandler ? 'opacity-50' : null,
          )}
          disabled={!detailsHandler}
          onPress={() => callIfReady(torrent, detailsHandler)}
        >
          <Text className="font-semibold">Details</Text>
        </Pressable>

        <Pressable
          accessibilityLabel={`Open magnet link for ${title}`}
          accessibilityRole="button"
          accessibilityState={{ disabled: !canOpenMagnet }}
          className={cn(
            'min-h-12 flex-row items-center justify-center gap-2 rounded-md border border-primary/40 bg-primary-soft px-4 active:opacity-85',
            !canOpenMagnet ? 'opacity-50' : null,
          )}
          disabled={!canOpenMagnet}
          onPress={() => callIfReady(torrent, onMagnetPress)}
        >
          <Magnet color={colors.primary} size={18} />
          <Text className="font-semibold text-primary">Magnet</Text>
        </Pressable>

        <IconButton
          accessibilityLabel={`More actions for ${title}`}
          accessibilityState={{ disabled: !onOverflowPress }}
          disabled={!onOverflowPress}
          onPress={() => callIfReady(torrent, onOverflowPress)}
        >
          <MoreVertical color={colors.textSecondary} size={20} />
        </IconButton>
      </View>
    </View>
  );
}

export const TorrentCard = memo(TorrentCardComponent);
