export type Extension = {
  displayName: string;
  injectedName: string;
  downloadUrl: {
    browser?: Record<string, string> | undefined;
    app?: Record<string, string>;
  };
  logo?: Record<string, any>;
};

export const extensionsConfig: Extension[] = [
  {
    displayName: 'Polkadot',
    injectedName: 'polkadot-js',
    downloadUrl: {
      browser: {
        chrome: 'https://chrome.google.com/webstore/detail/talisman-polkadot-and-eth/fijngjgcjhjmmpcmkeiomlglpeiijkld',
        firefox: 'https://addons.mozilla.org/en-US/firefox/addon/polkadot-js-extension/',
      },
    },
  },
  {
    displayName: 'Talisman',
    injectedName: 'talisman',
    downloadUrl: {
      browser: {
        chrome: 'https://chrome.google.com/webstore/detail/polkadot%7Bjs%7D-extension/mopnmbcafieddcagagdcbnhejhlodfdd',
      },
    },
    // logo: { component: TalismanIcon, size: '5em' },
  },
  {
    displayName: 'SubWallet',
    injectedName: 'subwallet-js',
    downloadUrl: {
      browser: {
        chrome: 'https://chrome.google.com/webstore/detail/subwallet-polkadot-wallet/onhogfjeacnfoofkfgppdlbmlmnplgbn',
      },
      app: {
        apple: 'https://apps.apple.com/us/app/subwallet-polkadot-wallet/id1633050285',
        android: 'https://play.google.com/store/apps/details?id=app.subwallet.mobile',
      },
    },
  },
  {
    displayName: 'MetaMask',
    injectedName: 'metamask',
    downloadUrl: {
      browser: {
        chrome: 'https://chrome.google.com/webstore/detail/subwallet-polkadot-wallet/onhogfjeacnfoofkfgppdlbmlmnplgbn',
      },
      app: {
        apple: 'https://apps.apple.com/us/app/metamask-blockchain-wallet/id1438144202',
        android: 'https://play.google.com/store/apps/details?id=io.metamask',
      },
    },
  },
];
