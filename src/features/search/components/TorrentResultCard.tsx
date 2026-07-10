import { memo } from 'react';
import { Pressable, View } from 'react-native';
import { Crown, Magnet, MoreVertical, ShieldCheck } from 'lucide-react-native';

import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/theme';
import { Torrent } from '@/models/torrent';

type TorrentResultCardProps = {
  torrent: Torrent;
  onPress?: (torrent: Torrent) => void;
};

function compactMeta(torrent: Torrent): string {
  return [torrent.category, torrent.subcategory, torrent.size, torrent.uploaded]
    .filter(Boolean)
    .join(' • ');
}

function TorrentResultCardComponent({
  torrent,
  onPress,
}: TorrentResultCardProps) {
  return (
    <Pressable
      accessibilityLabel={`Open torrent ${torrent.name}`}
      accessibilityRole="button"
      className="mb-2 rounded-2xl border border-border bg-surfaceElevated p-3 active:opacity-85"
      onPress={() => onPress?.(torrent)}
    >
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="text-sm font-semibold leading-5 text-foreground">
            {torrent.name}
          </Text>
          {compactMeta(torrent) ? (
            <Text className="mt-1.5 text-xs text-muted">
              {compactMeta(torrent)}
            </Text>
          ) : null}
        </View>
        <View className="items-end gap-1.5">
          <View className="flex-row gap-2">
            {torrent.trusted ? (
              <ShieldCheck color={colors.seeders} size={18} />
            ) : null}
            {torrent.vip ? (
              <Crown color={colors.primarySoft} size={18} />
            ) : null}
          </View>
          <Magnet color={colors.primarySoft} size={20} />
          <MoreVertical color={colors.muted} size={17} />
        </View>
      </View>

      <View className="mt-2.5 flex-row items-center gap-4">
        <Text
          className="text-xs font-semibold"
          style={{ color: colors.seeders }}
        >
          S {torrent.seeders ?? 0}
        </Text>
        <Text
          className="text-xs font-semibold"
          style={{ color: colors.leechers }}
        >
          L {torrent.leechers ?? 0}
        </Text>
        {torrent.uploader ? (
          <Text className="flex-1 text-right text-xs text-muted">
            {torrent.uploader}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

export const TorrentResultCard = memo(TorrentResultCardComponent);
