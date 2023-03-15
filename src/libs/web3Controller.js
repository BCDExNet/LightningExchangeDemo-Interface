import Web3 from "web3";

export const web3Controller = {
	_web3: null,
	_contracts: {},

	account: "",
	chainId: 0,

	connect: async function () {
		if (window.ethereum) {
			this._web3 = new Web3(window.ethereum);

			const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
			this.account = accounts[0];

			this.chainId = this._web3.currentProvider.chainId;
		}
	},

	callContract: async function (address, abi, method, ...args) {
		return await this._makeContract(address, abi).methods[method](...args).call();
	},

	sendContract: function (address, abi, method, doneCallback, cancelCallback, ...args) {
		this._makeContract(address, abi).methods[method](...args)
			.send({
				from: this.account,
				gas: 8000000
			})
			.on('transactionHash', function (hash) {
				if (doneCallback) doneCallback();
			}).on('confirmation', function (confirmationNumber, receipt) {
				// 
			}).on('receipt', function (receipt) {
				// 
			}).on('error', function (error, receipt) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
				if (cancelCallback) cancelCallback();
			});
	},

	_makeContract: function (address, abi = null) {
		if (!this._contracts[address]) {
			this._contracts[address] = new this._web3.eth.Contract(abi, address);
		}

		return this._contracts[address];
	}
};