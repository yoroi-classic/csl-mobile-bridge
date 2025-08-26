package com.emurgo.cslmobilebridge

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.annotations.ReactModule

@ReactModule(name = CslMobileBridgeModule.NAME)
class CslMobileBridgeModule(reactContext: ReactApplicationContext) :
  NativeCslMobileBridgeSpec(reactContext) {

  override fun getName(): String {
    return NAME
  }

  override fun initialize() {
    super.initialize()
    install()
  }

  private external fun install()

  companion object {
    const val NAME = "CslMobileBridge"

    init {
      System.loadLibrary("react_native_csl_mobile_bridge")
    }
  }
}
