# CSL Mobile Bridge

[![npm version](https://badge.fury.io/js/%40emurgo%2Fcsl-mobile-bridge.svg)](https://badge.fury.io/js/%40emurgo%2Fcsl-mobile-bridge)

React Native library providing JavaScript bindings for Emurgo's Cardano Serialization Library with native Rust components.

## 📦 Installation

### Requirements

- **Rust** — [Install rustup](https://rustup.rs/)
- **Python 3** — Required for Android builds
- **Rust targets** — Cross-compilation targets for iOS/Android

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.zshrc

# Install Rust targets
rustup target add aarch64-apple-ios aarch64-apple-ios-sim x86_64-apple-ios \
    aarch64-linux-android armv7-linux-androideabi i686-linux-android x86_64-linux-android

# Verify Python 3
python3 --version
```

### Install Package

```bash
npm install @emurgo/csl-mobile-bridge --save
```

## Usage

```javascript
import { BigNum } from '@emurgo/csl-mobile-bridge';
```

See more examples in `example/app/examples`.

---

## 🛠 Development Setup

For contributors and library developers.

### Quick Start

> Ensure [Requirements](#requirements) are installed first.

```bash
# 1. Setup Rust targets (or install manually as shown in Requirements)
./setup-rust-environment.sh

# 2. Install dependencies
yarn install && yarn prepare

# 3. Run example app
yarn example ios    # or: yarn example android
```

### Prerequisites

| Tool | Version | Check Command |
|------|---------|---------------|
| Node.js | ≥ 18.0.0 | `node --version` |
| Yarn | ≥ 3.6.1 | `yarn --version` |
| Rust | ≥ 1.70.0 | `rustc --version` |
| Xcode | Latest | `xcodebuild -version` |
| Java JDK | 17 | `java -version` |
| Android NDK | **27.0.12077973** | `ls $ANDROID_HOME/ndk/` |

### Environment Variables

Add to `~/.zshrc` (or `~/.bash_profile`):

```bash
# Java
export JAVA_HOME=/Library/Java/JavaVirtualMachines/zulu-17.jdk/Contents/Home

# Android
export ANDROID_HOME="$HOME/Library/Android/sdk"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export ANDROID_NDK_HOME="$ANDROID_HOME/ndk/27.0.12077973"
export PATH="$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools"

# Rust Android Gradle
export RUST_ANDROID_GRADLE_PYTHON_COMMAND="python3"
```

Then run `source ~/.zshrc` to apply.

### Android NDK Installation

> ⚠️ **NDK version `27.0.12077973` is required.** Other versions will cause build failures.

1. Open Android Studio → **Settings → Android SDK → SDK Tools**
2. Check **Show Package Details**
3. Expand **NDK (Side by side)** → Select **27.0.12077973**
4. Click **Apply**

### Java JDK 17

```bash
brew install --cask zulu@17
```

### Rust Targets

Use the setup script or install manually (see [Requirements](#requirements)):
```bash
./setup-rust-environment.sh
```

### Running the Example App

```bash
# iOS
yarn example ios

# Android (start emulator first)
yarn example android

# Metro bundler only
yarn example start
```

---

## Troubleshooting

### Quick Diagnostics

```bash
echo "JAVA_HOME: $JAVA_HOME"
echo "ANDROID_HOME: $ANDROID_HOME"
echo "ANDROID_NDK_HOME: $ANDROID_NDK_HOME"
rustup target list --installed | grep -E "(ios|android)"
```

### Common Issues

#### NDK version mismatch
```bash
ls "$ANDROID_HOME/ndk/"
# Must have 27.0.12077973 - install via Android Studio SDK Tools
```

#### Rust build failures
```bash
./setup-rust-environment.sh
rustup update
cargo clean
```

#### iOS build failures
```bash
cd example
rm -rf ios/build
pod install --repo-update
cd ..
yarn example ios
```

#### Android Gradle failures
```bash
cd example/android && ./gradlew clean && cd ../..
yarn example android
```

#### Metro cache issues
```bash
yarn example start --reset-cache
```

#### Port 8081 in use
```bash
lsof -ti:8081 | xargs kill -9
```

### Clean Reinstall

```bash
rm -rf node_modules example/node_modules
yarn install
yarn prepare
```

## Resources

- [Cardano Serialization Library](https://github.com/Emurgo/cardano-serialization-lib)
- [GitHub Issues](https://github.com/Emurgo/csl-mobile-bridge/issues)
- [React Native Docs](https://reactnative.dev/docs/environment-setup)
