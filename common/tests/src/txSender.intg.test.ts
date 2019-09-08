 
import {SimpleKeystoreProvider, PaymentTransactionParams, Environment, Network,
	TransactionInterceptor, TransactionProcess, TransactionId, TxSender, Address, AccountDataRetriever, Friendbot} from "../../scripts/src/index"
import {GLOBAL_HEADERS, GLOBAL_RETRY} from "../../scripts/src/config"
import { Account, Server } from "@kinecosystem/kin-sdk";

const keystoreProvider = new SimpleKeystoreProvider();
keystoreProvider.addKeyPair();
let txSender: TxSender;
let publicAddresses: Address []
let accountDataRetriever: AccountDataRetriever
let friendbot: Friendbot
let senderAddress: Address
let receiverAddress: Address

describe("Create TxSender ", async () => {
	beforeAll(async () => {
		publicAddresses = await keystoreProvider.accounts
		expect(publicAddresses.length).toBe(2)
		for (let address of publicAddresses){
			expect(address.length).toBeGreaterThan(0)
		}
		senderAddress = publicAddresses[0]
		receiverAddress = publicAddresses[1]
		Network.useTestNetwork()
		let server = new Server(Environment.Testnet.url, 
			{ allowHttp: false, headers: GLOBAL_HEADERS,  retry: GLOBAL_RETRY });
		txSender = new TxSender(senderAddress, keystoreProvider, "test", server , Environment.Testnet);

		accountDataRetriever = new AccountDataRetriever(server);
		let friendbotUrl = Environment.Testnet.friendbotUrl ?  Environment.Testnet.friendbotUrl : "https://friendbot-testnet.kininfrastructure.com";
		friendbot = new Friendbot(friendbotUrl, accountDataRetriever);
	}, 30000);
	test("Create accounts with friend bot and check balance", async() => {
		for (let address of publicAddresses){
			let txId = await friendbot.createOrFund(address, 10000);
			expect(txId).toBeDefined()
			let balance = await accountDataRetriever.fetchKinBalance(address);
			expect(balance).toBe(10000)
		}
	}, 30000);

	test("Test sendPaymentTransaction without interceptor", async () => {

		await txSender.sendPaymentTransaction(<PaymentTransactionParams> {
				fee: 100,
				memoText:"sending kin",
				address:receiverAddress,
				amount: 10
			})
		const senderBalance = await accountDataRetriever.fetchKinBalance(senderAddress);
		expect(senderBalance).toBe(9989.999);
		const receiverBalance = await accountDataRetriever.fetchKinBalance(receiverAddress);
		expect(receiverBalance).toBe(10010);
	}, 30000);


	test("Test sendPaymentTransaction with interceptor, send envelope", async () => {
		let TransactionInterceptorImpl = class implements TransactionInterceptor {
			constructor() {
			}
			interceptTransactionSending(process: TransactionProcess): Promise<TransactionId> {
				let promise: Promise<TransactionId> = new Promise(async resolve => {
					resolve(await process.sendTransactionEnvelope(process.transaction().envelope))
				})
				return promise
			}
		}
		await txSender.sendPaymentTransaction(<PaymentTransactionParams> {
			fee: 100,
			memoText:"sending kin",
			address:receiverAddress,
			amount: 10
		}, new TransactionInterceptorImpl())
		const senderBalance = await accountDataRetriever.fetchKinBalance(senderAddress);
		expect(senderBalance).toBe(9979.998);
		const receiverBalance = await accountDataRetriever.fetchKinBalance(receiverAddress);
		expect(receiverBalance).toBe(10020);
	}, 30000);


	test("Test sendPaymentTransaction with interceptor, send transaction", async () => {
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
		await txSender.sendPaymentTransaction(<PaymentTransactionParams> {
			fee: 100,
			memoText:"sending kin",
			address:receiverAddress,
			amount: 10
		}, new TransactionInterceptorImpl())
		const senderBalance = await accountDataRetriever.fetchKinBalance(senderAddress);
		expect(senderBalance).toBe(9969.997);
		const receiverBalance = await accountDataRetriever.fetchKinBalance(receiverAddress);
		expect(receiverBalance).toBe(10030);
	}, 30000);
});
