#pragma once

#if __has_include(<React-Codegen/RNCslMobileBridgeSpecJSI.h>)
#include <React-Codegen/RNCslMobileBridgeSpecJSI.h>
#elif __has_include("RNCslMobileBridgeSpecJSI.h")
#include "RNCslMobileBridgeSpecJSI.h"
#endif

#include <jsi/jsi.h>
#include <memory>
#include <ReactCommon/CallInvoker.h> // for facebook::react::CallInvoker

namespace cslmobilebridge {

class JSI_EXPORT NativeCslMobileBridgeModule
    : public facebook::react::NativeCslMobileBridgeCxxSpec<NativeCslMobileBridgeModule> {
public:
  explicit NativeCslMobileBridgeModule(std::shared_ptr<facebook::react::CallInvoker> jsInvoker);

  // BigNum methods
  facebook::jsi::Object bigNumFromBytes(facebook::jsi::Runtime& rt, facebook::jsi::Array bytes);
  facebook::jsi::Array bigNumToBytes(facebook::jsi::Runtime& rt, facebook::jsi::Object bigNum);
  facebook::jsi::Object bigNumFromHex(facebook::jsi::Runtime& rt, facebook::jsi::String hex);
  facebook::jsi::String bigNumToHex(facebook::jsi::Runtime& rt, facebook::jsi::Object a);
  facebook::jsi::Object bigNumFromStr(facebook::jsi::Runtime& rt, facebook::jsi::String value);
  facebook::jsi::String bigNumToStr(facebook::jsi::Runtime& rt, facebook::jsi::Object bigNum);
  facebook::jsi::String bigNumToJson(facebook::jsi::Runtime& rt, facebook::jsi::Object a);
  facebook::jsi::Object bigNumCheckedAdd(facebook::jsi::Runtime& rt, facebook::jsi::Object a, facebook::jsi::Object b);
  facebook::jsi::Object bigNumCheckedSub(facebook::jsi::Runtime& rt, facebook::jsi::Object a, facebook::jsi::Object b);
  facebook::jsi::Object bigNumCheckedMul(facebook::jsi::Runtime& rt, facebook::jsi::Object a, facebook::jsi::Object b);
  facebook::jsi::Object bigNumClampedSub(facebook::jsi::Runtime& rt, facebook::jsi::Object a, facebook::jsi::Object b);
  facebook::jsi::Object bigNumDivFloor(facebook::jsi::Runtime& rt, facebook::jsi::Object a, facebook::jsi::Object b);
  double bigNumCompare(facebook::jsi::Runtime& rt, facebook::jsi::Object a, facebook::jsi::Object b);
  bool bigNumLessThan(facebook::jsi::Runtime& rt, facebook::jsi::Object a, facebook::jsi::Object b);
  bool bigNumIsZero(facebook::jsi::Runtime& rt, facebook::jsi::Object a);
  facebook::jsi::Object bigNumZero(facebook::jsi::Runtime& rt);
  facebook::jsi::Object bigNumOne(facebook::jsi::Runtime& rt);
  facebook::jsi::Object bigNumMaxValue(facebook::jsi::Runtime& rt);
};

} // namespace cslmobilebridge

using NativeCslMobileBridgeModule = cslmobilebridge::NativeCslMobileBridgeModule;
