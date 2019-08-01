/// <reference path ="./client.ts"/>

import SimpleKeystoreProvider from "./keystoreProviders/SimpleKeystoreProvider";
import { Keypair } from "@kinecosystem/kin-sdk";
import { KeyPair, KinClient, Environment } from ".";

const KinSdk = window.KinSdk;
let senderClient: KinClient;
let receiverClient: KinClient;
let senderKeystoreProvider: SimpleKeystoreProvider;
let receiverKeystoreProvider: SimpleKeystoreProvider;

(async function() {
	senderKeystoreProvider = new SimpleKeystoreProvider();
	receiverKeystoreProvider = new SimpleKeystoreProvider();

	senderClient = new KinClient(Environment.Testnet, senderKeystoreProvider);
	receiverClient = new KinClient(
		Environment.Testnet,
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
