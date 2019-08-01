import { KinClient, Environment} from "../../scripts/src";
import SimpleKeystoreProvider from "../../scripts/src/keystoreProviders/SimpleKeystoreProvider";

let senderClient: KinClient;
let receiverClient: KinClient;
let senderKeystoreProvider: SimpleKeystoreProvider;
let receiverKeystoreProvider: SimpleKeystoreProvider;

describe("KinAccount", async () => {
	test("blah blah", async done => {
		senderKeystoreProvider = new SimpleKeystoreProvider();
		receiverKeystoreProvider = new SimpleKeystoreProvider();

		senderClient = new KinClient(Environment.Testnet, senderKeystoreProvider);
		receiverClient = new KinClient(Environment.Testnet, receiverKeystoreProvider);

		const transactionId = await senderClient.friendbot({ address: await senderKeystoreProvider.publicAddress, amount: 10000 });
		const secondTransactionId = await receiverClient.friendbot({address: await receiverKeystoreProvider.publicAddress, amount: 10000});

		expect(transactionId).toBeDefined();
		expect(secondTransactionId).toBeDefined();

		const txBuilder = await senderClient.kinAccount.buildSendKin({
			address: await receiverKeystoreProvider.publicAddress,
			amount: 1,
			fee: 100,
			memoText: "Send some kin"
		});

		await senderClient.kinAccount.submitTransaction(txBuilder);
		const senderBalance = await senderClient.getAccountBalance();
		const receiverBalance = await receiverClient.getAccountBalance();

		expect(senderBalance).toBe(9998.999);
		expect(receiverBalance).toBe(10001);

		done();
	}, 60000);
});
