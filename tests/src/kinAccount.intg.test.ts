import {KinAccount} from "../../scripts/src/kinAccount";
import {KeyPair, KinClient, KeystoreProvider} from "../../scripts/src";
import * as KinSdk from "../../scripts/src";
import {Keypair, Memo, Network, Operation, Transaction as XdrTransaction} from "@kinecosystem/kin-base";
import {Server} from "@kinecosystem/kin-sdk";
import {INTEG_ENV} from "./integConfig";
import { SimpleKeystoreProvider } from "./simple-provider";

let client: KinClient;
let sender: KinAccount;
let receiver: KinAccount;
let keystore: SimpleKeystoreProvider;

describe("KinAccount", async () => {
	beforeAll(async () => {
		keystore = new SimpleKeystoreProvider(KinSdk);
		client = new KinClient(INTEG_ENV, keystore);
		keystore.addKeyPair();
		sender = (await client.kinAccounts)[0];
		receiver = (await client.kinAccounts)[1];
		const transactionId = await client.friendbot({ address: sender.publicAddress, amount: 10000 });
		const secondTransactionId = await client.friendbot({address: receiver.publicAddress, amount: 10000});
		expect(transactionId).toBeDefined();
		expect(secondTransactionId).toBeDefined();

	}, 60000);

	test("Test create sender", async () => {
		keystore.addKeyPair();
		const localKeypair = (await client.kinAccounts)[2];
		const txBuilder = await sender.buildCreateAccount({
			fee: 100,
			startingBalance: 1500,
			memoText: "Test create sender",
			address: localKeypair.publicAddress
		});

		await sender.submitTransaction(txBuilder.toString());
		const isExist = await localKeypair.isAccountExisting();
		const balance = await localKeypair.getBalance();
		expect(isExist).toBe(true);
		expect(balance).toBe(1500);
	}, 30000);

	test("Test send kin", async () => {
		const txBuilder = await sender.buildTransaction({
			fee: 100,
			amount: 150,
			memoText: "Test create sender",
			address: receiver.publicAddress

		});

		const balance = await sender.getBalance();
		const secondBalance = await receiver.getBalance();
		await sender.submitTransaction(txBuilder.toString());
		const balance2 = await sender.getBalance();
		const secondBalance2 = await receiver.getBalance();
		expect(balance2).toBe(balance - 150 - 0.001);
		expect(secondBalance2).toBe(secondBalance + 150);

	}, 60000);

	test("Test get data and balances", async () => {
		const txBuilder = await sender.buildTransaction({
			fee: 100,
			amount: 150,
			memoText: "Test get data",
			address: receiver.publicAddress

		});
		await sender.submitTransaction(txBuilder.toString());
		const data = await receiver.getData();
		const balance = await receiver.getBalance();
		expect(data.accountId).toBe(receiver.publicAddress);
		expect(data.balances[0].balance).toBe(balance);

	}, 60000);

	test("Test \"manage data\" operation", async () => {
		const opVal = "new data";
		const builder = await sender.getTransactionBuilder({
			fee: 100
		});
		builder.setTimeout(0);
		builder.addMemo(Memo.text("Test memo"));
		builder.addOperation(Operation.manageData({
			name: "test", source: "", value: opVal
		}));
		await sender.submitTransaction(builder.toString());
		const data = await sender.getData();

		const buff = Buffer.from(opVal);
		const base64data = buff.toString("base64");

		expect((data as any).data.test).toBe(base64data);

	}, 60000);
});
