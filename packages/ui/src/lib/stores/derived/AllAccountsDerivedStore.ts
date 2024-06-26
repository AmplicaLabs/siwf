import { derived } from 'svelte/store';
import { type ConnectedExtensionMap, ConnectedExtensionsDerivedStore } from './ConnectedExtensionsDerivedStore';
import type { InjectedAccount } from '@polkadot/extension-inject/types';

/// Store that maps public key address to the names of wallet extensions that provide it

export interface InjectedAccountWithExtensions extends InjectedAccount {
  wallets: Set<string>;
}

export type AccountMap = Record<string, InjectedAccountWithExtensions>;

function updateAccount(map: AccountMap, account: InjectedAccount, wallet: string) {
  const value = map?.[account.address] ?? { ...account, wallets: new Set<string>() };
  value.wallets.add(wallet);
  map[account.address] = value;
}

export const AllAccountsDerivedStore = derived(
  [ConnectedExtensionsDerivedStore],
  ([$ConnectedExtensionsDerivedStore], set) => {
    const accountMap: AccountMap = {};
    if (!!$ConnectedExtensionsDerivedStore) {
      const extensionMap: ConnectedExtensionMap = $ConnectedExtensionsDerivedStore;
      for (const extension of Object.values(extensionMap)) {
        for (const account of extension.accounts) {
          updateAccount(accountMap, account, extension.injectedName);
        }
      }
    }
    set(accountMap);
  },
  {} as AccountMap
);
