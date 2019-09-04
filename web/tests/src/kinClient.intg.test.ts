import {KinClient} from "../../scripts/src/kinClient";
import {SimpleKeystoreProvider, PaymentTransactionParams, Environment} from "@kinecosystem/kin-sdk-js-common"

const keystoreProvider = new SimpleKeystoreProvider();
let client: KinClient;

describe("KinClient", async () => {
	beforeAll(async () => {
		keystoreProvider.addKeyPair();
		keystoreProvider.addKeyPair();
		keystoreProvider.addKeyPair();
		client = new KinClient(Environment.Testnet, keystoreProvider);
		const accounts = await client.kinAccounts;
		const transactionId = await client.friendbot({ address: accounts[0].publicAddress, amount: 10000 });
		const secondtransactionId = await client.friendbot({ address: accounts[1].publicAddress, amount: 10000 });
		const thirdone = await client.friendbot({ address: accounts[3].publicAddress, amount: 10000 });
		expect(transactionId).toBeDefined();
		expect(secondtransactionId).toBeDefined();
		expect(thirdone).toBeDefined();
	}, 30000);

	test("Create sender with friend bot", async () => {
		const accounts = await client.kinAccounts;
		const transactionId = await client.friendbot({ address: accounts[2].publicAddress, amount: 10000 });
		expect(transactionId).toBeDefined();
		const accountExists = await accounts[2].isAccountExisting()
		expect(accountExists).toBe(true);
		const balance = await accounts[2].getBalance()
		expect(balance).toBe(10000);
	}, 30000);

	test("Test getData", async () => {
		const accounts = await client.kinAccounts;
		expect(await accounts[0].isAccountExisting()).toBe(true);
		const data = await accounts[0].getData();
		expect(data.balances[0].balance).toBe(10000);
		expect(data.balances.length).toBe(1);
		expect(data.balances[0].assetType).toBe("native");
		expect(data.signers.length).toBe(1);
		expect(data.signers[0].publicKey).toBe(accounts[0].publicAddress);
		expect(data.id).toBe(accounts[0].publicAddress);
	}, 30000);

	test("Test getMinimumFee", async () => {
		expect(await client.getMinimumFee()).toBe(100);
	}, 60000);

	test("Test sendPaymentTransaction without interceptor", async () => {
		const accounts = await client.kinAccounts;

		for (let i = 0; i < 2; i++) {
			var sendBuilder = await accounts[0].sendPaymentTransaction(<PaymentTransactionParams> {
				fee: 100,
				memoText:"sending kin: "+i,
				address:accounts[3].publicAddress,
				amount: 10
			})
		}
		const balance = await accounts[3].getBalance();
		expect(balance).toBe(10020);
	}, 60000);

});
