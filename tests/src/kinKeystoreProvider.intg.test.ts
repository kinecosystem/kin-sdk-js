import {KeyPair, KinClient, Environment} from "../../scripts/src";
import {INTEG_ENV} from "./integConfig";
import SimpleKeystoreProvider from "../../scripts/src/keystoreProviders/SimpleKeystoreProvider";

const keyPair = KeyPair.generate();
const secondKeypair = KeyPair.generate();

let senderClient: KinClient
let receiverClient: KinClient
let senderKeystoreProvider: SimpleKeystoreProvider
let receiverKeystoreProvider: SimpleKeystoreProvider

describe("KinAccount", async () => {
	test("blah blah", async done => {
		senderKeystoreProvider = new SimpleKeystoreProvider(keyPair.seed);
		receiverKeystoreProvider = new SimpleKeystoreProvider(secondKeypair.seed);
		
		senderClient = new KinClient(Environment.Testnet, senderKeystoreProvider);
		receiverClient = new KinClient(Environment.Testnet, receiverKeystoreProvider);
		
		const transactionId = await senderClient.friendbot({ address: senderKeystoreProvider.publicAddress, amount: 10000 });
		const secondTransactionId = await receiverClient.friendbot({address: receiverKeystoreProvider.publicAddress, amount: 10000});
		expect(transactionId).toBeDefined();
		expect(secondTransactionId).toBeDefined();

		const txBuilder = await senderClient.kinAccount.buildSendKin({
			address: receiverKeystoreProvider.publicAddress,
			amount: 1,
			fee: 100,
			memoText: "Send with channels"
		});
		// await senderClient.kinAccount.submitTransaction(txBuilder);
		// const senderBalance = await senderClient.getAccountBalance();
		// const receiverBalance = await receiverClient.getAccountBalance();

		// console.log(senderBalance)
		// console.log(receiverBalance)

		// expect(senderBalance).toBe(9 - 0.001);
		// expect(receiverBalance).toBe(11);
		done();
	}, 60000);
});
