import * as mod from './next.js';

export async function pickNext(...args) {
  const f =
    mod.pickNext ||
    mod.default ||
    mod.selectNext ||
    mod.getNext ||
    mod.chooseNext ||
    mod.nextItem;
  if (typeof f !== 'function') {
    throw new Error('next.js has no pickNext-compatible export');
  }
  return await f(...args);
}

export default pickNext;
