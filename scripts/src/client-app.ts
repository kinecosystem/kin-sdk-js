import SimpleKeystoreProvider from "./keystoreProviders/SimpleKeystoreProvider";

declare global {
	interface Window {
		KinSdk: any;
	}
}

(async function() {
	let kinClient;
	let keyStoreProvider;

	keyStoreProvider = new SimpleKeystoreProvider();
	keyStoreProvider.addKeyPair()

	kinClient = new window.KinSdk.KinClient(
		window.KinSdk.Environment.Testnet,
		keyStoreProvider
	);
	
	const accounts = await kinClient.kinAccounts 

	const transactionId = await kinClient.friendbot({
		address: accounts[0].publicAddress,
		amount: 10000,
	});
	const secondTransactionId = await kinClient.friendbot({
		address:  accounts[1].publicAddress,
		amount: 10000,
	});

	const txBuilder = await accounts[0].buildSendKin({
		address: accounts[1].publicAddress,
		amount: 1,
		fee: 100,
		memoText: "Send some kin",
	});

	await accounts[0].submitTransaction(txBuilder);
	const senderBalance = accounts[0].getBalance();
	const receiverBalance = accounts[1].getBalance();

	console.log(senderBalance);
	console.log(receiverBalance);
})();
