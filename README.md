# CSL Mobile Bridge

[![npm version](https://badge.fury.io/js/%40emurgo%2Fcsl-mobile-bridge.svg)](https://badge.fury.io/js/%40emurgo%2Fcsl-mobile-bridge)

CSL Mobile Bridge is a React Native library that provides JavaScript bindings for Emurgo's Cardano Serialization Library with native Rust components.

## 📦 Installation

```bash
npm install @emurgo/csl-mobile-bridge-jsi --save
```

### Mostly automatic installation

```bash
react-native link @emurgo/csl-mobile-bridge-jsi
```

## 🚀 Quick Start

### Choose Your Setup Path

**For Experienced React Native Developers** → Jump to [Experienced Developer Setup](#experienced-developer-setup) (5-10 minutes)

**For Fresh Machine Setup** → Follow [Complete Fresh Machine Setup](#complete-fresh-machine-setup) (2.5-4 hours)

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Experienced Developer Setup](#experienced-developer-setup)
- [Complete Fresh Machine Setup](#complete-fresh-machine-setup)
  - [Prerequisites](#prerequisites)
  - [Development Tools Installation](#development-tools-installation)
  - [iOS Setup](#ios-setup)
  - [Android Setup](#android-setup)
  - [Rust Environment Setup](#rust-environment-setup)
  - [Node.js Dependencies](#nodejs-dependencies)
- [Running the Application](#running-the-application)
- [Usage](#usage)
- [Troubleshooting](#troubleshooting)
- [Additional Resources](#additional-resources)

---

## Experienced Developer Setup

This section is for developers who already have React Native development tools installed and configured. Assumes you have Node.js, Yarn, Xcode, Android Studio, and basic development tools ready.

### ⚡ Quick Setup (5-10 minutes)

```bash
# 1. Install Watchman (if not already installed)
brew install watchman || echo "Watchman already installed"

# 2. Install/setup Rust and run automated environment setup
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.zshrc  # or ~/.bash_profile
./setup-rust-environment.sh

# 3. Install project dependencies
yarn install && yarn prepare

# 4. Run the app
yarn example ios    # or: yarn example android
```

### 🔍 Prerequisites Check

Verify you have the required tools installed:

```bash
# Check versions
node --version    # >= 18.0.0
yarn --version    # >= 3.6.1
xcodebuild -version  # >= 14.0
java -version     # JDK 17 recommended
```

### 🦊 Rust Setup (Required)

Even experienced developers need to set up Rust for this project:

```bash
# Install Rust if not already installed
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Configure environment and install targets
source ~/.zshrc  # or ~/.bash_profile
./setup-rust-environment.sh
```

### ⚠️ Important Notes for Experienced Devs

- **NDK Version**: This project requires NDK version `27.0.12077973` - check your Android SDK setup
- **Rust Targets**: The setup script installs required cross-compilation targets
- **Environment Variables**: Ensure `JAVA_HOME`, `ANDROID_HOME` are set correctly

If you encounter any issues, see the [Troubleshooting](#troubleshooting) section or follow the complete setup below.

---

## Complete Fresh Machine Setup (Total: 2.5-4 hours)

This section provides a comprehensive guide for setting up a complete development environment from scratch.

### ⏱️ Time Breakdown
- **Development Tools**: 30-45 minutes
- **iOS Setup**: 45-90 minutes  
- **Android Setup**: 60-90 minutes
- **Rust Environment**: 15-20 minutes
- **Dependencies & Testing**: 10-15 minutes

> **💡 Tip**: The longest waits are for downloading Xcode (10-15GB) and Android Studio. Start these downloads early!

## Prerequisites

### Required Software Versions

- **Node.js**: 18.0.0 or later
- **Yarn**: 3.6.1 or later
- **Rust**: 1.70.0 or later
- **Xcode**: 14.0 or later
- **Android Studio**: Latest stable version
- **Java JDK**: 17 (Azul Zulu recommended)

## Development Tools Installation

### 1. Homebrew

Homebrew is the recommended package manager for macOS. If you haven't installed it:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Verify installation:
```bash
brew --version
```

### 2. Watchman

Watchman is a file watching service used by React Native for faster builds.

```bash
brew install watchman
```

### 3. Node.js and Yarn

Install Node.js using Homebrew (this will also install npm):

```bash
brew install node
```

Install Yarn:

```bash
npm install -g yarn
```

Verify installations:
```bash
node --version  # Should be >= 18.0.0
npm --version
yarn --version  # Should be >= 3.6.1
```

### 4. Git

```bash
brew install git
```

## iOS Setup

### 1. Xcode

Install Xcode from the Mac App Store or download it from the [Apple Developer Portal](https://developer.apple.com/xcode/).

> **Note**: Xcode is a large download (10-15GB) and may take significant time to install and configure.

### 2. Xcode Command Line Tools

```bash
xcode-select --install
```

### 3. iOS Simulator

The iOS Simulator is included with Xcode. Verify installation:

```bash
xcrun simctl list devices
```

### 4. CocoaPods

CocoaPods is the dependency manager for iOS projects:

```bash
sudo gem install cocoapods
```

## Android Setup

### 1. Android Studio

Download and install Android Studio from the [official website](https://developer.android.com/studio) or via Homebrew:

```bash
brew install --cask android-studio
```

> **Note**: Android Studio is a large download (1GB+) and includes the Android SDK.

### 2. Android SDK

After installing Android Studio, open it and:
1. Go to **Settings → Appearance & Behavior → System Settings → Android SDK**
2. Install the latest Android SDK Platform
3. Install Android SDK Platform-Tools
4. Install Android SDK Build-Tools

### 3. Java Development Kit (JDK)

Install Azul Zulu JDK 17 (recommended for React Native development):

```bash
brew install --cask zulu@17
```

### 4. Environment Variables

Add the following environment variables to your shell configuration file (`~/.zshrc` for Zsh or `~/.bash_profile` for Bash):

```bash
# Java
export JAVA_HOME=/Library/Java/JavaVirtualMachines/zulu-17.jdk/Contents/Home

# Android
export ANDROID_HOME="$HOME/Library/Android/sdk"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export PATH="$PATH:$ANDROID_HOME/emulator"
export PATH="$PATH:$ANDROID_HOME/tools"
export PATH="$PATH:$ANDROID_HOME/tools/bin"
export PATH="$PATH:$ANDROID_HOME/platform-tools"

# Rust Android Gradle
export RUST_ANDROID_GRADLE_PYTHON_COMMAND="python3"
```

Reload your shell configuration:
```bash
source ~/.zshrc  # or source ~/.bash_profile
```

### 5. Android NDK

Install the specific NDK version required by the project:

> **Important**: The NDK version `27.0.12077973` is specifically required for this project. Using a different version may cause build failures.

#### NDK Installation via Android Studio

1. Open Android Studio
2. Go to **Settings → Appearance & Behavior → System Settings → Android SDK**
3. Click on the **SDK Tools** tab
4. Check **Show Package Details**
5. Find **NDK (Side by side)** and expand it
6. Select **27.0.12077973**
7. Click **Apply** to install

#### Set NDK Environment Variable (Optional but Recommended)

Add NDK path to your environment variables:

```bash
# Add to ~/.zshrc or ~/.bash_profile
export ANDROID_NDK_HOME="$ANDROID_HOME/ndk/27.0.12077973"
export PATH="$PATH:$ANDROID_NDK_HOME"
```

Reload your shell:
```bash
source ~/.zshrc  # or source ~/.bash_profile
```

### 6. Create Virtual Device

1. Open Android Studio
2. Go to **Tools → Device Manager**
3. Click **Create Device**
4. Select a phone model (e.g., Pixel 6)
5. Select a system image (API level 30+ recommended)
6. Finish the setup

## Rust Environment Setup

### 1. Install Rust

Install Rust using rustup (recommended):

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

Follow the prompts and restart your terminal afterward.

### 2. Automatic Setup Script

The project includes a comprehensive setup script that configures the Rust environment with all required targets:

```bash
./setup-rust-environment.sh
```

This script will:
- Check Rust installation and version (minimum 1.70.0)
- Install all required Rust targets for iOS and Android
- Verify additional build tools (cmake, make, etc.)
- Provide detailed feedback on the setup process

### 3. Manual Rust Target Installation (Optional)

If you prefer to install targets manually:

```bash
# iOS targets
rustup target add aarch64-apple-ios
rustup target add aarch64-apple-ios-sim
rustup target add x86_64-apple-ios

# macOS targets (for development)
rustup target add x86_64-apple-darwin
rustup target add aarch64-apple-darwin

# Android targets
rustup target add aarch64-linux-android
rustup target add armv7-linux-androideabi
rustup target add i686-linux-android
rustup target add x86_64-linux-android
```

### 4. Verify Rust Installation

```bash
rustc --version
cargo --version
rustup target list --installed
```

## Node.js Dependencies

### 1. Install Project Dependencies

From the project root directory:

```bash
# Install root dependencies
yarn install

# Prepare the build
yarn prepare
```

### 2. Install Example App Dependencies

```bash
# The example app is included as a workspace
yarn install
```

## Running the Application

### iOS

```bash
# Install iOS dependencies
cd example && pod install && cd ..

# Run the iOS simulator
yarn example ios
```

### Android

1. Start an Android emulator or connect a physical device
2. Run the Android app:

```bash
yarn example android
```

### Additional Commands

```bash
# Start Metro bundler only
yarn example start

# Run on web (if supported)
yarn example web

# Lint the code
yarn example lint
```

## Usage

See examples in `example/app/examples`.

### Basic Usage Example

```javascript
import { BigNum } from '@emurgo/csl-mobile-bridge-jsi';

// Use the CSL Mobile Bridge APIs in your React Native app
```

## Troubleshooting

### 🔧 Quick Diagnostic Commands

Run these commands first to identify common issues:

```bash
# Check all major tools
echo "=== Tool Versions ==="
node --version
yarn --version
rustc --version
java -version
xcodebuild -version

# Check environment variables
echo "=== Environment Variables ==="
echo "JAVA_HOME: $JAVA_HOME"
echo "ANDROID_HOME: $ANDROID_HOME"
echo "ANDROID_NDK_HOME: $ANDROID_NDK_HOME"

# Check Rust targets
echo "=== Rust Targets ==="
rustup target list --installed
```

### 🚨 Common Issues by Category

#### **Package Manager Issues**

##### Yarn not found
```bash
# Ensure Yarn is installed and in PATH
which yarn || npm install -g yarn

# Verify installation
yarn --version
```

##### Node modules corruption
```bash
# Clean all node modules and reinstall
rm -rf node_modules example/node_modules
yarn install

# Reset yarn cache if needed
yarn cache clean
```

#### **Environment Setup Issues**

##### Android SDK not found
```bash
# Verify ANDROID_HOME environment variable
echo $ANDROID_HOME
ls "$ANDROID_HOME"

# Reinstall Android Studio if necessary
brew reinstall --cask android-studio

# Check if SDK tools are installed
ls "$ANDROID_HOME/platform-tools/adb"
```

##### Java version incompatible
```bash
# Verify Java installation
java -version
echo $JAVA_HOME

# Switch to Zulu JDK 17 (recommended)
brew install --cask zulu@17

# Update shell configuration
export JAVA_HOME=/Library/Java/JavaVirtualMachines/zulu-17.jdk/Contents/Home
source ~/.zshrc  # or ~/.bash_profile
```

##### Environment variables not set
```bash
# Add to ~/.zshrc or ~/.bash_profile
export JAVA_HOME=/Library/Java/JavaVirtualMachines/zulu-17.jdk/Contents/Home
export ANDROID_HOME="$HOME/Library/Android/sdk"
export ANDROID_NDK_HOME="$ANDROID_HOME/ndk/27.0.12077973"
export PATH="$PATH:$ANDROID_HOME/platform-tools"

# Reload configuration
source ~/.zshrc  # or source ~/.bash_profile
```

#### **Rust-Specific Issues**

##### Rust build failures
```bash
# Re-run the setup script
./setup-rust-environment.sh

# Check Rust targets
rustup target list --installed

# Update Rust toolchain
rustup update

# Clean Rust cache
cargo clean
```

##### Missing Rust targets
```bash
# Install missing targets manually
rustup target add aarch64-apple-ios x86_64-apple-ios
rustup target add aarch64-linux-android x86_64-linux-android

# Verify installation
rustup target list --installed | grep -E "(ios|android)"
```

#### **iOS-Specific Issues**

##### Xcode build failures
```bash
# Clean and rebuild iOS project
cd example
rm -rf ios/build
pod install --repo-update
pod update
cd ..
yarn example ios

# Check Xcode command line tools
xcode-select --print-path
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
```

##### CocoaPods issues
```bash
# Update CocoaPods
sudo gem install cocoapods

# Clean pod cache
pod cache clean --all

# Reinstall pods
cd example && pod install && cd ..
```

##### iOS Simulator not working
```bash
# Reset simulator content and settings
xcrun simctl erase all

# List available simulators
xcrun simctl list devices available

# Create new simulator if needed
xcrun simctl create "iPhone 14" "iPhone 14" "iOS17.0"
```

#### **Android-Specific Issues**

##### NDK version mismatch
```bash
# Check installed NDK version
ls "$ANDROID_HOME/ndk/"
echo $ANDROID_NDK_HOME

# Install correct NDK version via Android Studio
# Settings → Appearance & Behavior → System Settings → Android SDK → SDK Tools
# Select NDK (Side by side) → 27.0.12077973

# Verify NDK version
$ANDROID_HOME/ndk/27.0.12077973/source.properties
```

##### Gradle build failures
```bash
# Clean Android build
cd example/android
./gradlew clean
./gradlew build --info
cd ../..

# Clear Gradle cache
rm -rf ~/.gradle/caches/

# Reset Android project
cd example/android
./gradlew clean
cd ../..
yarn example android
```

##### Emulator issues
```bash
# List available emulators
$ANDROID_HOME/emulator/emulator -list-avds

# Start specific emulator
$ANDROID_HOME/emulator/emulator -avd <emulator_name>

# Cold boot emulator
$ANDROID_HOME/emulator/emulator -avd <emulator_name> -no-snapshot
```

#### **Metro Bundler Issues**

##### Metro cache corruption
```bash
# Reset Metro cache
yarn example start --reset-cache

# Clear Metro bundler cache
npx react-native start --reset-cache

# Clear all caches and restart
rm -rf node_modules example/node_modules
yarn install
yarn example start --reset-cache
```

##### Port conflicts
```bash
# Kill processes on Metro port (8081)
lsof -ti:8081 | xargs kill -9

# Start Metro on different port
yarn example start --port 8082
```

### 🆘 Getting Help

#### **Primary Resources**
1. **GitHub Issues**: [CSL Mobile Bridge Issues](https://github.com/Emurgo/csl-mobile-bridge/issues)
2. **React Native Docs**: [Environment Setup](https://reactnative.dev/docs/environment-setup)
3. **Rust Documentation**: [Rust Book](https://doc.rust-lang.org/book/)

#### **Community Support**
- **Discord**: Join the Cardano developer community
- **Stack Overflow**: Tag questions with `csl-mobile-bridge` and `react-native`
- **React Native Community**: [Official help page](https://reactnative.dev/help)

#### **Before Asking for Help**
1. Run the diagnostic commands above
2. Check that all tools meet minimum version requirements
3. Verify environment variables are correctly set
4. Search existing GitHub issues for similar problems
5. Include error logs, system info, and steps you've tried

### 🔍 Advanced Debugging

#### **Enable Verbose Logging**
```bash
# iOS verbose build
yarn example ios --verbose

# Android verbose build
cd example/android
./gradlew assembleDebug --info
cd ../..
```

#### **Check System Resources**
```bash
# Check available disk space
df -h

# Check memory usage
top -l 1 | head -10

# Check CPU usage
top -l 1 | grep "CPU usage"
```

## Additional Resources

### Documentation

- [Cardano Serialization Library](https://github.com/Emurgo/cardano-serialization-lib) - Core Rust library
- [React Native Docs](https://reactnative.dev/docs/getting-started) - React Native development guide

### Development Tools

- [Rust Documentation](https://doc.rust-lang.org/) - Rust programming language
- [Expo Documentation](https://docs.expo.dev/) - Expo platform (used in example app)
- [Android Studio Guide](https://developer.android.com/studio/intro) - Android development
- [Xcode Documentation](https://developer.apple.com/xcode/) - iOS development

### Community

- [GitHub Issues](https://github.com/Emurgo/csl-mobile-bridge/issues) - Report bugs and request features
- [Discord Community](https://discord.gg/) - Join the Cardano developer community
- [React Native Community](https://reactnative.dev/help) - React Native support

### Performance Tips

1. **SSD Storage**: Use an SSD for faster build times, especially for Rust compilation
2. **RAM**: 16GB+ RAM significantly improves Rust compilation speed
3. **Parallel Builds**: Rust automatically uses all available CPU cores
4. **Cache**: Enable build caches to speed up subsequent builds

### Common Development Workflow

```bash
# Daily development workflow
yarn example start           # Start Metro bundler
yarn example ios             # Run on iOS
yarn example android         # Run on Android

# When pulling latest changes
git pull
yarn install
yarn prepare
./setup-rust-environment.sh  # Update Rust targets if needed
```

---

**Installation Complete!** 🎉
