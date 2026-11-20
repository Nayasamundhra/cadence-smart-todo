import { Redirect } from 'expo-router';

// Phase 3 turns this into the gate (auth / onboarding / app). For now it opens Today.
export default function Index() {
  return <Redirect href="/today" />;
}
