use std::ffi::{CStr, CString};
use std::os::raw::c_char;

pub type CharPtr = *const c_char;

pub fn set_message(target: &mut CharPtr, message: String) -> bool {
  match CString::new(message.replace('\0', "\\0")) {
    Ok(value) => {
      *target = value.into_raw();
      true
    }
    Err(_) => false,
  }
}

pub unsafe fn read_input<'a>(
  input: CharPtr, error: &mut CharPtr, label: &str,
) -> Option<&'a str> {
  if input.is_null() {
    set_message(error, format!("{label} is null"));
    return None;
  }
  match CStr::from_ptr(input).to_str() {
    Ok(value) => Some(value),
    Err(err) => {
      set_message(error, format!("{label} is not UTF-8: {err}"));
      None
    }
  }
}

pub trait IntoStr<T> {
  fn into_str(&self) -> T;
}

pub trait IntoCString {
  fn into_cstr(&self) -> CharPtr;
}

pub trait IntoOptionalCString {
  fn into_opt_cstr(&self) -> Option<CharPtr>;
}

impl<'a> IntoStr<&'a str> for CharPtr {
  fn into_str(&self) -> &'a str {
    unsafe { CStr::from_ptr(*self).to_str().unwrap() }
  }
}

impl IntoStr<String> for CharPtr {
  fn into_str(&self) -> String {
    unsafe { CStr::from_ptr(*self).to_str().unwrap().to_string() }
  }
}

impl IntoCString for &str {
  fn into_cstr(&self) -> CharPtr {
    CString::new(self.as_bytes()).unwrap().into_raw()
  }
}

impl IntoCString for String {
  fn into_cstr(&self) -> CharPtr {
    CString::new(self.as_bytes()).unwrap().into_raw()
  }
}

impl IntoOptionalCString for Option<&str> {
  fn into_opt_cstr(&self) -> Option<CharPtr> {
    match self {
      Some(value) => Some(value.into_cstr()),
      None => None,
    }
  }
}

#[no_mangle]
pub unsafe extern "C" fn cml_bridge_charptr_free(ptr: &mut CharPtr) {
  let _ = CString::from_raw(*ptr as *mut c_char);
  *ptr = std::ptr::null_mut();
}
