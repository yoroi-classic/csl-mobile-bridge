package cloud.blinklabs.yoroi.cmlmobilebridge;

import androidx.annotation.Nullable;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.turbomodule.core.interfaces.TurboModule;
import com.facebook.react.bridge.ReactContextBaseJavaModule;

public class CmlMobileBridgeModule extends ReactContextBaseJavaModule implements TurboModule {
  public static final String NAME = "CmlMobileBridge";

  public CmlMobileBridgeModule(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @Override
  public String getName() {
    return NAME;
  }
}
