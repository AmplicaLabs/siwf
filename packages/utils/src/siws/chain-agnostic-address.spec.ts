import { ChainAgnosticId, POLKADOT_CHAIN_NAMESPACE, PolkadotChainId } from './chain-agnostic-id.js';
import { BlockHash } from '@polkadot/types/interfaces';
import { describe, expect, test } from 'vitest';
import { ChainAgnosticAddress, PolkadotAddress } from './chain-agnostic-address.js';

const genesisHash = '0x060ca79d9743b0ca58cabe294b9545a492e69de00c65154dba1f236b4a3ae5c0';
const address = '5Dc96kiTPTfZHmq6yTFSqejJzfUNfQQjneNesRWf9MDppJsd';
const polkadotId = new PolkadotChainId(genesisHash);

describe('chain-agnostic-address', () => {
  describe('class ChainAgnosticAddress', () => {
    const chainId = new ChainAgnosticId('eip155', genesisHash);
    let nsAndRefConstructed: ChainAgnosticAddress;
    let idConstructed: ChainAgnosticAddress;

    test('construction by namespace, reference and address', () => {
      expect(() => {
        nsAndRefConstructed = new ChainAgnosticAddress('eip155', genesisHash, address);
      }).not.toThrow();
      expect(nsAndRefConstructed.chainId).toStrictEqual(chainId);
      expect(nsAndRefConstructed.address).toStrictEqual(address);
    });

    test('construction by id and address', () => {
      expect(() => {
        idConstructed = new ChainAgnosticAddress(polkadotId, address);
      }).not.toThrow();
      expect(idConstructed.chainId).toStrictEqual(polkadotId);
      expect(idConstructed.address).toStrictEqual(address);
    });

    test('missing address should throw', () => {
      // @ts-expect-error: Ignore linting error below
      expect(() => new ChainAgnosticAddress(POLKADOT_CHAIN_NAMESPACE, genesisHash)).toThrowError('No address supplied');
    });

    test('toString formats string correctly', () => {
      expect(nsAndRefConstructed.toString()).toStrictEqual(`${chainId.toString()}:${address}`);
    });
  });

  describe('class PolkadotChainAddress', () => {
    let p: PolkadotAddress;

    test('construct with string', () => {
      p = new PolkadotAddress(genesisHash, address);
      expect(p.chainId).toStrictEqual(polkadotId);
      expect(p.address).toStrictEqual(address);
    });

    test('construct with BlockHash', () => {
      // Mock a BlockHash; all we require is that it have a toString() method
      const blockHashObj = {
        toString: () => genesisHash,
      } as BlockHash;

      const p2 = new PolkadotAddress(blockHashObj, address);
      expect(p2.chainId).toStrictEqual(polkadotId);
      expect(p2.address).toStrictEqual(address);
    });

    test('construct with generic id', () => {
      const id = new PolkadotChainId(genesisHash);
      const p2 = new PolkadotAddress(id, address);
      expect(p2).toStrictEqual(p);
    });
  });
});
