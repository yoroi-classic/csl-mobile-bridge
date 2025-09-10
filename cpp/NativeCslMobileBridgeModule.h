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

  facebook::jsi::Object install(facebook::jsi::Runtime& rt);
};

} // namespace cslmobilebridge

using NativeCslMobileBridgeModule = cslmobilebridge::NativeCslMobileBridgeModule;
