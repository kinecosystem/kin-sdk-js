class SimpleKeystoreProvider{
	constructor(KinSdk, _seed) {
		this._sdk = KinSdk;
		this._keypairs = new Array();
		this._keypairs[0] = _seed !== undefined ? this._sdk.KeyPair.fromSeed(_seed) : this._sdk.KeyPair.generate();
	}

	addKeyPair() {
		this._keypairs[this._keypairs.length] = this._sdk.KeyPair.generate();
	}

	get accounts() {
		return Promise.resolve(this._keypairs.map(keypay => keypay.publicAddress));
	}

	signTransaction(accountAddress,transactionEnvelpoe){
		const keypair = this.getKeyPairFor(accountAddress);
		if (keypair != null) {
			const tx = new this._sdk.XdrTransaction(transactionEnvelpoe);
			const signers = new Array();
			signers.push(this._sdk.BaseKeyPair.fromSecret(keypair.seed));
			tx.sign(...signers);
			return Promise.resolve(tx.toEnvelope().toXDR("base64").toString());
		} else return Promise.reject('keypair null');
	}

	getKeyPairFor(publicAddress){
		return (this._keypairs.find(keypair => keypair.publicAddress === publicAddress) || null);
	}
}

(function(window){
	window.KeystoreProvider = SimpleKeystoreProvider;
}(window));