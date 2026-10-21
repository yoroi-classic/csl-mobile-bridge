#pragma once

#if __has_include(<React-Codegen/RNCmlMobileBridgeSpecJSI.h>)
#include <React-Codegen/RNCmlMobileBridgeSpecJSI.h>
#elif __has_include("RNCmlMobileBridgeSpecJSI.h")
#include "RNCmlMobileBridgeSpecJSI.h"
#endif

#include <jsi/jsi.h>
#include <memory>
#include <ReactCommon/CallInvoker.h>

namespace cmlmobilebridge {

class JSI_EXPORT NativeCmlMobileBridgeModule
    : public facebook::react::NativeCmlMobileBridgeCxxSpec<NativeCmlMobileBridgeModule> {
public:
  explicit NativeCmlMobileBridgeModule(std::shared_ptr<facebook::react::CallInvoker> jsInvoker);

  facebook::jsi::Object install(facebook::jsi::Runtime& rt);
};

} // namespace cmlmobilebridge

using NativeCmlMobileBridgeModule = cmlmobilebridge::NativeCmlMobileBridgeModule;
