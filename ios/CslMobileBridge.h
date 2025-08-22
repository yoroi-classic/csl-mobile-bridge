#import <CslMobileBridgeSpec/CslMobileBridgeSpec.h>
#import <ReactCommon/RCTTurboModule.h>

@interface CslMobileBridge : NSObject <NativeCslMobileBridgeSpec, RCTTurboModule>

- (std::shared_ptr<facebook::react::TurboModule>)
    getTurboModule:(const facebook::react::ObjCTurboModule::InitParams &)params;

@end
