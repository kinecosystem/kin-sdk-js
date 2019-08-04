import KeystoreProvider from "../keystoreProviders/keystoreProviderInterface";
import { Address } from "../types";
import { KeyPair } from "..";
import { Keypair, Transaction } from "@kinecosystem/kin-sdk";
import { stringify } from "querystring";

export default class SimpleKeystoreProvider implements KeystoreProvider {
  private readonly _keypairs: Array<KeyPair>

	constructor(private readonly _seed?: string) {
    this._keypairs = new Array();
    this._keypairs[0] = _seed !== undefined ? KeyPair.fromSeed(_seed) : KeyPair.generate();
  }
  
  public addKeyPair() {
    this._keypairs[this._keypairs.length] = KeyPair.generate()
  }

	public get accounts(): Promise<Array<Address>> {
		return new Promise(resolve => {
      const accountList = new Array(this._keypairs.length)
      for (let i=0; i<this._keypairs.length; i++) {
        accountList[i] = this._keypairs[i].publicAddress
      }
			resolve(accountList);
		});
  }
  
  private getKeyPairFor(publicAddress: Address): KeyPair | null {
      for (let i=0; i<this._keypairs.length; i++) {
        if (this._keypairs[i].publicAddress == publicAddress)
          return this._keypairs[i];
      }
      return null;
  }

	public signTransaction(accountAddress: Address, xdrTransaction: Transaction): Promise<Transaction> {
		return new Promise(resolve => {
      const keypair = this.getKeyPairFor(accountAddress)
      if (keypair != null){
        const signers = new Array<Keypair>();
        signers.push(Keypair.fromSecret(keypair.seed));
        xdrTransaction.sign(...signers);

        console.log("SimpleKeystoreProvider::signTransaction");
        console.log(xdrTransaction);
      }
      resolve(xdrTransaction);
		});
	}
}
