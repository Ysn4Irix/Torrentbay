import Svg, { Circle, Path } from 'react-native-svg';
import { View, type TextStyle } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/theme';

type BrandMarkProps = {
  size?: number;
  color?: string;
  backgroundColor?: string;
};

type BrandWordmarkProps = BrandMarkProps & {
  textClassName?: string;
};

export function BrandMark({
  size = 40,
  color = colors.primary,
  backgroundColor = colors.primarySoft,
}: BrandMarkProps) {
  return (
    <View
      accessible={false}
      className="items-center justify-center"
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.28,
        backgroundColor,
      }}
    >
      <Svg height={size * 0.72} viewBox="0 0 72 72" width={size * 0.72}>
        <Circle
          cx="27"
          cy="27"
          fill="none"
          r="16"
          stroke={color}
          strokeLinecap="round"
          strokeWidth="6"
        />
        <Path
          d="M39 39L53 53"
          stroke={color}
          strokeLinecap="round"
          strokeWidth="6"
        />
        <Path
          d="M43 19H59M47 30H62M50 41H61"
          stroke={color}
          strokeLinecap="round"
          strokeWidth="5"
        />
        <Path
          d="M31 54L36 61L41 54"
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="5"
        />
      </Svg>
    </View>
  );
}

export function BrandWordmark({
  size = 34,
  color,
  backgroundColor,
  textClassName,
}: BrandWordmarkProps) {
  const wordmarkClassName = textClassName ?? 'text-lg font-bold';
  const wordmarkTextStyle: TextStyle = { fontWeight: '700' };

  return (
    <View className="flex-row items-center gap-3" accessibilityRole="header">
      <BrandMark size={size} color={color} backgroundColor={backgroundColor} />
      <Text className={wordmarkClassName} style={wordmarkTextStyle}>
        <Text className={wordmarkClassName} style={wordmarkTextStyle}>
          Torrent
        </Text>
        <Text
          className={`${wordmarkClassName} text-primary`}
          style={wordmarkTextStyle}
        >
          Bay
        </Text>
      </Text>
    </View>
  );
}
