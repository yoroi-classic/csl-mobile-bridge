#pragma once

#include <jsi/jsi.h>
#include <string>
#include <unordered_map>

namespace cslmobilebridge {

class JSI_EXPORT CslMobileBridge : public facebook::jsi::HostObject {
public:
  CslMobileBridge(facebook::jsi::Runtime& rt);

  static void install(facebook::jsi::Runtime& rt);

  facebook::jsi::Value get(facebook::jsi::Runtime&, const facebook::jsi::PropNameID& name) override;

private:
  facebook::jsi::Runtime& runtime_;
  std::unordered_map<std::string, facebook::jsi::Value> methods_;
};

} // namespace cslmobilebridge
