import * as BaseSdk from "@kinecosystem/kin-sdk";
import KeystoreProvider from "../keystoreProviders/keystoreProviderInterface";
import { Address } from "../types";
import { KeyPair } from "..";
import { Keypair } from "@kinecosystem/kin-sdk";

export default class SimpleKeystoreProvider implements KeystoreProvider {
  private readonly _keypair: KeyPair;

  constructor(private readonly _seed: string) {
    this._keypair = KeyPair.fromSeed(_seed);
  }

  public get publicAddress(): Address {
    return this._keypair.publicAddress;
  }

  public signTransaction(transactionEnvelope: string): string {
    const tx = new BaseSdk.Transaction(transactionEnvelope);
    const signers = new Array<Keypair>();
    signers.push(Keypair.fromSecret(this._keypair.seed));
    tx.sign(...signers);
    return tx.toEnvelope().toXDR().toString();
  }
}
