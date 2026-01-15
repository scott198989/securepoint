// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Ensure web output is compatible
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs'];

module.exports = config;
