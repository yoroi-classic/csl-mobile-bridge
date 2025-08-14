# C++ Bridge with Modern CMake

This directory contains the C++ JSI bridge, built with a modern and automated CMake system. The build system is designed to be simple, robust, and require minimal configuration.

---

## ✨ Key Features

- **Automatic Source Discovery:** All `.cpp`, `.mm`, and `.m` files are automatically discovered and compiled.
- **React Native Root Auto-Detection:** CMake automatically finds your React Native installation in `node_modules`.
- **Rust Library Name Auto-Detection:** The Rust library name is automatically extracted from `rust/Cargo.toml`.
- **Optimized iOS Builds:** Supports two modes: a "fast path" that builds only the required architecture for quicker development, and a full `.xcramework` build for distribution.
- **Simplified Build Commands:** A single, simple command is needed to configure the project for each platform.

---

## 🛠️ Prerequisites

- **CMake** (v3.13+)
- **Rust & Cargo** (with targets for iOS and Android)
- **Xcode & Command Line Tools** (for iOS builds)
- **Android NDK** (with `ANDROID_NDK_HOME` environment variable set, for Android builds)

---

## 🚀 Build Instructions

The build process is straightforward. Run CMake to configure the project, then run it again with the `--build` flag.

### iOS Build

The iOS build can be configured in two ways:

**1. Fast Development Build (Default)**

This is the default and recommended mode for development. It builds only the single architecture required by Xcode at that moment (e.g., `aarch64-apple-ios-sim` for an M1 simulator), which is significantly faster.

```bash
# 1. Configure the project for iOS
#    CMake automatically detects the required architecture from Xcode's environment.
cmake -S . -B build/ios -G Xcode \
  -DCMAKE_SYSTEM_NAME=iOS

# 2. Build the project
cmake --build build/ios
```

**2. XCFramework Build (for Distribution)**

This mode builds all required iOS architectures (device and simulators) and bundles them into a single `.xcramework`. This is slower but necessary for creating a universal binary for distribution.

```bash
# 1. Configure the project for iOS, enabling the XCFramework build
cmake -S . -B build/ios -G Xcode \
  -DCMAKE_SYSTEM_NAME=iOS \
  -DBUILD_XCFRAMEWORK=ON

# 2. Build the project
cmake --build build/ios
```

### Android Build

This command compiles the C++ and Rust code for Android. You must have the `ANDROID_NDK_HOME` environment variable set.

```bash
# 1. Configure the project for Android
# Replace <ABI> with your target ABI (e.g., arm64-v8a, armeabi-v7a, x86_64)
cmake -S . -B build/android \
  -DCMAKE_SYSTEM_NAME=Android \
  -DANDROID_ABI=<ABI> \
  -DCMAKE_ANDROID_NDK=$ANDROID_NDK_HOME \
  -DCMAKE_TOOLCHAIN_FILE=$ANDROID_NDK_HOME/build/cmake/android.toolchain.cmake

# 2. Build the project
cmake --build build/android
```

---

## ⚙️ Configuration

The build system is designed to work out-of-the-box. However, you can override the following variables if needed:

| Variable            | Default Value                                  | Description                                                                      |
| ------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------- |
| `RUST_PROJECT_DIR`  | `../rust`                                      | Path to the Rust project root.                                                   |
| `RN_ROOT`           | *auto-detected*                                | Path to the React Native root directory.                                         |
| `BUILD_XCFRAMEWORK` | `OFF`                                          | Set to `ON` to build a full `.xcramework` for iOS (slower).                      |

**Example:**
```bash
cmake -S . -B build -DRN_ROOT=/custom/path/to/react-native
```

---

## 📦 Build Outputs

- **iOS (Fast Mode)**: A static library (`.a`) for the current architecture is linked directly. The C++ code is compiled into `lib/libcsl_mobile_bridge_cpp.a`.
- **iOS (XCFramework Mode)**: `build/ios/lib/<rust_lib_name>.xcramework` is generated and linked.
- **Android**: The compiled libraries are placed in the standard Android build output directories, ready for Gradle to package.

---

## 🔧 Troubleshooting

- **RN_ROOT not found:** Ensure `node_modules` is installed in the project root. If it's in a custom location, pass it manually with `-DRN_ROOT=/path/to/rn`.
- **Android NDK not found:** Make sure the `ANDROID_NDK_HOME` environment variable is set correctly.
- **Rust target not installed:** If a build fails for a specific architecture, you may need to install the Rust target for it (e.g., `rustup target add aarch64-apple-ios-sim`).
