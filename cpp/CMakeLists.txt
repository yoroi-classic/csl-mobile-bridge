cmake_minimum_required(VERSION 3.13)
project(native_module)

set(CMAKE_VERBOSE_MAKEFILE ON)

# Compiler flags for C++
add_compile_options(
    -fexceptions
    -frtti
    -std=c++17
)

# Collect all .cpp files in current directory
file(GLOB_RECURSE NATIVE_MODULE_SRC CONFIGURE_DEPENDS
    "${CMAKE_CURRENT_SOURCE_DIR}/*.cpp"
    "${CMAKE_CURRENT_SOURCE_DIR}/*.c"
)

add_library(native_module SHARED ${NATIVE_MODULE_SRC})

# Find ReactAndroid (New Architecture must be enabled)
find_package(ReactAndroid REQUIRED CONFIG)

# Set include directories
target_include_directories(native_module PUBLIC
    ${CMAKE_CURRENT_SOURCE_DIR}
    ${REACT_ANDROID_DIR}/ReactCommon
    ${REACT_ANDROID_DIR}/ReactCommon/jsi
    ${REACT_ANDROID_DIR}/src/main/jni/first-party/fbjni/headers
    ${REACT_ANDROID_DIR}/src/main/jni/first-party/jsi/headers
    ${CMAKE_CURRENT_SOURCE_DIR}/../../rust/include
)

# Find the Rust library
find_library(
    RUST_LIB
    NAMES react_native_haskell_shelley
    HINTS ${CMAKE_CURRENT_SOURCE_DIR}/../../android/build/rustJniLibs/android/${ANDROID_ABI}
)

# Link the native module with React Native core libraries and the Rust library
target_link_libraries(native_module
    ReactAndroid::jsi
    ReactAndroid::fbjni
    react_nativemodule_core
    ${JNI_LIBRARIES}
    ${RUST_LIB}
)

# Install rule for Android build
set_target_properties(native_module PROPERTIES
    LIBRARY_OUTPUT_DIRECTORY "${CMAKE_CURRENT_BINARY_DIR}/../jniLibs/${ANDROID_ABI}"
)
