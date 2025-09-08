cmake_minimum_required(VERSION 3.13)
project(cslmobilebridge)

set(CMAKE_CXX_STANDARD 17)

set(BUILD_DIR ${CMAKE_CURRENT_LIST_DIR}/android/build)

# Gradle provides REACT_ANDROID_DIR (points to react-native/ReactAndroid)
if (NOT DEFINED REACT_ANDROID_DIR)
  set(REACT_ANDROID_DIR ${CMAKE_CURRENT_LIST_DIR}/../react-native/ReactAndroid)
endif()

set(NODE_MODULES_DIR ${REACT_ANDROID_DIR}/../..)

file(GLOB native_module_SRC CONFIGURE_DEPENDS ${CMAKE_CURRENT_LIST_DIR}/cpp/*.cpp)

add_library(csl_mobile_bridge_jsi SHARED ${native_module_SRC})

target_include_directories(
  csl_mobile_bridge_jsi
  PRIVATE
  "${NODE_MODULES_DIR}/react-native/React"
  "${NODE_MODULES_DIR}/react-native/React/Base"
  "${NODE_MODULES_DIR}/react-native/ReactCommon/jsi"
  "${NODE_MODULES_DIR}/react-native/ReactCommon/callinvoker"
  "${NODE_MODULES_DIR}/react-native/ReactCommon/react/nativemodule/core"
  "${CMAKE_CURRENT_LIST_DIR}/cpp/"
  "${CMAKE_CURRENT_LIST_DIR}/android/build/generated/source/codegen/jni"
  "${CMAKE_CURRENT_LIST_DIR}/android/build/generated/source/codegen/jni/react/nativemodule/core"
)


add_library(react_native_haskell_shelley SHARED IMPORTED)
target_include_directories(
  react_native_haskell_shelley INTERFACE
  "${CMAKE_CURRENT_LIST_DIR}/rust/include"
)
set_target_properties(
  react_native_haskell_shelley
  PROPERTIES IMPORTED_LOCATION
  ${BUILD_DIR}/rustJniLibs/android/${ANDROID_ABI}/libreact_native_haskell_shelley.so
)

target_link_libraries(
  csl_mobile_bridge_jsi
  react_codegen_RNCslMobileBridgeSpec
  react_native_haskell_shelley
  jsi
)
