const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const escape = require('escape-string-regexp');
const exclusionList = require('metro-config/src/defaults/exclusionList');
const pak = require('../package.json');

const root = path.resolve(__dirname, '..');
const modules = Object.keys({ ...pak.peerDependencies });

// Path to the library at the repo root
const cslMobileBridgePath = root; // since lib is at repo root

const defaultConfig = getDefaultConfig(__dirname);

module.exports = {
  ...defaultConfig,

  // 👀 watch the root too, so changes in src/ are picked up
  watchFolders: [root],

  resolver: {
    ...defaultConfig.resolver,

    resolveRequest: (context, moduleName, platform) => {
      const shims = {
        'buffer': '@craftzdog/react-native-buffer',
      }
      return context.resolveRequest(
        context,
        shims[moduleName] ?? moduleName,
        platform,
      )
    },

    // keep deduping peer deps
    blacklistRE: exclusionList(
      modules.map(
        (m) =>
          new RegExp(`^${escape(path.join(root, 'node_modules', m))}\\/.*$`)
      )
    ),

    // 👀 map the package name to the root
    extraNodeModules: {
      ...modules.reduce((acc, name) => {
        acc[name] = path.join(__dirname, 'node_modules', name);
        return acc;
      }, {}),
      '@emurgo/csl-mobile-bridge-jsi': cslMobileBridgePath,
    },
  },

  transformer: {
    ...defaultConfig.transformer,
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};
