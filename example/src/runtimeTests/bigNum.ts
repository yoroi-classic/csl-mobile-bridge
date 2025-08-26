import {BigNum} from '@emurgo/csl-mobile-bridge';

import {assert} from '../util';

const bigNum = () => {
  const bigNumStr = '1000000';
  const bigNumPtr = BigNum.from_str(bigNumStr);
  assert(
    bigNumPtr.to_str() === bigNumStr,
    'BigNum.to_str() should match original input value',
  );
  const bigNum2 = BigNum.from_str('500');
  assert(
    bigNumPtr.checked_add(bigNum2).to_str() === '1000500',
    'BigNum.checked_add()',
  );
  assert(
    bigNumPtr.checked_sub(bigNum2).to_str() === '999500',
    'BigNum.checked_sub()',
  );
  assert(
    bigNum2.clamped_sub(bigNumPtr).to_str() === '0',
    'BigNum.clamped_sub()',
  );
  assert(bigNumPtr.compare(bigNum2) === 1, 'BigNum.compare()');
};

export default bigNum;
