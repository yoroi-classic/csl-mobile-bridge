#include "NativeCmlMobileBridgeModule.h"
#import <Foundation/Foundation.h>
#import <ReactCommon/CxxTurboModuleUtils.h>

@interface CmlMobileBridgeOnLoad : NSObject
@end

@implementation CmlMobileBridgeOnLoad

+ (void)load {
  facebook::react::registerCxxModuleToGlobalModuleMap(
      std::string("CmlMobileBridge"),
      [](std::shared_ptr<facebook::react::CallInvoker> jsInvoker) {
        return std::make_shared<cmlmobilebridge::NativeCmlMobileBridgeModule>(jsInvoker);
      });
}

@end
