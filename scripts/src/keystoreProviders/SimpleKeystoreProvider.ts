import KeystoreProvider from "../keystoreProviders/keystoreProviderInterface";
import { Address } from "../types";
import { KeyPair } from "..";
import { Keypair, Transaction } from "@kinecosystem/kin-sdk";

export default class SimpleKeystoreProvider implements KeystoreProvider {
	private readonly _keypair: KeyPair;

	constructor(private readonly _seed?: string) {
		this._keypair =
			_seed !== undefined ? KeyPair.fromSeed(_seed) : KeyPair.generate();
	}

	public get publicAddress(): Promise<Address> {
		return new Promise(resolve => {
			resolve(this._keypair.publicAddress);
		});
	}

	public signTransaction(xdrTransaction: Transaction): Promise<Transaction> {
		return new Promise(resolve => {
			const signers = new Array<Keypair>();
			signers.push(Keypair.fromSecret(this._keypair.seed));
			xdrTransaction.sign(...signers);

			console.log("SimpleKeystoreProvider::signTransaction");
			console.log(xdrTransaction);
			resolve(xdrTransaction);
		});
	}
}
