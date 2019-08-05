(async function() {
	let kinClient;
	let keyStoreProvider;
	const KinSdk = window.KinSdk;

	keyStoreProvider = new KinSdk.KeystoreProviders.SimpleKeystoreProvider();
	keyStoreProvider.addKeyPair();

	kinClient = new KinSdk.KinClient(
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
	// const transactionString = toWhitelistableTransaction.toWhitelistableTransaction();
	// console.log(transactionString);

	// await accounts[0].sendWhitelistableTransaction(transactionString);
	await accounts[0].submitTransaction(transaction);

	const senderBalance = await accounts[0].getBalance();
	const receiverBalance = await accounts[1].getBalance();

	console.log(senderBalance);
	console.log(receiverBalance);
})();
