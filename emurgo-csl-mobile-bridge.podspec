require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "emurgo-csl-mobile-bridge"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => "11.0" }

  s.source       = {
    :git => "https://github.com/emurgo/csl-mobile-bridge.git",
    :tag => "#{s.version}"
  }

  # Only Objective-C / Swift bridging files
  s.source_files = "ios/**/*.{h,m,mm}"
  s.private_header_files = "ios/**/*.h"

  # Keep C++ & Rust sources for CMake
  s.preserve_paths = "cpp", "rust"

  # Make cpp headers available to Objective-C++
  s.xcconfig = {
    'HEADER_SEARCH_PATHS' => '$(PODS_TARGET_SRCROOT)/cpp/**'
  }
  s.pod_target_xcconfig = {
    'HEADER_SEARCH_PATHS' => '$(PODS_TARGET_SRCROOT)/cpp/**'
  }

  s.script_phase = {
    :name => "Build C++ & Rust bridge via CMake",
    :execution_position => :before_compile,
    :script => <<-SCRIPT
      set -e
      set -x

      BUILD_DIR="${PODS_TARGET_SRCROOT}/build/${PLATFORM_NAME}-${ARCHS}"
      mkdir -p "$BUILD_DIR"

      if [ "$PLATFORM_NAME" = "iphonesimulator" ]; then
        SYSROOT="iphonesimulator"
      else
        SYSROOT="iphoneos"
      fi

      ARCH=$(echo $ARCHS | cut -d' ' -f1)
      echo "Building C++ & Rust for PLATFORM=$PLATFORM_NAME SYSROOT=$SYSROOT ARCH=$ARCH"

      cmake -S "${PODS_TARGET_SRCROOT}/cpp" -B "$BUILD_DIR" \
        -DCMAKE_SYSTEM_NAME=iOS \
        -DCMAKE_OSX_SYSROOT="$SYSROOT" \
        -DCMAKE_OSX_ARCHITECTURES="$ARCH" \
        -DCMAKE_OSX_DEPLOYMENT_TARGET="$IPHONEOS_DEPLOYMENT_TARGET" \
        -DCMAKE_BUILD_TYPE=Release

      cmake --build "$BUILD_DIR" --config Release --verbose
    SCRIPT
  }

  if respond_to?(:install_modules_dependencies, true)
    install_modules_dependencies(s)
  else
    s.dependency "React-Core"
    s.dependency "React-Codegen"
    s.dependency "RCT-Folly"
    s.dependency "RCTRequired"
    s.dependency "RCTTypeSafety"
    s.dependency "React-callinvoker"
    s.dependency "React-jsi"
    s.dependency "ReactCommon/turbomodule/core"
  end
end
