// TODO rename file 
import {KeystoreProvider} from "./keystoreProvider"
import {KeyPair} from "./keyPair"
import { Keypair as BaseKeyPair , Transaction as XdrTransaction } from "@kinecosystem/kin-sdk";

export class SimpleKeystoreProvider implements KeystoreProvider {
    private _keypairs: KeyPair[];

    constructor(_seed?: string) {
        this._keypairs = [];
        this._keypairs[0] = _seed !== undefined ? KeyPair.fromSeed(_seed) : KeyPair.generate();
    }

    public addKeyPair() {
        this._keypairs[this._keypairs.length] = KeyPair.generate();
    }

    get accounts() {
        return Promise.resolve(this._keypairs.map(keypair => keypair.publicAddress));
    }

    public sign(transactionEnvelope: string, ...accountAddresses: string[]) {
        if (accountAddresses != null && accountAddresses.length>0) {
            const tx = new XdrTransaction(transactionEnvelope);
            const signers: BaseKeyPair[] = [];
            accountAddresses.forEach((address, index) => {
                var keypair:KeyPair|null = this.getKeyPairFor(address)
                if (keypair != null){
                    signers.push(BaseKeyPair.fromSecret(keypair.seed));
                }
            })
            if (signers.length!=0) {
                tx.sign(...signers);
                return Promise.resolve(
                    tx
                        .toEnvelope()
                        .toXDR("base64")
                        .toString()
                );
            }
            else {
                return Promise.reject("keypair null");
            }
        } else {
            return Promise.reject("keypair null");
        }
    }

    public getKeyPairFor(publicAddress: string) {
        return this._keypairs.find(keypair => keypair.publicAddress === publicAddress) || null;
    }
}