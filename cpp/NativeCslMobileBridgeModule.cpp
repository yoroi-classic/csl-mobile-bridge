#include "NativeCslMobileBridgeModule.h"

#include <jsi/jsi.h>
#include <memory>
#include <string>
#include <vector>
#include <cstdint>
#include <optional>

using namespace facebook;

extern "C" {
#include "react_native_haskell_shelley.h"
}

namespace cslmobilebridge {

NativeCslMobileBridgeModule::NativeCslMobileBridgeModule(
    std::shared_ptr<facebook::react::CallInvoker> jsInvoker)
  : facebook::react::NativeCslMobileBridgeCxxSpec<NativeCslMobileBridgeModule>(std::move(jsInvoker)) {}

// ============================ RAII wrappers ============================
struct ScopedCharPtr {
  CharPtr ptr = nullptr;
  ~ScopedCharPtr() { if (ptr) csl_bridge_charptr_free(&ptr); }
};

struct ScopedDataPtr {
  DataPtr ptr{nullptr, 0};
  ~ScopedDataPtr() { if (ptr.ptr) csl_bridge_dataptr_free(&ptr); }
};

// ============================ NativeState =============================
class BigNumNativeState : public jsi::NativeState {
public:
  explicit BigNumNativeState(RPtr ptr) : ptr_(ptr) {}
  ~BigNumNativeState() { if (ptr_._0) csl_bridge_rptr_free(&ptr_); }
  [[nodiscard]] RPtr get() const { return ptr_; }
private:
  RPtr ptr_{nullptr};
};

// ============================ Helpers =================================
static std::shared_ptr<BigNumNativeState> getBigNumState(
    jsi::Runtime& rt, const jsi::Object& val, const char* argName) {
  if (!val.hasNativeState<BigNumNativeState>(rt)) {
    throw jsi::JSError(rt, std::string("Expected BigNum for ") + argName);
  }
  return val.getNativeState<BigNumNativeState>(rt);
}

static std::shared_ptr<BigNumNativeState> getThisBigNumState(jsi::Runtime& rt, const jsi::Value& thisVal) {
  if (!thisVal.isObject()) throw jsi::JSError(rt, "BigNum method: 'this' is not an object");
  return getBigNumState(rt, thisVal.asObject(rt), "this");
}

static jsi::Array callCslArray(jsi::Runtime& rt, std::function<bool(DataPtr*, CharPtr*)> fn) {
  ScopedDataPtr data;
  ScopedCharPtr err;
  if (!fn(&data.ptr, &err.ptr)) {
    throw jsi::JSError(rt, err.ptr ? err.ptr : "Unknown CSL error");
  }
  jsi::Array arr(rt, data.ptr.len);
  for (size_t i = 0; i < data.ptr.len; ++i) {
    arr.setValueAtIndex(rt, i, jsi::Value(static_cast<double>(data.ptr.ptr[i])));
  }
  return arr;
}

static jsi::String callCslString(jsi::Runtime& rt, std::function<bool(CharPtr*, CharPtr*)> fn) {
  ScopedCharPtr out;
  ScopedCharPtr err;
  if (!fn(&out.ptr, &err.ptr)) {
    throw jsi::JSError(rt, err.ptr ? err.ptr : "Unknown CSL error");
  }
  return jsi::String::createFromUtf8(rt, out.ptr ? out.ptr : "");
}

static jsi::Object callCslBigNum(jsi::Runtime& rt, std::function<bool(RPtr*, CharPtr*)> fn);

// -------- common helper: attach prototype (Object.setPrototypeOf / __proto__) -----
static void setPrototype(jsi::Runtime& rt, jsi::Object& obj, jsi::Object& proto) {
  // Path 1: Object.setPrototypeOf(obj, proto)
  auto ObjectCtor = rt.global().getPropertyAsObject(rt, "Object");
  if (ObjectCtor.isFunction(rt)) {
    auto setProtoVal = ObjectCtor.getProperty(rt, "setPrototypeOf");
    if (setProtoVal.isObject() && setProtoVal.asObject(rt).isFunction(rt)) {
      auto setProto = setProtoVal.asObject(rt).asFunction(rt);
      setProto.call(rt, obj, proto);
      return;
    }
  }
  // Path 2 (fallback): __proto__
  obj.setProperty(rt, "__proto__", proto);
}

static std::optional<jsi::WeakObject> s_bigNumProtoWeak;

static jsi::Object getOrCreateBigNumProto(jsi::Runtime& rt) {
  if (s_bigNumProtoWeak.has_value()) {
    auto locked = s_bigNumProtoWeak->lock(rt);
    if (locked.isObject()) {
      return locked.asObject(rt);
    }
  }

  jsi::Object proto(rt);

  // to_hex(): string
  proto.setProperty(rt, "to_hex",
    jsi::Function::createFromHostFunction(rt, jsi::PropNameID::forAscii(rt, "to_hex"), 0,
      [](jsi::Runtime& rt, const jsi::Value& thisVal, const jsi::Value*, size_t) -> jsi::Value {
        auto st = getThisBigNumState(rt, thisVal);
        return callCslString(rt, [&](CharPtr* out, CharPtr* err) {
          return csl_bridge_big_num_to_hex(st->get(), out, err);
        });
      }
    )
  );

  // to_str(): string
  proto.setProperty(rt, "to_str",
    jsi::Function::createFromHostFunction(rt, jsi::PropNameID::forAscii(rt, "to_str"), 0,
      [](jsi::Runtime& rt, const jsi::Value& thisVal, const jsi::Value*, size_t) -> jsi::Value {
        auto st = getThisBigNumState(rt, thisVal);
        return callCslString(rt, [&](CharPtr* out, CharPtr* err) {
          return csl_bridge_big_num_to_str(st->get(), out, err);
        });
      }
    )
  );

  // to_json(): string
  proto.setProperty(rt, "to_json",
    jsi::Function::createFromHostFunction(rt, jsi::PropNameID::forAscii(rt, "to_json"), 0,
      [](jsi::Runtime& rt, const jsi::Value& thisVal, const jsi::Value*, size_t) -> jsi::Value {
        auto st = getThisBigNumState(rt, thisVal);
        return callCslString(rt, [&](CharPtr* out, CharPtr* err) {
          return csl_bridge_big_num_to_json(st->get(), out, err);
        });
      }
    )
  );

  // to_bytes(): number[]
  proto.setProperty(rt, "to_bytes",
    jsi::Function::createFromHostFunction(rt, jsi::PropNameID::forAscii(rt, "to_bytes"), 0,
      [](jsi::Runtime& rt, const jsi::Value& thisVal, const jsi::Value*, size_t) -> jsi::Value {
        auto st = getThisBigNumState(rt, thisVal);
        return callCslArray(rt, [&](DataPtr* d, CharPtr* e) {
          return csl_bridge_big_num_to_bytes(st->get(), d, e);
        });
      }
    )
  );

  // is_zero(): boolean
  proto.setProperty(rt, "is_zero",
    jsi::Function::createFromHostFunction(rt, jsi::PropNameID::forAscii(rt, "is_zero"), 0,
      [](jsi::Runtime& rt, const jsi::Value& thisVal, const jsi::Value*, size_t) -> jsi::Value {
        auto st = getThisBigNumState(rt, thisVal);
        bool res = false; ScopedCharPtr err;
        if (!csl_bridge_big_num_is_zero(st->get(), &res, &err.ptr)) {
          throw jsi::JSError(rt, err.ptr ? err.ptr : "Unknown CSL error");
        }
        return jsi::Value(res);
      }
    )
  );

  // div_floor(other): BigNum
  proto.setProperty(rt, "div_floor",
    jsi::Function::createFromHostFunction(rt, jsi::PropNameID::forAscii(rt, "div_floor"), 1,
      [](jsi::Runtime& rt, const jsi::Value& thisVal, const jsi::Value* args, size_t count) -> jsi::Value {
        if (count < 1 || !args[0].isObject()) throw jsi::JSError(rt, "BigNum.div_floor(other) requires BigNum");
        auto st  = getThisBigNumState(rt, thisVal);
        auto oth = getBigNumState(rt, args[0].asObject(rt), "other");
        return callCslBigNum(rt, [&](RPtr* out, CharPtr* e) {
          return csl_bridge_big_num_div_floor(st->get(), oth->get(), out, e);
        });
      }
    )
  );

  // checked_add/sub/mul(other): BigNum
  auto addBinOp = [&](const char* name, bool(*fn)(RPtr, RPtr, RPtr*, CharPtr*)) {
    proto.setProperty(rt, name,
      jsi::Function::createFromHostFunction(rt, jsi::PropNameID::forAscii(rt, name), 1,
        [fn](jsi::Runtime& rt, const jsi::Value& thisVal, const jsi::Value* args, size_t count) -> jsi::Value {
          if (count < 1 || !args[0].isObject())
            throw jsi::JSError(rt, "BigNum.*(other) requires BigNum");
          auto st  = getThisBigNumState(rt, thisVal);
          auto oth = getBigNumState(rt, args[0].asObject(rt), "other");
          return callCslBigNum(rt, [&](RPtr* out, CharPtr* e) {
            return fn(st->get(), oth->get(), out, e);
          });
        }
      )
    );
  };
  addBinOp("checked_add", &csl_bridge_big_num_checked_add);
  addBinOp("checked_sub", &csl_bridge_big_num_checked_sub);
  addBinOp("checked_mul", &csl_bridge_big_num_checked_mul);

  // clamped_sub(other): BigNum
  proto.setProperty(rt, "clamped_sub",
    jsi::Function::createFromHostFunction(rt, jsi::PropNameID::forAscii(rt, "clamped_sub"), 1,
      [](jsi::Runtime& rt, const jsi::Value& thisVal, const jsi::Value* args, size_t count) -> jsi::Value {
        if (count < 1 || !args[0].isObject()) throw jsi::JSError(rt, "BigNum.clamped_sub(other) requires BigNum");
        auto st  = getThisBigNumState(rt, thisVal);
        auto oth = getBigNumState(rt, args[0].asObject(rt), "other");
        return callCslBigNum(rt, [&](RPtr* out, CharPtr* e) {
          return csl_bridge_big_num_clamped_sub(st->get(), oth->get(), out, e);
        });
      }
    )
  );

  // less_than(rhs): boolean
  proto.setProperty(rt, "less_than",
    jsi::Function::createFromHostFunction(rt, jsi::PropNameID::forAscii(rt, "less_than"), 1,
      [](jsi::Runtime& rt, const jsi::Value& thisVal, const jsi::Value* args, size_t count) -> jsi::Value {
        if (count < 1 || !args[0].isObject()) throw jsi::JSError(rt, "BigNum.less_than(rhs) requires BigNum");
        auto st  = getThisBigNumState(rt, thisVal);
        auto rhs = getBigNumState(rt, args[0].asObject(rt), "rhs");
        bool res=false; ScopedCharPtr err;
        if (!csl_bridge_big_num_less_than(st->get(), rhs->get(), &res, &err.ptr)) {
          throw jsi::JSError(rt, err.ptr ? err.ptr : "Unknown CSL error");
        }
        return jsi::Value(res);
      }
    )
  );

  // compare(rhs): number
  proto.setProperty(rt, "compare",
    jsi::Function::createFromHostFunction(rt, jsi::PropNameID::forAscii(rt, "compare"), 1,
      [](jsi::Runtime& rt, const jsi::Value& thisVal, const jsi::Value* args, size_t count) -> jsi::Value {
        if (count < 1 || !args[0].isObject()) throw jsi::JSError(rt, "BigNum.compare(rhs) requires BigNum");
        auto st  = getThisBigNumState(rt, thisVal);
        auto rhs = getBigNumState(rt, args[0].asObject(rt), "rhs");
        int64_t ord=0; ScopedCharPtr err;
        if (!csl_bridge_big_num_compare(st->get(), rhs->get(), &ord, &err.ptr)) {
          throw jsi::JSError(rt, err.ptr ? err.ptr : "Unknown CSL error");
        }
        return jsi::Value(static_cast<double>(ord));
      }
    )
  );

  // Freeze the prototype, to prevent JS from changing methods accidentally
  auto ObjectCtor = rt.global().getPropertyAsObject(rt, "Object");
  if (ObjectCtor.isFunction(rt)) {
    auto freezeVal = ObjectCtor.getProperty(rt, "freeze");
    if (freezeVal.isObject() && freezeVal.asObject(rt).isFunction(rt)) {
      freezeVal.asObject(rt).asFunction(rt).call(rt, proto);
    }
  }

  // Save as weak, to not interfere with GC
  s_bigNumProtoWeak = jsi::WeakObject(rt, proto);
  return proto;
}

// ---------- Wrappers to create BigNum and attach prototype --------------
static jsi::Object createBigNumRaw(jsi::Runtime& rt, const RPtr& ptr) {
  jsi::Object obj(rt);
  obj.setNativeState(rt, std::make_shared<BigNumNativeState>(ptr));
  return obj;
}

static jsi::Object makeBigNumInstance(jsi::Runtime& rt, const RPtr& ptr) {
  jsi::Object obj = createBigNumRaw(rt, ptr);
  jsi::Object proto = getOrCreateBigNumProto(rt);
  setPrototype(rt, obj, proto);
  return obj;
}

static jsi::Object callCslBigNum(jsi::Runtime& rt, std::function<bool(RPtr*, CharPtr*)> fn) {
  RPtr result{nullptr};
  ScopedCharPtr err;
  if (!fn(&result, &err.ptr)) {
    throw jsi::JSError(rt, err.ptr ? err.ptr : "Unknown CSL error");
  }
  return makeBigNumInstance(rt, result);
}

// ===================== BigNum "class" export (static) ========================
static jsi::Object makeBigNumExport(jsi::Runtime& rt) {
  jsi::Object ns(rt);

  ns.setProperty(rt, "from_hex",
    jsi::Function::createFromHostFunction(rt, jsi::PropNameID::forAscii(rt, "from_hex"), 1,
      [](jsi::Runtime& rt, const jsi::Value&, const jsi::Value* args, size_t count) -> jsi::Value {
        if (count < 1 || !args[0].isString()) throw jsi::JSError(rt, "BigNum.from_hex(hex) requires string");
        std::string hex = args[0].asString(rt).utf8(rt);
        return callCslBigNum(rt, [&](RPtr* out, CharPtr* e) {
          return csl_bridge_big_num_from_hex(hex.c_str(), out, e);
        });
      }
    )
  );

  ns.setProperty(rt, "from_str",
    jsi::Function::createFromHostFunction(rt, jsi::PropNameID::forAscii(rt, "from_str"), 1,
      [](jsi::Runtime& rt, const jsi::Value&, const jsi::Value* args, size_t count) -> jsi::Value {
        if (count < 1 || !args[0].isString()) throw jsi::JSError(rt, "BigNum.from_str(s) requires string");
        std::string s = args[0].asString(rt).utf8(rt);
        return callCslBigNum(rt, [&](RPtr* out, CharPtr* e) {
          return csl_bridge_big_num_from_str(s.c_str(), out, e);
        });
      }
    )
  );

  ns.setProperty(rt, "from_json",
    jsi::Function::createFromHostFunction(rt, jsi::PropNameID::forAscii(rt, "from_json"), 1,
      [](jsi::Runtime& rt, const jsi::Value&, const jsi::Value* args, size_t count) -> jsi::Value {
        if (count < 1 || !args[0].isString()) throw jsi::JSError(rt, "BigNum.from_json(json) requires string");
        std::string json = args[0].asString(rt).utf8(rt);
        return callCslBigNum(rt, [&](RPtr* out, CharPtr* e) {
          return csl_bridge_big_num_from_json(json.c_str(), out, e);
        });
      }
    )
  );

  ns.setProperty(rt, "from_bytes",
    jsi::Function::createFromHostFunction(rt, jsi::PropNameID::forAscii(rt, "from_bytes"), 1,
      [](jsi::Runtime& rt, const jsi::Value&, const jsi::Value* args, size_t count) -> jsi::Value {
        if (count < 1 || !args[0].isObject() || !args[0].asObject(rt).isArray(rt)) {
          throw jsi::JSError(rt, "BigNum.from_bytes(bytes) requires number[]");
        }
        auto arr = args[0].asObject(rt).asArray(rt);
        size_t n = arr.length(rt);
        std::vector<uint8_t> buf; buf.reserve(n);
        for (size_t i = 0; i < n; ++i) {
          auto v = arr.getValueAtIndex(rt, i);
          if (!v.isNumber()) throw jsi::JSError(rt, "BigNum.from_bytes: array must contain numbers");
          double d = v.asNumber();
          if (d < 0 || d > 255) throw jsi::JSError(rt, "BigNum.from_bytes: byte out of range 0..255");
          buf.push_back(static_cast<uint8_t>(static_cast<int>(d)));
        }
        return callCslBigNum(rt, [&](RPtr* out, CharPtr* e) {
          return csl_bridge_big_num_from_bytes(buf.data(), static_cast<uintptr_t>(buf.size()), out, e);
        });
      }
    )
  );

  ns.setProperty(rt, "zero",
    jsi::Function::createFromHostFunction(rt, jsi::PropNameID::forAscii(rt, "zero"), 0,
      [](jsi::Runtime& rt, const jsi::Value&, const jsi::Value*, size_t) -> jsi::Value {
        return callCslBigNum(rt, [&](RPtr* out, CharPtr* e) { return csl_bridge_big_num_zero(out, e); });
      }
    )
  );

  ns.setProperty(rt, "one",
    jsi::Function::createFromHostFunction(rt, jsi::PropNameID::forAscii(rt, "one"), 0,
      [](jsi::Runtime& rt, const jsi::Value&, const jsi::Value*, size_t) -> jsi::Value {
        return callCslBigNum(rt, [&](RPtr* out, CharPtr* e) { return csl_bridge_big_num_one(out, e); });
      }
    )
  );

  ns.setProperty(rt, "max_value",
    jsi::Function::createFromHostFunction(rt, jsi::PropNameID::forAscii(rt, "max_value"), 0,
      [](jsi::Runtime& rt, const jsi::Value&, const jsi::Value*, size_t) -> jsi::Value {
        return callCslBigNum(rt, [&](RPtr* out, CharPtr* e) { return csl_bridge_big_num_max_value(out, e); });
      }
    )
  );

  ns.setProperty(rt, "max",
    jsi::Function::createFromHostFunction(rt, jsi::PropNameID::forAscii(rt, "max"), 2,
      [](jsi::Runtime& rt, const jsi::Value&, const jsi::Value* args, size_t count) -> jsi::Value {
        if (count < 2 || !args[0].isObject() || !args[1].isObject()) {
          throw jsi::JSError(rt, "BigNum.max(a,b) requires two BigNum");
        }
        auto a = getBigNumState(rt, args[0].asObject(rt), "a");
        auto b = getBigNumState(rt, args[1].asObject(rt), "b");
        return callCslBigNum(rt, [&](RPtr* out, CharPtr* e) {
          return csl_bridge_big_num_max(a->get(), b->get(), out, e);
        });
      }
    )
  );

  auto ObjectCtor = rt.global().getPropertyAsObject(rt, "Object");
  if (ObjectCtor.isFunction(rt)) {
    auto freezeVal = ObjectCtor.getProperty(rt, "freeze");
    if (freezeVal.isObject() && freezeVal.asObject(rt).isFunction(rt)) {
      freezeVal.asObject(rt).asFunction(rt).call(rt, ns);
    }
  }

  return ns;
}

static jsi::Object installBridgeExports(jsi::Runtime& rt) {
  jsi::Object exports(rt);
  exports.setProperty(rt, "BigNum", makeBigNumExport(rt));
  return exports;
}

jsi::Object NativeCslMobileBridgeModule::install(jsi::Runtime &rt) {
  return installBridgeExports(rt);
}

} // namespace cslmobilebridge
