import { ImageResponse } from 'next/og';
import { AppIconMark } from '@/lib/app-icon';

export const runtime = 'edge';
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(<AppIconMark size={size.width} />, size);
}
