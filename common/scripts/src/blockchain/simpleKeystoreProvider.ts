import { KeystoreProvider } from "./keystoreProvider"
import { KeyPair } from "./keyPair"
import { Keypair as BaseKeyPair , Transaction as XdrTransaction } from "@kinecosystem/kin-sdk";

export class SimpleKeystoreProvider implements KeystoreProvider {
    private _keypairs: KeyPair[];

    constructor(size?: number, seed?: string) {
        this._keypairs = [];
        this._keypairs[0] = seed? KeyPair.fromSeed(seed) : KeyPair.generate();   
        for (let i=1; i<(size?size:0); i++)
            this._keypairs[i] = KeyPair.generate();
    }

    get publicAddresses() {
        return Promise.resolve(this._keypairs.map(keypair => keypair.publicAddress));
    }

    public sign(transactionEnvelope: string, ...publicAddresses: string[]) {
        if (publicAddresses) {
            const tx = new XdrTransaction(transactionEnvelope);
            const signers: BaseKeyPair[] = [];
            publicAddresses.forEach((address, index) => {
                var keypair:KeyPair|null = this.getKeyPairFor(address)
                if (keypair){
                    signers.push(BaseKeyPair.fromSecret(keypair.seed));
                }
            })
            if (signers.length>0) {
                tx.sign(...signers);
                return Promise.resolve(
                    tx
                        .toEnvelope()
                        .toXDR("base64")
                        .toString()
                );
            }
            else {
                return Promise.reject("Unable to find any private keys for the list of public addresses provided");
            }
        } else {
            return Promise.reject("No public addresses provided");
        }
    }

    public getKeyPairFor(publicAddress: string) {
        return this._keypairs.find(keypair => keypair.publicAddress === publicAddress) || null;
    }
}