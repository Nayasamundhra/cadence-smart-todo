import { Redirect } from 'expo-router';
import { env } from '@/lib/env';
import { GalleryScreen } from '@/features/gallery/GalleryScreen';

/** Dev-only design gallery (docs/02-design-system.md section 2.6). Not reachable in production builds. */
export default function Gallery() {
  if (env.EXPO_PUBLIC_ENV === 'production') return <Redirect href="/today" />;
  return <GalleryScreen />;
}
