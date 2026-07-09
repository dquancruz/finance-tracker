import { ImageResponse } from 'next/og';
import { AppIconMark } from '@/lib/app-icon';

export const runtime = 'edge';

export function GET() {
  const size = 512;
  return new ImageResponse(<AppIconMark size={size} />, {
    width: size,
    height: size,
  });
}
