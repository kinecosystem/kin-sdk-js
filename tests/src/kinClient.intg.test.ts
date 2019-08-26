import * as KinSdk from "../../scripts/src/index";
import {TransactionBuilder} from "../../scripts/src/blockchain/transactionBuilder";
import {INTEG_ENV} from "./integConfig";
import { SimpleKeystoreProvider } from "./simple-provider";

const keystoreProvider = new SimpleKeystoreProvider(KinSdk);
let client: KinSdk.KinClient;

describe("KinClient", async () => {
	beforeAll(async () => {
		keystoreProvider.addKeyPair();
		keystoreProvider.addKeyPair();
		keystoreProvider.addKeyPair();
		client = new KinSdk.KinClient(INTEG_ENV, keystoreProvider);
		const accounts = await client.kinAccounts;
		const transactionId = await client.friendbot({ address: accounts[0].publicAddress, amount: 10000 });
		const secondtransactionId = await client.friendbot({ address: accounts[1].publicAddress, amount: 10000 });
		expect(transactionId).toBeDefined();
		expect(secondtransactionId).toBeDefined();
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

		const builder = await accounts[0].buildCreateAccount({
			address: accounts[3].publicAddress,
			fee: 100,
			startingBalance: 1000,
			memoText: "my first wallet"
		});

		await accounts[0].submitTransaction(builder.toString());
		const data2 = await accounts[0].getData();
		expect(data2.sequenceNumber).toBe(data.sequenceNumber + 1);
	}, 30000);

	test("Test getMinimumFee", async () => {
		expect(await client.getMinimumFee()).toBe(100);
	}, 60000);

	test("Test getBalance", async () => {
		const accounts = await client.kinAccounts;

		let sendBuilder: TransactionBuilder;
		for (let i = 0; i < 2; i++) {
			sendBuilder = await accounts[0].buildTransaction({
				address: accounts[3].publicAddress,
				amount: 10,
				fee: 100,
				memoText: "sending kin: " + i
			});
			await accounts[0].submitTransaction(sendBuilder.toString());
		}

		const balance = await accounts[3].getBalance();
		expect(balance).toBe(1020);
	}, 60000);
});
