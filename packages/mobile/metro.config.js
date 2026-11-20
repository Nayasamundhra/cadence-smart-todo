const { getSentryExpoConfig } = require('@sentry/react-native/metro');

// Expo configures Metro for monorepos automatically (SDK 52+); do not add watchFolders here.
// getSentryExpoConfig wraps expo/metro-config and adds Sentry's debug-id / source-map support.
const config = getSentryExpoConfig(__dirname);

module.exports = config;
