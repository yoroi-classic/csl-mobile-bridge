#include <fbjni/fbjni.h>
#include <ReactCommon/CallInvokerHolder.h>
#include <jni.h>
#include <ReactCommon/TurboModuleUtils.h>
#include "NativeCslMobileBridgeModule.h"

using namespace facebook;

extern "C"
JNIEXPORT jlong JNICALL
Java_com_emurgo_cslmobilebridge_CslMobileBridgeModule_initHybrid(
    JNIEnv *env,
    jobject thiz,
    jobject reactContext,
    jobject jsCallInvokerHolder) {
  auto jsCallInvoker = jni::make_global(jsCallInvokerHolder);
  auto callInvoker = jni::alias_ref<react::CallInvokerHolder::javaobject>(jsCallInvoker)->cthis()->getCallInvoker();
  auto cxxModule = std::make_shared<cslmobilebridge::NativeCslMobileBridgeModule>(callInvoker);
  return reinterpret_cast<jlong>(cxxModule.get());
}
