import { KinClient, Environment} from "../../scripts/src";
import SimpleKeystoreProvider from "../../scripts/src/keystoreProviders/SimpleKeystoreProvider";

let kinClient: KinClient;
let keyStoreProvider: SimpleKeystoreProvider;

describe("KinAccount", async () => {
	test("blah blah", async done => {
		keyStoreProvider = new SimpleKeystoreProvider();
		keyStoreProvider.addKeyPair()

		kinClient = new KinClient(Environment.Testnet, keyStoreProvider);
		const kinAccounts = await kinClient.kinAccounts
		const transactionId = await kinClient.friendbot({ address: kinAccounts[0].publicAddress, amount: 10000 });
		const secondTransactionId = await kinClient.friendbot({address: kinAccounts[1].publicAddress, amount: 10000});

		expect(transactionId).toBeDefined();
		expect(secondTransactionId).toBeDefined();

		const txBuilder = await kinAccounts[0].buildSendKin({
			address: kinAccounts[1].publicAddress,
			amount: 1,
			fee: 100,
			memoText: "Send some kin"
		});

		await kinAccounts[0].submitTransaction(txBuilder);
		const senderBalance = await kinAccounts[0].getBalance();
		const receiverBalance = await kinAccounts[1].getBalance();

		expect(senderBalance).toBe(9998.999);
		expect(receiverBalance).toBe(10001);

		done();
	}, 60000);
});
