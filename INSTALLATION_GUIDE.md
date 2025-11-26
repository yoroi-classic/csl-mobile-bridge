# CSL Mobile Bridge Installation Guide

This guide will help you set up the CSL Mobile Bridge development environment on macOS. The CSL Mobile Bridge is a React Native library that provides JavaScript bindings for Emurgo's Cardano Serialization Library with native Rust components.

## Table of Contents

- [Quick Start](#quick-start)
- [Prerequisites](#prerequisites)
- [Development Tools Installation](#development-tools-installation)
- [iOS Setup](#ios-setup)
- [Android Setup](#android-setup)
- [Rust Environment Setup](#rust-environment-setup)
- [Node.js Dependencies](#nodejs-dependencies)
- [Running the Application](#running-the-application)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)
- [Additional Resources](#additional-resources)

## Quick Start

For experienced developers who want a minimal setup:

```bash
# 1. Install basic tools
brew install watchman node python3

# 2. Install Rust and run setup
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.zshrc  # or ~/.bash_profile
./setup-rust-environment.sh

# 3. Install dependencies
yarn install && yarn prepare

# 4. Run the app
yarn example ios    # or: yarn example android
```

> **Note**: If you're new to React Native development, please follow the complete guide below.

## Prerequisites

### System Requirements

- **macOS**: 13.0 (Ventura) or later
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 10GB free space for tools and dependencies
- **Processor**: Apple Silicon (M1/M2/M3) or Intel-based Mac

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

## Troubleshooting

### Common Issues and Solutions

#### 1. "Command not found: yarn"
```bash
# Ensure Yarn is installed and in PATH
which yarn
npm install -g yarn
```

#### 2. "Android SDK not found"
```bash
# Verify ANDROID_HOME environment variable
echo $ANDROID_HOME
ls "$ANDROID_HOME"

# Reinstall Android Studio if necessary
brew reinstall --cask android-studio
```

#### 3. "Java version incompatible"
```bash
# Verify Java installation
java -version
echo $JAVA_HOME

# Reinstall Zulu JDK
brew reinstall --cask zulu@17
```

#### 4. Rust build failures
```bash
# Re-run the setup script
./setup-rust-environment.sh

# Check Rust targets
rustup target list --installed

# Update Rust toolchain
rustup update
```

#### 5. iOS build issues
```bash
# Clean and rebuild
cd example
rm -rf ios/build
pod install --repo-update
cd ..
yarn example ios
```

#### 6. Android build issues
```bash
# Clean Android build
cd example/android
./gradlew clean
cd ../..
yarn example android
```

#### 7. NDK-related issues
```bash
# Check NDK installation
ls "$ANDROID_HOME/ndk/27.0.12077973"
echo $ANDROID_NDK_HOME

# Verify NDK version
$ANDROID_HOME/ndk/27.0.12077973/source.properties
```

#### 8. Metro bundler issues
```bash
# Reset Metro cache
yarn example start --reset-cache

# Clear node modules and reinstall
rm -rf node_modules example/node_modules
yarn install
```

### Getting Help

If you encounter issues not covered in this guide:

1. Check the [GitHub Issues](https://github.com/Emurgo/csl-mobile-bridge/issues)
2. Review the [React Native Environment Setup](https://reactnative.dev/docs/environment-setup)
3. Ensure all environment variables are correctly set
4. Verify that all tools meet the minimum version requirements

### Verification Script

You can run the following commands to verify your setup:

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

# Check Rust targets
echo "=== Rust Targets ==="
rustup target list --installed

# Check iOS simulator
echo "=== iOS Simulators ==="
xcrun simctl list devices available

# Check Android devices
echo "=== Android Devices ==="
$ANDROID_HOME/platform-tools/adb devices
```

## Verification

After completing the installation, verify everything is working by running the example app:

```bash
# Test iOS build
yarn example ios

# Test Android build  
yarn example android
```

Both commands should successfully build and launch the application. If you encounter any issues, refer to the [Troubleshooting](#troubleshooting) section.

### Expected Behavior

- **iOS**: The iOS Simulator should launch and display the CSL Mobile Bridge example app
- **Android**: An Android emulator or connected device should launch the example app
- **Build Process**: You should see Rust code compilation, followed by React Native bundling

## Additional Resources

### Documentation

- [CSL Mobile Bridge README](./README.md) - Main project documentation
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
