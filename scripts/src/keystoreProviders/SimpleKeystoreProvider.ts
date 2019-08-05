import KeystoreProvider from "../blockchain/keystoreProvider";
import { KeyPair, Address } from "..";
import { Keypair, Transaction } from "@kinecosystem/kin-sdk";

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

	public get accounts(): Promise<Address[]> {
		return Promise.resolve(this._keypairs.map(keypay => keypay.publicAddress));
	}

	public signTransaction(
		accountAddress: Address,
		xdrTransaction: Transaction
	): Promise<Transaction> {
		const keypair = this.getKeyPairFor(accountAddress);
		if (keypair != null) {
			const signers = new Array<Keypair>();
			signers.push(Keypair.fromSecret(keypair.seed));
			xdrTransaction.sign(...signers);
		}
		return  Promise.resolve(xdrTransaction);
	}

	private getKeyPairFor(publicAddress: string): KeyPair | null {
		return (
			this._keypairs.find(
				keypair => keypair.publicAddress === publicAddress
			) || null
		);
	}
}
