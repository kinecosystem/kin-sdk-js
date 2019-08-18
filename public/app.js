"use strict";
(async function(KinSdk, KeystoreProvider) {
	let keyStoreProvider = new KeystoreProvider(KinSdk);
	keyStoreProvider.addKeyPair();

	let kinClient = new KinSdk.KinClient(
		KinSdk.Environment.Testnet,
		keyStoreProvider
	);

	const accounts = await kinClient.kinAccounts;

	const transactionId = await kinClient.friendbot({
		address: accounts[0].publicAddress,
		amount: 10000,
	});
	const secondTransactionId = await kinClient.friendbot({
		address: accounts[1].publicAddress,
		amount: 10000,
	});

	const transaction = await accounts[0].buildTransaction({
		address: accounts[1].publicAddress,
		amount: 1,
		fee: 100,
		memoText: "Send some kin",
	});

	await accounts[0].submitTransaction(transaction);

	const senderBalance = await accounts[0].getBalance();
	const receiverBalance = await accounts[1].getBalance();

	console.log(senderBalance);
	console.log(receiverBalance);

	console.log(KinSdk);
	console.log(KeystoreProvider);
	
})(window.KinSdk, window.BrowserStorageKeystoreProvider);
