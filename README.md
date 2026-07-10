# CSL Mobile Bridge

React Native library providing JavaScript bindings for Cardano Serialization Library with native Rust components.

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
npm install github:yoroi-classic/csl-mobile-bridge --save
```

## Usage

```javascript
import { BigNum } from '@yoroi-classic/csl-mobile-bridge';
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

# 2. Install dependencies and build package outputs
node .yarn/releases/yarn-3.6.1.cjs install --immutable
node .yarn/releases/yarn-3.6.1.cjs prepare

# 3. Run example app
node .yarn/releases/yarn-3.6.1.cjs example ios
# or:
node .yarn/releases/yarn-3.6.1.cjs example android
```

### Prerequisites

| Tool | Version | Check Command |
|------|---------|---------------|
| Node.js | 22.x | `node --version` |
| Yarn | 3.6.1 | `node .yarn/releases/yarn-3.6.1.cjs --version` |
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
node .yarn/releases/yarn-3.6.1.cjs example ios

# Android (start emulator first)
node .yarn/releases/yarn-3.6.1.cjs example android

# Metro bundler only
node .yarn/releases/yarn-3.6.1.cjs example start
```

### CML Transition

This package keeps the current CSL bridge API stable while Yoroi consumers migrate toward dcSpark Cardano Multiplatform Lib. Toolchain changes should continue running the bridge API fixture tests and package checks against the current exports until the replacement CML surface is defined.

The package metadata is owned by `yoroi-classic`; do not publish this bridge to npmjs. Consumers should use GitHub refs until the CML replacement package is ready.

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
node .yarn/releases/yarn-3.6.1.cjs example ios
```

#### Android Gradle failures
```bash
cd example/android && ./gradlew clean && cd ../..
node .yarn/releases/yarn-3.6.1.cjs example android
```

#### Metro cache issues
```bash
node .yarn/releases/yarn-3.6.1.cjs example start --reset-cache
```

#### Port 8081 in use
```bash
lsof -ti:8081 | xargs kill -9
```

### Clean Reinstall

```bash
rm -rf node_modules example/node_modules
node .yarn/releases/yarn-3.6.1.cjs install --immutable
node .yarn/releases/yarn-3.6.1.cjs prepare
```

## Resources

- [Cardano Serialization Library](https://github.com/dcSpark/cardano-serialization-lib)
- [Cardano Multiplatform Lib](https://github.com/dcSpark/cardano-multiplatform-lib)
- [GitHub Issues](https://github.com/yoroi-classic/csl-mobile-bridge/issues)
- [React Native Docs](https://reactnative.dev/docs/environment-setup)
