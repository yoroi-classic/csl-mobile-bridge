package cloud.blinklabs.yoroi.cslmobilebridge;

import androidx.annotation.Nullable;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.turbomodule.core.interfaces.TurboModule;
import com.facebook.react.bridge.ReactContextBaseJavaModule;

public class CslMobileBridgeModule extends ReactContextBaseJavaModule implements TurboModule {
  public static final String NAME = "CslMobileBridge";

  public CslMobileBridgeModule(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @Override
  public String getName() {
    return NAME;
  }
}
