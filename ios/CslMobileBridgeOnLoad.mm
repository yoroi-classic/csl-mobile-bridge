#include "NativeCslMobileBridgeModule.h"
#import <Foundation/Foundation.h>
#import <ReactCommon/CxxTurboModuleUtils.h>

@interface CslMobileBridgeOnLoad : NSObject
@end

@implementation CslMobileBridgeOnLoad

+ (void)load {
  facebook::react::registerCxxModuleToGlobalModuleMap(
      std::string("CslMobileBridge"),
      [](std::shared_ptr<facebook::react::CallInvoker> jsInvoker) {
        return std::make_shared<cslmobilebridge::NativeCslMobileBridgeModule>(jsInvoker);
      });
}

@end
