import {KinClient} from "../../scripts/src/kinClient";
import {KinAccount} from "../../scripts/src/kinAccount"
import {SimpleKeystoreProvider, PaymentTransactionParams, Environment, EventListener, PaymentTransaction,
	TransactionInterceptor, TransactionProcess, XdrTransaction, TransactionId, Transaction} from "@kinecosystem/kin-sdk-js-common"
import { Account } from "@kinecosystem/kin-sdk";

const keystoreProvider = new SimpleKeystoreProvider(4);
let client: KinClient;
let accounts: KinAccount[];

describe("KinClient get KinAccounts ", async () => {
	beforeAll(async () => {
		client = new KinClient(Environment.Testnet, keystoreProvider);
		accounts = await client.getAccounts();
		expect(accounts.length).toBe(4)
		for (let account of accounts){
			expect(account.publicAddress).toBeDefined
			expect(await account.isAccountExisting()).toBe(false)
		}
	}, 30000);
	test("Create accounts with friend bot and check balance", async() => {
		for (let account of accounts){
			let txId = await client.friendbot({ address: account.publicAddress, amount: 10000 });
			expect(txId).toBeDefined()
			expect(await account.isAccountExisting()).toBe(true)
			let balance = await account.getBalance()
			expect(balance).toBe(10000)
		}
	}, 30000);

	test("Test getData", async () => {
		for (let account of accounts){
			expect(await account.isAccountExisting()).toBe(true);
			const data = await account.getData();
			expect(data.balances[0].balance).toBe(10000);
			expect(data.balances.length).toBe(1);
			expect(data.balances[0].assetType).toBe("native");
			expect(data.signers.length).toBe(1);
			expect(data.signers[0].publicKey).toBe(account.publicAddress);
			expect(data.id).toBe(account.publicAddress);
		}
	}, 30000);

	test("Test getMinimumFee", async () => {
		expect(await client.getMinimumFee()).toBe(100);
	}, 60000);

	test("Test sendPaymentTransaction without interceptor", async () => {
		for (let i = 0; i <= 2; i++) {
			var sendBuilder = await accounts[i].sendPaymentTransaction(<PaymentTransactionParams> {
				fee: 100,
				memoText:"sending kin: "+i,
				address:accounts[3].publicAddress,
				amount: 10
			})
			const payerBalance = await accounts[i].getBalance()
			expect(payerBalance).toBe(9989.999)
		}
		const balance = await accounts[3].getBalance();
		expect(balance).toBe(10030);
	}, 60000);


	test("Test sendPaymentTransaction with interceptor, send envelope", async () => {
		const accounts = await client.getAccounts();

		let TransactionInterceptorImpl = class implements TransactionInterceptor {
			constructor() {
			}
			interceptTransactionSending(process: TransactionProcess): Promise<TransactionId> {
				let promise: Promise<TransactionId> = new Promise(async resolve => {
					resolve(await process.sendWhitelistTransaction(process.transaction().envelope))
				})
				return promise
			}
		}
		
		for (let i = 0; i <= 2; i++) {
			var sendBuilder = await accounts[i].sendPaymentTransaction(<PaymentTransactionParams> {
				fee: 100,
				memoText:"sending kin: "+i,
				address:accounts[3].publicAddress,
				amount: 10
			})
			const payerBalance = await accounts[i].getBalance()
			expect(payerBalance).toBe(9979.998)
		}
		const balance = await accounts[3].getBalance();
		expect(balance).toBe(10060);
	}, 60000);


	test("Test sendPaymentTransaction with interceptor, send transaction", async () => {
		const accounts = await client.getAccounts();

		let TransactionInterceptorImpl = class implements TransactionInterceptor {
			constructor() {
			}
			interceptTransactionSending(process: TransactionProcess): Promise<TransactionId> {
				let promise: Promise<TransactionId> = new Promise(async resolve => {
					resolve(await process.sendTransaction(process.transaction()))
				})
				return promise
			}
		}
		let eventRegistration = accounts[3].addPaymentListener(<EventListener<PaymentTransaction>>{
			onDataUpdated(tx: PaymentTransaction): void {
				console.log("Received payment of: "+tx.amount+"Kin from "+tx.source+", destination: "+tx.destination);
			}
		})

		for (let i = 0; i <= 2; i++) {
			var sendBuilder = await accounts[i].sendPaymentTransaction(<PaymentTransactionParams> {
				fee: 100,
				memoText:"sending kin: "+i,
				address:accounts[3].publicAddress,
				amount: 10
			})
			const payerBalance = await accounts[i].getBalance()
			expect(payerBalance).toBe(9969.997)
		}
		const balance = await accounts[3].getBalance();
		expect(balance).toBe(10090);
		eventRegistration.remove()

		console.log("Event registration removed")
		var sendBuilder = await accounts[0].sendPaymentTransaction(<PaymentTransactionParams> {
			fee: 100,
			memoText:"send5more",
			address:accounts[3].publicAddress,
			amount: 5
		})
		const payerBalance = await accounts[0].getBalance()
		expect(payerBalance).toBe(9964.996)

	}, 60000);
});
