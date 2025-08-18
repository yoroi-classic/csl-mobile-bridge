cmake_minimum_required(VERSION 3.13)
project(csl_mobile_bridge_cpp)

# =========================================================
# Configurable variables
# =========================================================
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_POSITION_INDEPENDENT_CODE ON)

set(RUST_PROJECT_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../rust" CACHE PATH "Path to Rust project root")
set(RN_ROOT "" CACHE PATH "Path to React Native root directory")
set(RN_SEARCH_PATHS
    "${CMAKE_CURRENT_SOURCE_DIR}/../../../node_modules/react-native"
    "${CMAKE_CURRENT_SOURCE_DIR}/../../node_modules/react-native"
    "${CMAKE_CURRENT_SOURCE_DIR}/../node_modules/react-native"
    CACHE STRING "Paths to search for React Native root"
)

find_program(CARGO_BIN cargo REQUIRED)
find_program(XCODEBUILD_BIN xcodebuild REQUIRED)

set(CMAKE_LIBRARY_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/lib)

# Build options
option(BUILD_XCFRAMEWORK "Build an xcframework (slower). OFF = link the one needed arch (faster)" OFF)

# Ensure CMake passes iOS deployment target through; CocoaPods sets this via Xcode
# CMAKE_OSX_DEPLOYMENT_TARGET is used by clang; we also forward it to cargo.
if(APPLE AND NOT CMAKE_OSX_DEPLOYMENT_TARGET)
  # Default sensibly if not set by the generator
  set(CMAKE_OSX_DEPLOYMENT_TARGET 13.0 CACHE STRING "" FORCE)
endif()

# =========================================================
# Helper: Set Rust library name
# =========================================================
function(set_rust_library_name OUT_VAR RUST_PROJECT_DIR)
    set(CARGO_TOML "${RUST_PROJECT_DIR}/Cargo.toml")

    if(NOT EXISTS "${CARGO_TOML}")
        message(FATAL_ERROR "Cargo.toml not found in: ${RUST_PROJECT_DIR}")
    endif()

    file(READ "${CARGO_TOML}" CARGO_TOML_CONTENTS)
    string(REPLACE "\r\n" "\n" CARGO_TOML_CONTENTS "${CARGO_TOML_CONTENTS}")
    string(REPLACE "\r" "\n" CARGO_TOML_CONTENTS "${CARGO_TOML_CONTENTS}")

    # First try to match name inside [lib]
    string(REGEX MATCH "\\[lib\\][^\\[]*name[ \t]*=[ \t]*\"([^\"]+)\"" _ "${CARGO_TOML_CONTENTS}")
    if(CMAKE_MATCH_1)
        set(${OUT_VAR} "${CMAKE_MATCH_1}" PARENT_SCOPE)
        message(STATUS "Detected Rust library name from [lib]: ${CMAKE_MATCH_1}")
        return()
    endif()

    # Fallback to matching name inside [package]
    string(REGEX MATCH "\\[package\\][^\\[]*name[ \t]*=[ \t]*\"([^\"]+)\"" _ "${CARGO_TOML_CONTENTS}")
    if(CMAKE_MATCH_1)
        set(${OUT_VAR} "${CMAKE_MATCH_1}" PARENT_SCOPE)
        message(STATUS "Detected Rust library name from [package]: ${CMAKE_MATCH_1}")
        return()
    endif()

    message(FATAL_ERROR "Could not detect Rust library name in Cargo.toml (neither [lib] nor [package])")
endfunction()

# =========================================================
# Helper: Detect React Native root
# =========================================================
function(detect_react_native_root)
    if(NOT RN_ROOT)
        message(STATUS "RN_ROOT not set, attempting auto-detection...")
        foreach(rn_path ${RN_SEARCH_PATHS})
            if(EXISTS "${rn_path}/ReactCommon/jsi/jsi/jsi.h")
                set(RN_ROOT "${rn_path}" PARENT_SCOPE)
                message(STATUS "React Native root detected (new layout): ${rn_path}")
                return()
            elseif(EXISTS "${rn_path}/ReactCommon/jsi/jsi.h")
                set(RN_ROOT "${rn_path}" PARENT_SCOPE)
                message(STATUS "React Native root detected (old layout): ${rn_path}")
                return()
            endif()
        endforeach()
        message(FATAL_ERROR "Could not locate React Native root. Set RN_ROOT manually.")
    endif()
endfunction()

# =========================================================
# Helper: Add RN include dirs
# =========================================================
function(add_react_native_includes target)
    target_include_directories(${target} PRIVATE
        "${RN_ROOT}/React"
        "${RN_ROOT}/React/Base"
        "${RN_ROOT}/ReactCommon"
        "${RN_ROOT}/ReactCommon/yoga"
    )
    if(EXISTS "${RN_ROOT}/ReactCommon/jsi/jsi/jsi.h")
        target_include_directories(${target} PRIVATE
            "${RN_ROOT}/ReactCommon/jsi"
        )
        message(STATUS "Using RN JSI include path: ${RN_ROOT}/ReactCommon/jsi")
    elseif(EXISTS "${RN_ROOT}/ReactCommon/jsi/jsi.h")
        target_include_directories(${target} PRIVATE
            "${RN_ROOT}/ReactCommon"
        )
        message(STATUS "Using RN JSI include path: ${RN_ROOT}/ReactCommon")
    else()
        message(FATAL_ERROR "Could not locate jsi/jsi.h under ${RN_ROOT}/ReactCommon")
    endif()
endfunction()

# =========================================================
# Helper: Build Rust for ONE target triple with Xcode env
# =========================================================
function(build_rust_target RUST_TARGET)
    if(NOT RUST_TARGET)
        message(FATAL_ERROR "build_rust_target requires a Rust target triple")
    endif()

    message(STATUS "Building Rust target: ${RUST_TARGET} (SDKROOT=${CMAKE_OSX_SYSROOT}, ARCHS=${CMAKE_OSX_ARCHITECTURES}, DEPLOY=${CMAKE_OSX_DEPLOYMENT_TARGET})")

    execute_process(
        COMMAND ${CMAKE_COMMAND} -E env
            SDKROOT=${CMAKE_OSX_SYSROOT}
            ARCHS=${CMAKE_OSX_ARCHITECTURES}
            IPHONEOS_DEPLOYMENT_TARGET=${CMAKE_OSX_DEPLOYMENT_TARGET}
            ${CARGO_BIN} build --target ${RUST_TARGET} --release
        WORKING_DIRECTORY ${RUST_PROJECT_DIR}
        RESULT_VARIABLE CARGO_RESULT
    )

    if(NOT CARGO_RESULT EQUAL 0)
        message(FATAL_ERROR "cargo build failed for target ${RUST_TARGET}")
    endif()
endfunction()

# =========================================================
# Helper: Determine the single iOS Rust triple we need
# =========================================================
function(detect_ios_rust_target OUT_VAR)
    if(NOT CMAKE_OSX_SYSROOT)
        message(FATAL_ERROR "CMAKE_OSX_SYSROOT not set; invoke CMake with -DCMAKE_OSX_SYSROOT=<iphoneos|iphonesimulator>")
    endif()

    # Normalize archs (can be "arm64" or "x86_64" or a list)
    string(TOLOWER "${CMAKE_OSX_ARCHITECTURES}" _arches)
    string(TOLOWER "${CMAKE_OSX_SYSROOT}" _sysroot)

    if(_sysroot MATCHES "iphoneos")
        # Device
        set(_target "aarch64-apple-ios")
    elseif(_sysroot MATCHES "iphonesimulator")
        # Simulator
        if(_arches MATCHES "arm64")
            set(_target "aarch64-apple-ios-sim")
        elseif(_arches MATCHES "x86_64")
            set(_target "x86_64-apple-ios")
        else()
            message(FATAL_ERROR "Unknown simulator arch in CMAKE_OSX_ARCHITECTURES='${CMAKE_OSX_ARCHITECTURES}'")
        endif()
    else()
        message(FATAL_ERROR "Unknown iOS sysroot: ${CMAKE_OSX_SYSROOT}")
    endif()

    set(${OUT_VAR} "${_target}" PARENT_SCOPE)
endfunction()

# =========================================================
# iOS build
#   - Fast path (default): build only the ONE required arch and link the .a directly.
#   - Optional: BUILD_XCFRAMEWORK=ON to make a fat xcframework (builds multiple targets).
# =========================================================
function(build_ios)
    set_rust_library_name(RUST_LIB_NAME "${RUST_PROJECT_DIR}")
    set(RUST_HEADERS_DIR "${RUST_PROJECT_DIR}/include")

    if(BUILD_XCFRAMEWORK)
        # Build device + both simulators to maximize compatibility
        set(_xc_targets aarch64-apple-ios aarch64-apple-ios-sim x86_64-apple-ios)
        list(REMOVE_DUPLICATES _xc_targets)
        foreach(t ${_xc_targets})
            build_rust_target(${t})
        endforeach()

        set(IOS_ARM64_LIB      "${RUST_PROJECT_DIR}/target/aarch64-apple-ios/release/lib${RUST_LIB_NAME}.a")
        set(IOS_ARM64_SIM_LIB  "${RUST_PROJECT_DIR}/target/aarch64-apple-ios-sim/release/lib${RUST_LIB_NAME}.a")
        set(IOS_X64_SIM_LIB    "${RUST_PROJECT_DIR}/target/x86_64-apple-ios/release/lib${RUST_LIB_NAME}.a")

        set(XCFRAMEWORK_OUTPUT "${CMAKE_LIBRARY_OUTPUT_DIRECTORY}/${RUST_LIB_NAME}.xcframework")
        file(MAKE_DIRECTORY ${CMAKE_LIBRARY_OUTPUT_DIRECTORY})

        message(STATUS "Creating XCFramework at: ${XCFRAMEWORK_OUTPUT}")
        # Build the -create-xcframework args based on which libs exist
        set(_xc_args)
        if(EXISTS "${IOS_ARM64_LIB}")
            list(APPEND _xc_args -library "${IOS_ARM64_LIB}" -headers "${RUST_HEADERS_DIR}")
        endif()
        if(EXISTS "${IOS_ARM64_SIM_LIB}")
            list(APPEND _xc_args -library "${IOS_ARM64_SIM_LIB}" -headers "${RUST_HEADERS_DIR}")
        elseif(EXISTS "${IOS_X64_SIM_LIB}")
            list(APPEND _xc_args -library "${IOS_X64_SIM_LIB}" -headers "${RUST_HEADERS_DIR}")
        endif()

        if(_xc_args STREQUAL "")
            message(FATAL_ERROR "No Rust libraries found to package into xcframework")
        endif()

        execute_process(
            COMMAND ${XCODEBUILD_BIN} -create-xcframework
                ${_xc_args}
                -output "${XCFRAMEWORK_OUTPUT}"
            RESULT_VARIABLE XC_RESULT
        )
        if(NOT XC_RESULT EQUAL 0)
            message(FATAL_ERROR "xcodebuild -create-xcframework failed")
        endif()

        # Link the xcframework to this static lib for consumers
        target_link_libraries(${PROJECT_NAME} PRIVATE "${XCFRAMEWORK_OUTPUT}")
    else()
        # Fast path: just the one arch that matches current build
        detect_ios_rust_target(_single_target)
        build_rust_target("${_single_target}")

        # Link the right static lib directly (device or sim)
        set(_rust_lib "${RUST_PROJECT_DIR}/target/${_single_target}/release/lib${RUST_LIB_NAME}.a")
        if(NOT EXISTS "${_rust_lib}")
            message(FATAL_ERROR "Expected Rust lib not found: ${_rust_lib}")
        endif()

        # Let downstream Xcode/app link both this C++ static lib and the Rust static lib
        target_link_libraries(${PROJECT_NAME} PRIVATE "${_rust_lib}")

        # Optional: surface Rust headers to C++ (if you generate C headers)
        if(EXISTS "${RUST_HEADERS_DIR}")
            target_include_directories(${PROJECT_NAME} PRIVATE "${RUST_HEADERS_DIR}")
        endif()
    endif()
endfunction()

# =========================================================
# Android build
# =========================================================
function(rust_triple_for_android_abi OUT_VAR ANDROID_ABI)
    if(ANDROID_ABI STREQUAL "arm64-v8a")
        set(_t "aarch64-linux-android")
    elseif(ANDROID_ABI STREQUAL "armeabi-v7a")
        set(_t "armv7-linux-androideabi")
    elseif(ANDROID_ABI STREQUAL "x86_64")
        set(_t "x86_64-linux-android")
    elseif(ANDROID_ABI STREQUAL "x86")
        set(_t "i686-linux-android")
    else()
        message(FATAL_ERROR "Unknown ANDROID_ABI='${ANDROID_ABI}'")
    endif()
    set(${OUT_VAR} "${_t}" PARENT_SCOPE)
endfunction()

function(build_android)
    # CMake sets this when using the Android toolchain file
    if(NOT CMAKE_ANDROID_ARCH_ABI)
        message(FATAL_ERROR "CMAKE_ANDROID_ARCH_ABI not set")
    endif()

    rust_triple_for_android_abi(_triple "${CMAKE_ANDROID_ARCH_ABI}")
    build_rust_target("${_triple}")

    set_rust_library_name(RUST_LIB_NAME "${RUST_PROJECT_DIR}")
    set(_rust_lib "${RUST_PROJECT_DIR}/target/${_triple}/release/lib${RUST_LIB_NAME}.a")
    if(NOT EXISTS "${_rust_lib}")
        message(FATAL_ERROR "Expected Rust lib not found: ${_rust_lib}")
    endif()

    target_link_libraries(${PROJECT_NAME} PRIVATE "${_rust_lib}")
endfunction()

# =========================================================
# Main
# =========================================================
detect_react_native_root()

file(GLOB_RECURSE CPP_SOURCES
    "${CMAKE_CURRENT_SOURCE_DIR}/*.cpp"
    "${CMAKE_CURRENT_SOURCE_DIR}/*.mm"
    "${CMAKE_CURRENT_SOURCE_DIR}/*.m"
)

add_library(${PROJECT_NAME} STATIC ${CPP_SOURCES})
add_react_native_includes(${PROJECT_NAME})

if(ANDROID)
    build_android()
elseif(APPLE)
    build_ios()
else()
    message(FATAL_ERROR "Unsupported platform: ${CMAKE_SYSTEM_NAME}")
endif()
