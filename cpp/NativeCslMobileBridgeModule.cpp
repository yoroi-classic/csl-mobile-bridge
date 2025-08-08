#include "NativeCslMobileBridgeModule.h"
#include <jsi/jsi.h>
#include "react_native_haskell_shelley.h"

using namespace facebook::jsi;
using namespace std;

namespace cslmobilebridge {

class BigNumNativeState : public NativeState {
public:
  BigNumNativeState(RPtr bigNumPtr) : bigNumPtr_(bigNumPtr) {}

  ~BigNumNativeState() {
    csl_bridge_rptr_free(&bigNumPtr_);
  }

  RPtr getBigNumPtr() const { return bigNumPtr_; }

private:
  RPtr bigNumPtr_;
};

static Object createBigNumObject(Runtime& runtime, const RPtr& bigNumPtr) {
  Object obj(runtime);
  auto nativeState = std::make_shared<BigNumNativeState>(bigNumPtr);
  obj.setNativeState(runtime, nativeState);
  return obj;
}

static BigNumNativeState& getBigNumNativeState(Runtime& runtime, const Object& obj) {
  if (!obj.hasNativeState<BigNumNativeState>(runtime)) {
    throw JSError(runtime, "Object is not a BigNum");
  }
  auto nativeState = obj.getNativeState<BigNumNativeState>(runtime);
  return *nativeState;
}

static Value bigNumToStr(Runtime& runtime, const Object& thisObj) {
  auto& nativeState = getBigNumNativeState(runtime, thisObj);
  CharPtr result;
  CharPtr error;
  if (!csl_bridge_big_num_to_str(nativeState.getBigNumPtr(), &result, &error)) {
    throw JSError(runtime, string(error));
  }
  auto jsString = String::createFromUtf8(runtime, string(result));
  csl_bridge_charptr_free(&result);
  return jsString;
}

static Value bigNumCheckedAdd(Runtime& runtime, const Object& thisObj, const Value& other) {
  if (!other.isObject()) {
    throw JSError(runtime, "BigNum.checked_add: Argument must be a BigNum");
  }
  
  auto& nativeState = getBigNumNativeState(runtime, thisObj);
  auto& otherNativeState = getBigNumNativeState(runtime, other.asObject(runtime));
  
  RPtr result;
  CharPtr error;
  if (!csl_bridge_big_num_checked_add(nativeState.getBigNumPtr(), otherNativeState.getBigNumPtr(), &result, &error)) {
    throw JSError(runtime, string(error));
  }
  return createBigNumObject(runtime, result);
}

static Value bigNumCheckedSub(Runtime& runtime, const Object& thisObj, const Value& other) {
  if (!other.isObject()) {
    throw JSError(runtime, "BigNum.checked_sub: Argument must be a BigNum");
  }
  
  auto& nativeState = getBigNumNativeState(runtime, thisObj);
  auto& otherNativeState = getBigNumNativeState(runtime, other.asObject(runtime));
  
  RPtr result;
  CharPtr error;
  if (!csl_bridge_big_num_checked_sub(nativeState.getBigNumPtr(), otherNativeState.getBigNumPtr(), &result, &error)) {
    throw JSError(runtime, string(error));
  }
  return createBigNumObject(runtime, result);
}

static Value bigNumClampedSub(Runtime& runtime, const Object& thisObj, const Value& other) {
  if (!other.isObject()) {
    throw JSError(runtime, "BigNum.clamped_sub: Argument must be a BigNum");
  }
  
  auto& nativeState = getBigNumNativeState(runtime, thisObj);
  auto& otherNativeState = getBigNumNativeState(runtime, other.asObject(runtime));
  
  RPtr result;
  CharPtr error;
  if (!csl_bridge_big_num_clamped_sub(nativeState.getBigNumPtr(), otherNativeState.getBigNumPtr(), &result, &error)) {
    throw JSError(runtime, string(error));
  }
  return createBigNumObject(runtime, result);
}

static Value bigNumCompare(Runtime& runtime, const Object& thisObj, const Value& other) {
  if (!other.isObject()) {
    throw JSError(runtime, "BigNum.compare: Argument must be a BigNum");
  }
  
  auto& nativeState = getBigNumNativeState(runtime, thisObj);
  auto& otherNativeState = getBigNumNativeState(runtime, other.asObject(runtime));
  
  int64_t result;
  CharPtr error;
  if (!csl_bridge_big_num_compare(nativeState.getBigNumPtr(), otherNativeState.getBigNumPtr(), &result, &error)) {
    throw JSError(runtime, string(error));
  }
  return Value((int)result);
}

void installCslMobileBridge(Runtime& runtime) {
  // Register BigNum constructor
  auto bigNumConstructor = Function::createFromHostFunction(
    runtime,
    PropNameID::forAscii(runtime, "BigNum"),
    1,
    [](Runtime& runtime, const Value& thisValue, const Value* arguments, size_t count) -> Value {
      if (count == 0) {
        throw JSError(runtime, "BigNum constructor requires arguments");
      }
      
      if (!arguments[0].isString()) {
        throw JSError(runtime, "BigNum constructor requires a string argument");
      }
      
      string str = arguments[0].getString(runtime).utf8(runtime);
      RPtr result;
      CharPtr error;
      if (!csl_bridge_big_num_from_str(str.c_str(), &result, &error)) {
        throw JSError(runtime, string(error));
      }
      return createBigNumObject(runtime, result);
    }
  );
  
  // Add prototype methods
  auto prototype = Object(runtime);
  
  prototype.setProperty(
    runtime,
    "to_str",
    Function::createFromHostFunction(
      runtime,
      PropNameID::forAscii(runtime, "to_str"),
      0,
      [](Runtime& runtime, const Value& thisValue, const Value* arguments, size_t count) -> Value {
        if (!thisValue.isObject()) {
          throw JSError(runtime, "BigNum.to_str must be called on a BigNum object");
        }
        return bigNumToStr(runtime, thisValue.asObject(runtime));
      }
    )
  );
  
  prototype.setProperty(
    runtime,
    "checked_add",
    Function::createFromHostFunction(
      runtime,
      PropNameID::forAscii(runtime, "checked_add"),
      1,
      [](Runtime& runtime, const Value& thisValue, const Value* arguments, size_t count) -> Value {
        if (!thisValue.isObject()) {
          throw JSError(runtime, "BigNum.checked_add must be called on a BigNum object");
        }
        if (count < 1) {
          throw JSError(runtime, "BigNum.checked_add requires one argument");
        }
        return bigNumCheckedAdd(runtime, thisValue.asObject(runtime), arguments[0]);
      }
    )
  );
  
  prototype.setProperty(
    runtime,
    "checked_sub",
    Function::createFromHostFunction(
      runtime,
      PropNameID::forAscii(runtime, "checked_sub"),
      1,
      [](Runtime& runtime, const Value& thisValue, const Value* arguments, size_t count) -> Value {
        if (!thisValue.isObject()) {
          throw JSError(runtime, "BigNum.checked_sub must be called on a BigNum object");
        }
        if (count < 1) {
          throw JSError(runtime, "BigNum.checked_sub requires one argument");
        }
        return bigNumCheckedSub(runtime, thisValue.asObject(runtime), arguments[0]);
      }
    )
  );
  
  prototype.setProperty(
    runtime,
    "clamped_sub",
    Function::createFromHostFunction(
      runtime,
      PropNameID::forAscii(runtime, "clamped_sub"),
      1,
      [](Runtime& runtime, const Value& thisValue, const Value* arguments, size_t count) -> Value {
        if (!thisValue.isObject()) {
          throw JSError(runtime, "BigNum.clamped_sub must be called on a BigNum object");
        }
        if (count < 1) {
          throw JSError(runtime, "BigNum.clamped_sub requires one argument");
        }
        return bigNumClampedSub(runtime, thisValue.asObject(runtime), arguments[0]);
      }
    )
  );
  
  prototype.setProperty(
    runtime,
    "compare",
    Function::createFromHostFunction(
      runtime,
      PropNameID::forAscii(runtime, "compare"),
      1,
      [](Runtime& runtime, const Value& thisValue, const Value* arguments, size_t count) -> Value {
        if (!thisValue.isObject()) {
          throw JSError(runtime, "BigNum.compare must be called on a BigNum object");
        }
        if (count < 1) {
          throw JSError(runtime, "BigNum.compare requires one argument");
        }
        return bigNumCompare(runtime, thisValue.asObject(runtime), arguments[0]);
      }
    )
  );
  
  bigNumConstructor.setProperty(runtime, "prototype", prototype);
  
  // Add static from_str method
  auto fromStr = Function::createFromHostFunction(
    runtime,
    PropNameID::forAscii(runtime, "from_str"),
    1,
    [](Runtime& runtime, const Value& thisValue, const Value* arguments, size_t count) -> Value {
      if (count == 0 || !arguments[0].isString()) {
        throw JSError(runtime, "BigNum.from_str requires a string argument");
      }
      
      string str = arguments[0].getString(runtime).utf8(runtime);
      RPtr result;
      CharPtr error;
      if (!csl_bridge_big_num_from_str(str.c_str(), &result, &error)) {
        throw JSError(runtime, string(error));
      }
      return createBigNumObject(runtime, result);
    }
  );
  
  bigNumConstructor.setProperty(runtime, "from_str", move(fromStr));
  runtime.global().setProperty(runtime, "BigNum", move(bigNumConstructor));
}

} // namespace cslmobilebridge
