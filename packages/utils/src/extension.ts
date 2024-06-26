import type { InjectedAccount, InjectedExtension, InjectedWindowProvider } from '@polkadot/extension-inject/types';
import { isFunction, u8aToHex, u8aWrapBytes } from '@polkadot/util';
import { HexString } from '@polkadot/util/types';
export interface InjectedWeb3 {
  [key: string]: InjectedWindowProvider;
}

export enum ExtensionErrorEnum {
  UNKNOWN,
  NO_EXTENSION,
  PENDING_AUTH,
  UNAUTHORIZED,
  NO_ACCOUNTS_AUTHORIZED,
}
export class ConnectionError extends Error {
  public readonly reason: ExtensionErrorEnum;

  constructor(message: string, reason: ExtensionErrorEnum, options?: ErrorOptions) {
    super(message, options);
    this.reason = reason;
  }
}

export class ExtensionConnector {
  private readonly injectedWeb3: InjectedWeb3;
  public readonly appName: string;
  private extension?: InjectedExtension;

  constructor(injectedWeb3: InjectedWeb3 | undefined, appName: string) {
    if (!injectedWeb3) {
      throw new Error('No web3 extensions detected on window');
    }
    this.injectedWeb3 = injectedWeb3;
    this.appName = appName;
  }

  public get injectedExtension() {
    return this.extension;
  }

  public async connect(injectedName: string): Promise<InjectedExtension> {
    const wallet = this.injectedWeb3[injectedName];

    if (!wallet) {
      throw new ConnectionError(`Wallet extension ${injectedName} not found`, ExtensionErrorEnum.NO_EXTENSION);
    }

    try {
      if (wallet.connect) {
        this.extension = await wallet.connect(this.appName);
        console.debug(`Connected extension ${injectedName}`);
        return this.extension;
      }

      if (wallet.enable) {
        const res = await wallet.enable(this.appName);
        // Special case for Talisman, which returns a connected object even when you explicitly reject.
        // But if we try to get accounts on such an object, it will throw an error
        if (injectedName === 'talisman') {
          await res.accounts.get();
        }
        this.extension = {
          ...res,
          name: injectedName,
          version: wallet.version || '',
        };
        console.debug(`Enabled extension ${injectedName}`);

        return this.extension;
      }
    } catch (err) {
      if (err instanceof Error) {
        const msg = err.message;
        if (/pending/.test(msg) || /not been auth/.test(msg)) {
          throw new ConnectionError(msg, ExtensionErrorEnum.PENDING_AUTH, { cause: err });
        } else if (/not_auth/.test(msg) || /not allowed/.test(msg)) {
          throw new ConnectionError(msg, ExtensionErrorEnum.UNAUTHORIZED, { cause: err });
        } else if (/No.*wallet accounts/.test(msg)) {
          throw new ConnectionError(msg, ExtensionErrorEnum.NO_ACCOUNTS_AUTHORIZED, { cause: err });
        } else {
          throw new ConnectionError(msg, ExtensionErrorEnum.UNKNOWN, { cause: err });
        }
      }
    }

    throw new Error('No connect(..) or enable(...) hook found');
  }

  public async getAccounts(): Promise<Array<InjectedAccount>> {
    if (!this.extension) {
      throw new Error(`Wallet extension connection not found`);
    }

    try {
      return (await this.extension.accounts.get()).filter((account: InjectedAccount) => account?.type !== 'ethereum');
    } catch (error) {
      console.error(error);
      throw new Error('Failed to request accounts', { cause: error });
    }
  }

  public async signMessageWithWrappedBytes(payload: Uint8Array, address: string): Promise<HexString> {
    const signRaw = this.extension?.signer?.signRaw;

    if (signRaw && isFunction(signRaw)) {
      try {
        const { signature } = await signRaw({
          address,
          data: u8aToHex(u8aWrapBytes(payload)),
          type: 'bytes',
        });

        return signature;
      } catch (e) {
        console.error(e);
      }
    }

    throw new Error(`Unable to access signer interface of extension`);
  }

  public async signMessage(message: string, address: string): Promise<HexString> {
    const signRaw = this.extension?.signer?.signRaw;

    if (!!signRaw) {
      // after making sure that signRaw is defined
      // we can use it to sign our message
      const { signature } = await signRaw({
        address,
        data: message,
        type: 'bytes',
      });

      return signature;
    }

    throw new Error(`Unable to access signer interface of extension`);
  }
}
