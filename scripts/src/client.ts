import { KeyPair, KinClient, KinAccount, Environment } from './index'

const keypair = KeyPair.generate();
const seconedKeypair = KeyPair.generate();

let client: KinClient;
let sender: KinAccount;
let receiver: KinAccount;

(async function () {
    client = new KinClient(Environment.Testnet);
    sender = client.createKinAccount({ seed: keypair.seed });
    receiver = client.createKinAccount({ seed: seconedKeypair.seed });
    const transactionId = await client.friendbot({ address: keypair.publicAddress, amount: 10000 });
    const secondtransactionId = await client.friendbot({ address: seconedKeypair.publicAddress, amount: 10000 });

    console.log(transactionId);
    console.log(secondtransactionId);
})();


