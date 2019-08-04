import { KeystoreProvider, KeyPair } from "../../../../kin-sdk-js-common/";
import { Keypair, Transaction } from "@kinecosystem/kin-base";

export default class SimpleKeystoreProvider implements KeystoreProvider {
	private readonly _keypair: KeyPair;

	constructor(private readonly _seed?: string) {
		this._keypair =
			_seed !== undefined ? KeyPair.fromSeed(_seed) : KeyPair.generate();
	}

	public get publicAddress(): Promise<string> {
		return new Promise(resolve => {
			resolve(this._keypair.publicAddress);
		});
	}

	public signTransaction(xdrTransaction: Transaction): Promise<Transaction> {
		return new Promise(resolve => {
			xdrTransaction.sign(Keypair.fromSecret(this._keypair.seed));
			resolve(xdrTransaction);
		});
	}
}
