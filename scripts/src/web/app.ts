interface Window {
	KinSdk: any;
}

(async function() {
	let senderClient;
	let receiverClient;
	let senderKeystoreProvider;
	let receiverKeystoreProvider;

	senderKeystoreProvider = new window.KinSdk.SimpleKeystoreProvider();
	receiverKeystoreProvider = new window.KinSdk.SimpleKeystoreProvider();

	senderClient = new window.KinSdk.KinClient(
		window.KinSdk.Environment.Testnet,
		senderKeystoreProvider
	);
	receiverClient = new window.KinSdk.KinClient(
		window.KinSdk.Environment.Testnet,
		receiverKeystoreProvider
	);

	const transactionId = await senderClient.friendbot({
		address: await senderKeystoreProvider.publicAddress,
		amount: 10000,
	});
	const secondTransactionId = await receiverClient.friendbot({
		address: await receiverKeystoreProvider.publicAddress,
		amount: 10000,
	});

	const txBuilder = await senderClient.kinAccount.buildSendKin({
		address: await receiverKeystoreProvider.publicAddress,
		amount: 1,
		fee: 100,
		memoText: "Send some kin",
	});

	await senderClient.kinAccount.submitTransaction(txBuilder);
	const senderBalance = await senderClient.getAccountBalance();
	const receiverBalance = await receiverClient.getAccountBalance();

	console.log(senderBalance);
	console.log(receiverBalance);
})();
