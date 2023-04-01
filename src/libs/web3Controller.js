import Web3 from "web3";
import { appConfig } from "../configs/appConfig";
import { globalUtils } from "../libs/globalUtils";

export const web3Controller = {
	_web3: null,
	_contracts: {},
	_updateWeb3Func: () => { },

	account: "",
	chainId: 0,

	connect: async function (updateWeb3Func) {
		this._updateWeb3Func = updateWeb3Func;

		if (window.ethereum) {
			window.ethereum.on("chainChanged", this._onChainChanged);
			window.ethereum.on("accountsChanged", this._onAccountsChanges);

			this._web3 = new Web3(window.ethereum);

			const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
			this.account = accounts[0];

			this.chainId = parseInt(this._web3.currentProvider.chainId, 16);

			return true;
		} else {
			return false;
		}
	},

	switchNetwork: async function (indexOfNetwork) {
		const theChainConfig = Object.values(appConfig.networks)[indexOfNetwork];
		const cid = "0x" + theChainConfig.chainId.toString(16);

		try {
			await this._web3.currentProvider.request({
				method: globalUtils.constants.WALLET_SWITCH_ETHEREUM_CHAIN,
				params: [{ chainId: cid }],
			});

			if (indexOfNetwork === 1) {
				setTimeout(() => {
					window.location.reload();
				}, 3000);
			}
		} catch (switchError) {
			if (switchError.code === 4902) {
				try {
					await this._web3.currentProvider.request({
						method: globalUtils.constants.WALLET_ADD_ETHEREUM_CHAIN,
						params: [{
							...theChainConfig,
							chainId: cid
						},
						],
					});
				} catch (addError) {
					console.error(addError);
				}
			} else {
				console.error(switchError);
			}
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
				if (cancelCallback) cancelCallback(error);
			});
	},

	_makeContract: function (address, abi = null) {
		if (!this._contracts[address]) {
			this._contracts[address] = new this._web3.eth.Contract(abi, address);
		}

		return this._contracts[address];
	},

	_onChainChanged: function (chainIdArg) {
		web3Controller.chainId = parseInt(chainIdArg, 16);
		return web3Controller._updateWeb3Func({ chainId: web3Controller.chainId });
	},

	_onAccountsChanges: function (accounts) {
		web3Controller.account = accounts[0];
		return web3Controller._updateWeb3Func({ accounts });
	}
};