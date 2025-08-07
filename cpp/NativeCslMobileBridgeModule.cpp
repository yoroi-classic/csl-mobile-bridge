#include "NativeCslMobileBridgeModule.h"
#include <jsi/jsi.h>
#include "react_native_haskell_shelley.h"

using namespace facebook::jsi;
using namespace std;

namespace cslmobilebridge {

class BigNumHostObject : public HostObject {
public:
  BigNumHostObject(RPtr bigNumPtr) : bigNumPtr_(bigNumPtr) {}

  ~BigNumHostObject() {
    csl_bridge_rptr_free(&bigNumPtr_);
  }

  static Value create(Runtime& runtime, const RPtr& bigNumPtr) {
    auto hostObject = make_shared<BigNumHostObject>(bigNumPtr);
    return Object::createFromHostObject(runtime, hostObject);
  }

  static void registerHostObject(Runtime& runtime, const RPtr& bigNumPtr) {
    auto object = create(runtime, bigNumPtr);
    runtime.global().setProperty(runtime, "BigNum", move(object));
  }

  Value get(Runtime& runtime, const PropNameID& name) override {
    auto methodName = name.utf8(runtime);
    
    if (methodName == "to_str") {
      return Function::createFromHostFunction(
        runtime,
        name,
        0,
        [this](Runtime& runtime, const Value& thisValue, const Value* arguments, size_t count) -> Value {
          CharPtr result;
          CharPtr error;
          if (!csl_bridge_big_num_to_str(bigNumPtr_, &result, &error)) {
            throw JSError(runtime, string(error));
          }
          auto jsString = String::createFromUtf8(runtime, string(result));
          csl_bridge_charptr_free(&result);
          return jsString;
        }
      );
    }
    else if (methodName == "checked_add") {
      return Function::createFromHostFunction(
        runtime,
        name,
        1,
        [this](Runtime& runtime, const Value& thisValue, const Value* arguments, size_t count) -> Value {
          if (!arguments[0].isObject()) {
            throw JSError(runtime, "BigNum.checked_add: Argument must be a BigNum");
          }
          
          auto otherHostObject = arguments[0].asObject(runtime).getHostObject<BigNumHostObject>(runtime);
          RPtr result;
          CharPtr error;
          if (!csl_bridge_big_num_checked_add(bigNumPtr_, otherHostObject->bigNumPtr_, &result, &error)) {
            throw JSError(runtime, string(error));
          }
          return create(runtime, result);
        }
      );
    }
    else if (methodName == "checked_sub") {
      return Function::createFromHostFunction(
        runtime,
        name,
        1,
        [this](Runtime& runtime, const Value& thisValue, const Value* arguments, size_t count) -> Value {
          if (!arguments[0].isObject()) {
            throw JSError(runtime, "BigNum.checked_sub: Argument must be a BigNum");
          }
          
          auto otherHostObject = arguments[0].asObject(runtime).getHostObject<BigNumHostObject>(runtime);
          RPtr result;
          CharPtr error;
          if (!csl_bridge_big_num_checked_sub(bigNumPtr_, otherHostObject->bigNumPtr_, &result, &error)) {
            throw JSError(runtime, string(error));
          }
          return create(runtime, result);
        }
      );
    }
    else if (methodName == "clamped_sub") {
      return Function::createFromHostFunction(
        runtime,
        name,
        1,
        [this](Runtime& runtime, const Value& thisValue, const Value* arguments, size_t count) -> Value {
          if (!arguments[0].isObject()) {
            throw JSError(runtime, "BigNum.clamped_sub: Argument must be a BigNum");
          }
          
          auto otherHostObject = arguments[0].asObject(runtime).getHostObject<BigNumHostObject>(runtime);
          RPtr result;
          CharPtr error;
          if (!csl_bridge_big_num_clamped_sub(bigNumPtr_, otherHostObject->bigNumPtr_, &result, &error)) {
            throw JSError(runtime, string(error));
          }
          return create(runtime, result);
        }
      );
    }
    else if (methodName == "compare") {
      return Function::createFromHostFunction(
        runtime,
        name,
        1,
        [this](Runtime& runtime, const Value& thisValue, const Value* arguments, size_t count) -> Value {
          if (!arguments[0].isObject()) {
            throw JSError(runtime, "BigNum.compare: Argument must be a BigNum");
          }
          
          auto otherHostObject = arguments[0].asObject(runtime).getHostObject<BigNumHostObject>(runtime);
          int64_t result;
          CharPtr error;
          if (!csl_bridge_big_num_compare(bigNumPtr_, otherHostObject->bigNumPtr_, &result, &error)) {
            throw JSError(runtime, string(error));
          }
          return Value((int)result);
        }
      );
    }
    
    return Value::undefined();
  }

private:
  RPtr bigNumPtr_;
};

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
        throw JSError(runtime, "BigNum.from_str requires a string argument");
      }
      
      string str = arguments[0].getString(runtime).utf8(runtime);
      RPtr result;
      CharPtr error;
      if (!csl_bridge_big_num_from_str(str.c_str(), &result, &error)) {
        throw JSError(runtime, string(error));
      }
      return BigNumHostObject::create(runtime, result);
    }
  );
  
  // Add static from_str method
  auto fromStr = Function::createFromHostFunction(
    runtime,
    PropNameID::forAscii(runtime, "from_str"),
    1,
    [](Runtime& runtime, const Value& thisValue, const Value* arguments, size_t count) -> Value {
      if (count == 0) {
        throw JSError(runtime, "BigNum.from_str requires a string argument");
      }
      
      string str = arguments[0].getString(runtime).utf8(runtime);
      RPtr result;
      CharPtr error;
      if (!csl_bridge_big_num_from_str(str.c_str(), &result, &error)) {
        throw JSError(runtime, string(error));
      }
      return BigNumHostObject::create(runtime, result);
    }
  );
  
  bigNumConstructor.setProperty(runtime, "from_str", move(fromStr));
  runtime.global().setProperty(runtime, "BigNum", move(bigNumConstructor));
}

} // namespace cslmobilebridge
