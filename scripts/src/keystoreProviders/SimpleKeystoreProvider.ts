import KeystoreProvider from "../blockchain/keystoreProvider";
import { KeyPair } from "..";
import { Keypair, Transaction } from "@kinecosystem/kin-base";

export default class SimpleKeystoreProvider implements KeystoreProvider {
	private readonly _keypairs: KeyPair[];

	constructor(private readonly _seed?: string) {
		this._keypairs = new Array();
		this._keypairs[0] =
			_seed !== undefined ? KeyPair.fromSeed(_seed) : KeyPair.generate();
	}

	public addKeyPair() {
		this._keypairs[this._keypairs.length] = KeyPair.generate();
	}

	public get accounts(): Promise<string[]> {
		return new Promise(resolve => {
			const accountList = new Array(this._keypairs.length);
			for (let i = 0; i < this._keypairs.length; i++) {
				accountList[i] = this._keypairs[i].publicAddress;
			}
			resolve(accountList);
		});
	}

	public signTransaction(
		accountAddress: string,
		xdrTransaction: Transaction
	): Promise<Transaction> {
		return new Promise(resolve => {
			const keypair = this.getKeyPairFor(accountAddress);
			if (keypair != null) {
				const signers = new Array<Keypair>();
				signers.push(Keypair.fromSecret(keypair.seed));
				xdrTransaction.sign(...signers);

				console.log("SimpleKeystoreProvider::signTransaction");
				console.log(xdrTransaction);
			}
			resolve(xdrTransaction);
		});
	}

	private getKeyPairFor(publicAddress: string): KeyPair | null {
		return (
			this._keypairs.find(
				keypair => keypair.publicAddress === publicAddress
			) || null
		);
	}
}
