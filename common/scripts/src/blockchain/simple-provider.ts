
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
            console.log("accountAddresses "+accountAddresses+", length="+accountAddresses.length)
            accountAddresses.forEach((address, index) => {
                console.log("* getting keypair for address:"+address)
                var keypair:KeyPair|null = this.getKeyPairFor(address)
                console.log("** keypair returned:"+keypair)
                if (keypair != null){
                    console.log("*** keypair found with public address:"+keypair.publicAddress);
                    signers.push(BaseKeyPair.fromSecret(keypair.seed));
                }
            })
            if (signers.length!=0) {
                console.log("signing with signers:"+signers);
                tx.sign(...signers);
                return Promise.resolve(
                    tx
                        .toEnvelope()
                        .toXDR("base64")
                        .toString()
                );
            }
            else {
                console.log("promise reject 1 ! ")
                return Promise.reject("keypair null");
            }
        } else {
            console.log("promise reject 2 ! ")
            return Promise.reject("keypair null");
        }
    }

    public getKeyPairFor(publicAddress: string) {
        return this._keypairs.find(keypair => keypair.publicAddress === publicAddress) || null;
    }
}