#pragma once

#if __has_include(<React-Codegen/RNCslMobileBridgeSpecJSI.h>) // CocoaPod headers on Apple
#include <React-Codegen/RNCslMobileBridgeSpecJSI.h>
#elif __has_include("RNCslMobileBridgeSpecJSI.h") // CMake headers on Android
#include "RNCslMobileBridgeSpecJSI.h"
#endif

#include <jsi/jsi.h>
#include "react_native_haskell_shelley.h"

namespace cslmobilebridge {

using namespace facebook::jsi;
using namespace std;

class BigNumHostObject : public HostObject {
public:
  BigNumHostObject(RPtr bigNumPtr);
  ~BigNumHostObject();

  static Value create(Runtime& runtime, const RPtr& bigNumPtr);
  static void registerHostObject(Runtime& runtime, const RPtr& bigNumPtr);

  Value get(Runtime& runtime, const PropNameID& name) override;
};

void installCslMobileBridge(Runtime& runtime);

} // namespace cslmobilebridge
