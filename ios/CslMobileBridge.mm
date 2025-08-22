#import "CslMobileBridge.h"
#import "NativeCslMobileBridgeModule.h"

#import <ReactCommon/RCTTurboModule.h>
#import <ReactCommon/RCTTurboModuleWithJSIBindings.h>

@interface CslMobileBridge () <RCTTurboModuleWithJSIBindings>
@end

@implementation CslMobileBridge

RCT_EXPORT_MODULE(CslMobileBridge)

/**
 * Install JSI bindings for the CSL Mobile Bridge module
 * This method is called by React Native to set up the JSI interface
 * @param runtime The JavaScript runtime to install bindings into
 */
- (void)installJSIBindingsWithRuntime:(facebook::jsi::Runtime &)runtime
{
    cslmobilebridge::CslMobileBridge::install(runtime);
}

/**
 * Get the TurboModule instance for this module
 * @param params Initialization parameters for the TurboModule
 * @return Shared pointer to the TurboModule instance
 */
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeCslMobileBridgeSpecJSI>(params);
}

@end
