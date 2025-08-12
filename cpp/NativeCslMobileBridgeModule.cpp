#include "NativeCslMobileBridgeModule.h"
#include "react_native_haskell_shelley.h"
#include <jsi/jsi.h>
#include <memory>
#include <unordered_map>
#include <string>

using namespace facebook::jsi;
using namespace std;

namespace cslmobilebridge {

// ===== RAII Wrappers =====
struct ScopedCharPtr {
  CharPtr ptr = nullptr;
  ~ScopedCharPtr() { if (ptr) csl_bridge_charptr_free(&ptr); }
};

struct ScopedDataPtr {
  DataPtr ptr{nullptr, 0};
  ~ScopedDataPtr() { if (ptr.ptr) csl_bridge_dataptr_free(&ptr); }
};

struct ScopedErrorPtr {
  CharPtr ptr = nullptr;
  ~ScopedErrorPtr() { if (ptr) csl_bridge_charptr_free(&ptr); }
};

// ===== NativeState for BigNum =====
class BigNumNativeState : public NativeState {
public:
  explicit BigNumNativeState(RPtr ptr) : ptr_(ptr) {}
  ~BigNumNativeState() { if (ptr_._0) csl_bridge_rptr_free(&ptr_); }
  [[nodiscard]] RPtr get() const { return ptr_; }
private:
  RPtr ptr_{nullptr};
};

// ===== Helpers =====
static Object createBigNum(Runtime& runtime, const RPtr& ptr) {
  auto obj = Object(runtime);
  auto nativeState = make_shared<BigNumNativeState>(ptr);
  obj.setNativeState(runtime, nativeState);
  return obj;
}

static const BigNumNativeState& getBigNumState(Runtime& runtime, const Value& val, const char* argName) {
  if (!val.isObject()) throw JSError(runtime, string("Expected BigNum for ") + argName);
  auto obj = val.asObject(runtime);
  if (!obj.hasNativeState<BigNumNativeState>(runtime))
    throw JSError(runtime, string("Object is not a BigNum: ") + argName);
  return *obj.getNativeState<BigNumNativeState>(runtime);
}

// Generic error-handling wrapper for CSL calls returning bool
template<typename Fn>
static void callCsl(Runtime& runtime, Fn fn) {
  ScopedErrorPtr err;
  if (!fn(&err.ptr)) {
    throw JSError(runtime, err.ptr ? err.ptr : "unknown error");
  }
}

// Generic wrapper for CSL calls returning a BigNum (RPtr)
template<typename Fn>
static Value callCslBigNum(Runtime& runtime, Fn fn) {
  RPtr result;
  callCsl(runtime, [&](CharPtr* e) { return fn(&result, e); });
  return createBigNum(runtime, result);
}

// ===== HostObject =====
class CslMobileBridge : public HostObject {
public:
  explicit CslMobileBridge(Runtime& rt) {
    using FN = function<Value(Runtime&, const Value*, size_t)>;
    auto makeFn = [&](const char* name, int arity, FN fn) {
      methods_.emplace(name,
        Value(rt, Function::createFromHostFunction(rt, PropNameID::forUtf8(rt, name), arity,
          [fn](Runtime& runtime, const Value&, const Value* args, size_t count) { return fn(runtime, args, count); }
        ))
      );
    };

    // ==== BigNum methods ====
    makeFn("bigNumFromStr", 1, [](Runtime& rt, const Value* args, size_t) {
      auto str = args[0].asString(rt).utf8(rt);
      RPtr result;
      callCsl(rt, [&](CharPtr* e) { return csl_bridge_big_num_from_str(str.c_str(), &result, e); });
      return createBigNum(rt, result);
    });

    makeFn("bigNumToStr", 1, [](Runtime& rt, const Value* args, size_t) {
      auto& a = getBigNumState(rt, args[0], "bigNumToStr.arg0");
      ScopedCharPtr out;
      callCsl(rt, [&](CharPtr* e) { return csl_bridge_big_num_to_str(a.get(), &out.ptr, e); });
      return String::createFromUtf8(rt, out.ptr);
    });

    makeFn("bigNumCheckedAdd", 2, [](Runtime& rt, const Value* args, size_t) {
      auto& a = getBigNumState(rt, args[0], "a");
      auto& b = getBigNumState(rt, args[1], "b");
      return callCslBigNum(rt, [&](RPtr* r, CharPtr* e) { return csl_bridge_big_num_checked_add(a.get(), b.get(), r, e); });
    });

    makeFn("bigNumCheckedSub", 2, [](Runtime& rt, const Value* args, size_t) {
        auto& a = getBigNumState(rt, args[0], "a");
        auto& b = getBigNumState(rt, args[1], "b");
        return callCslBigNum(rt, [&](RPtr* r, CharPtr* e) { return csl_bridge_big_num_checked_sub(a.get(), b.get(), r, e); });
    });

    makeFn("bigNumClampedSub", 2, [](Runtime& rt, const Value* args, size_t) {
        auto& a = getBigNumState(rt, args[0], "a");
        auto& b = getBigNumState(rt, args[1], "b");
        return callCslBigNum(rt, [&](RPtr* r, CharPtr* e) { return csl_bridge_big_num_clamped_sub(a.get(), b.get(), r, e); });
    });

    makeFn("bigNumCompare", 2, [](Runtime& rt, const Value* args, size_t) {
        auto& a = getBigNumState(rt, args[0], "a");
        auto& b = getBigNumState(rt, args[1], "b");
        int64_t result;
        callCsl(rt, [&](CharPtr* e) { return csl_bridge_big_num_compare(a.get(), b.get(), &result, e); });
        return Value((int)result);
    });

    makeFn("bigNumIsZero", 1, [](Runtime& rt, const Value* args, size_t) {
        auto& a = getBigNumState(rt, args[0], "a");
        bool result;
        callCsl(rt, [&](CharPtr* e) { return csl_bridge_big_num_is_zero(a.get(), &result, e); });
        return Value(result);
    });

    makeFn("bigNumCheckedMul", 2, [](Runtime& rt, const Value* args, size_t) {
        auto& a = getBigNumState(rt, args[0], "a");
        auto& b = getBigNumState(rt, args[1], "b");
        return callCslBigNum(rt, [&](RPtr* r, CharPtr* e) { return csl_bridge_big_num_checked_mul(a.get(), b.get(), r, e); });
    });

    makeFn("bigNumDivFloor", 2, [](Runtime& rt, const Value* args, size_t) {
        auto& a = getBigNumState(rt, args[0], "a");
        auto& b = getBigNumState(rt, args[1], "b");
        return callCslBigNum(rt, [&](RPtr* r, CharPtr* e) { return csl_bridge_big_num_div_floor(a.get(), b.get(), r, e); });
    });

    makeFn("bigNumLessThan", 2, [](Runtime& rt, const Value* args, size_t) {
        auto& a = getBigNumState(rt, args[0], "a");
        auto& b = getBigNumState(rt, args[1], "b");
        bool result;
        callCsl(rt, [&](CharPtr* e) { return csl_bridge_big_num_less_than(a.get(), b.get(), &result, e); });
        return Value(result);
    });

    makeFn("bigNumToHex", 1, [](Runtime& rt, const Value* args, size_t) {
        auto& a = getBigNumState(rt, args[0], "a");
        ScopedCharPtr out;
        callCsl(rt, [&](CharPtr* e) { return csl_bridge_big_num_to_hex(a.get(), &out.ptr, e); });
        return String::createFromUtf8(rt, out.ptr);
    });

    makeFn("bigNumToJson", 1, [](Runtime& rt, const Value* args, size_t) {
        auto& a = getBigNumState(rt, args[0], "a");
        ScopedCharPtr out;
        callCsl(rt, [&](CharPtr* e) { return csl_bridge_big_num_to_json(a.get(), &out.ptr, e); });
        return String::createFromUtf8(rt, out.ptr);
    });

    makeFn("bigNumFromBytes", 1, [](Runtime& rt, const Value* args, size_t) {
      auto array = args[0].asObject(rt).asArray(rt);
      auto size = array.size(rt);
      std::vector<uint8_t> bytes(size);
      for (size_t i = 0; i < size; ++i) {
        bytes[i] = static_cast<uint8_t>(array.getValueAtIndex(rt, i).asNumber());
      }
      RPtr result;
      callCsl(rt, [&](CharPtr* e) { return csl_bridge_big_num_from_bytes(bytes.data(), size, &result, e); });
      return createBigNum(rt, result);
    });

    makeFn("bigNumToBytes", 1, [](Runtime& rt, const Value* args, size_t) {
      auto& a = getBigNumState(rt, args[0], "a");
      ScopedDataPtr out;
      callCsl(rt, [&](CharPtr* e) { return csl_bridge_big_num_to_bytes(a.get(), &out.ptr, e); });
      auto array = Array(rt, out.ptr.len);
      for (size_t i = 0; i < out.ptr.len; ++i) {
        array.setValueAtIndex(rt, i, Value(static_cast<double>(out.ptr.ptr[i])));
      }
      return array;
    });

    // Constants
    makeFn("bigNumZero", 0, [](Runtime& rt, const Value*, size_t) {
      return callCslBigNum(rt, csl_bridge_big_num_zero);
    });
    makeFn("bigNumOne", 0, [](Runtime& rt, const Value*, size_t) {
      return callCslBigNum(rt, csl_bridge_big_num_one);
    });
    makeFn("bigNumMaxValue", 0, [](Runtime& rt, const Value*, size_t) {
      return callCslBigNum(rt, csl_bridge_big_num_max_value);
    });
  }

  Value get(Runtime& rt, const PropNameID& name) override {
    auto it = methods_.find(name.utf8(rt));
    return it != methods_.end() ? Value(rt, it->second) : Value::undefined();
  }

  static void install(Runtime& rt) {
    rt.global().setProperty(rt, "CslMobileBridge",
      Object::createFromHostObject(rt, make_shared<CslMobileBridge>(rt)));
  }

private:
  unordered_map<string, Value> methods_;
};

} // namespace cslmobilebridge
