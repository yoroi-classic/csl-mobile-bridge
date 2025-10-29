import CslMobileBridge from './NativeCslMobileBridge';
import * as bridgeTypes from './BridgeTypes';

let _cslBridge: typeof bridgeTypes | null = null;

const getCslBridge = (): typeof bridgeTypes => {
  if (_cslBridge === null) {
    _cslBridge = CslMobileBridge.install() as typeof bridgeTypes;
  }
  return _cslBridge;
};

const cslBridge: typeof bridgeTypes = getCslBridge();

export default cslBridge;
export const { BigNum } = cslBridge;
