/* eslint-disable @typescript-eslint/no-require-imports -- jest.isolateModules needs require() */
import type * as SentryModule from '@sentry/react-native';
import type * as MonitoringModule from './monitoring';

/** The Sentry integration must be fully off without a DSN and on with one (Phase 0 env switch). */
interface Loaded {
  monitoring: typeof MonitoringModule;
  sentry: typeof SentryModule;
}

function loadWith(dsn: string | undefined): Loaded {
  const previous = process.env.EXPO_PUBLIC_SENTRY_DSN;
  if (dsn === undefined) delete process.env.EXPO_PUBLIC_SENTRY_DSN;
  else process.env.EXPO_PUBLIC_SENTRY_DSN = dsn;

  let loaded: Loaded | null = null;
  jest.isolateModules(() => {
    loaded = {
      monitoring: require('./monitoring') as typeof MonitoringModule,
      sentry: require('@sentry/react-native') as typeof SentryModule,
    };
  });

  if (previous === undefined) delete process.env.EXPO_PUBLIC_SENTRY_DSN;
  else process.env.EXPO_PUBLIC_SENTRY_DSN = previous;
  if (!loaded) throw new Error('module did not load');
  return loaded;
}

describe('monitoring', () => {
  it('does nothing without a DSN', () => {
    const { monitoring, sentry } = loadWith(undefined);
    expect(monitoring.monitoringEnabled).toBe(false);
    monitoring.initMonitoring();
    monitoring.captureError(new Error('ignored'));
    expect(sentry.init).not.toHaveBeenCalled();
    expect(sentry.captureException).not.toHaveBeenCalled();
  });

  it('initialises once and reports errors with a DSN', () => {
    const { monitoring, sentry } = loadWith('https://abc@o1.ingest.sentry.io/2');
    expect(monitoring.monitoringEnabled).toBe(true);
    monitoring.initMonitoring();
    monitoring.initMonitoring();
    expect(sentry.init).toHaveBeenCalledTimes(1);
    expect(sentry.init).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn: 'https://abc@o1.ingest.sentry.io/2',
        sendDefaultPii: false,
      }),
    );
    const error = new Error('boom');
    monitoring.captureError(error);
    expect(sentry.captureException).toHaveBeenCalledWith(error);
  });
});
