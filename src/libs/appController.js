import { web3Controller } from "./web3Controller";
import BigNumber from "bignumber.js";
import { globalUtils } from "./globalUtils";
import { appConfig } from "../configs/appConfig";

export const appController = {
	_config: {
		// price: 24969.0668,
		priceApi: appConfig.priceApi,
	},
	get config() {
		return this._config;
	},

	_account: "",
	get account() {
		return this._account;
	},

	_chainId: 0,
	get chainId() {
		return this._chainId;
	},

	_data: null,

	init: async function (updateWeb3Func) {
		let success = false;

		if (updateWeb3Func) {
			window.localStorage.setItem(globalUtils.constants.AUTOCONNECT, 1);

			success = await web3Controller.connect(eventObject => {
				this._getWeb3Context();
				updateWeb3Func(eventObject);
			});
		} else {
			success = web3Controller.connectDefaultNetwork();
		}

		if (success) {
			return this._getWeb3Context();
		}
	},

	getDataWithToken: async function (token, isNative) {
		if (!this._account) {
			return {
				allowance: globalUtils.constants.BIGNUMBER_ZERO,
				balance: globalUtils.constants.BIGNUMBER_ZERO
			};
		}

		let allowance = "";
		let balance = "";
		if (isNative) {
			allowance = globalUtils.constants.MAX_BIGNUMBER_STRING;
			balance = await web3Controller.getBalance();
		} else {
			const tokenConfig = this._config.tokens[token];
			const erc20Abi = await this._loadJson(tokenConfig.abi);
			allowance = await web3Controller.callContract(tokenConfig.address, erc20Abi, "allowance", this._account, this._config.safeBox.address);
			balance = await web3Controller.callContract(tokenConfig.address, erc20Abi, "balanceOf", this._account);
		}

		return {
			allowance: BigNumber(allowance),
			balance: BigNumber(balance)
		}
	},

	getData: async function () {
		this._updatePrice();

		let i = 0;
		const orders = [];
		const safeBoxAbi = await this._loadJson(this._config.safeBox.abi);
		const safeBoxNativeAbi = await this._loadJson(this._config.safeBoxNative.abi);

		if (this._account) {
			let howManyOrder = await web3Controller.callContract(this._config.safeBox.address, safeBoxAbi, "getDepositorHashLength", this._account);
			while (i < howManyOrder) {
				orders.push({
					hash: await web3Controller.callContract(this._config.safeBox.address, safeBoxAbi, "getDepositorHashByIndex", this._account, i),
					sent: true
				});
				i++;
			}

			i = 0;
			howManyOrder = await web3Controller.callContract(this._config.safeBoxNative.address, safeBoxNativeAbi, "getDepositorHashLength", this._account);
			while (i < howManyOrder) {
				orders.push({
					hash: await web3Controller.callContract(this._config.safeBoxNative.address, safeBoxNativeAbi, "getDepositorHashByIndex", this._account, i),
					sent: true,
					native: true
				});
				i++;
			}

			i = 0;
			howManyOrder = await web3Controller.callContract(this._config.safeBox.address, safeBoxAbi, "getWithdrawerHashLength", this._account);
			while (i < howManyOrder) {
				orders.push({
					hash: await web3Controller.callContract(this._config.safeBox.address, safeBoxAbi, "getWithdrawerHashByIndex", this._account, i),
					sent: false
				});
				i++;
			}

			i = 0;
			howManyOrder = await web3Controller.callContract(this._config.safeBoxNative.address, safeBoxNativeAbi, "getWithdrawerHashLength", this._account);
			while (i < howManyOrder) {
				orders.push({
					hash: await web3Controller.callContract(this._config.safeBoxNative.address, safeBoxNativeAbi, "getWithdrawerHashByIndex", this._account, i),
					sent: false,
					native: true
				});
				i++;
			}
		}

		const tokenSymbols = Object.keys(this._config.tokens);
		const tokens = Object.values(this._config.tokens);
		tokens.forEach((token, index) => {
			token.symbol = tokenSymbols[index];
		});

		return {
			orders,
			tokens
		};
	},

	computeBTCWithToken: function (token, tokenAmount, price = undefined) {
		return BigNumber(tokenAmount)
			.dividedBy(price ?? this._config.prices[token].price)
			.multipliedBy(100000000);
	},

	computeTokenWithBTC: function (satAmount, token, price = undefined) {
		return BigNumber(satAmount)
			.dividedBy(100000000)
			.multipliedBy(price ?? this._config.prices[token].price)
			.shiftedBy(this._config.tokens[token].decimals);
	},

	getBTCPrice: function (token) {
		return this._config.prices ? this._config.prices[token].price : 0;
	},

	getTokenPrice: function (token) {
		return this._config.prices ? this._config.prices[token].currentPrice : 0;
	},

	approve: async function (token, doneCallback, cancelCallback) {
		const tokenConfig = this._config.tokens[token];
		const abi = await this._loadJson(tokenConfig.abi);
		web3Controller.sendContract(
			tokenConfig.address,
			abi,
			"approve",
			doneCallback,
			cancelCallback,
			null,
			this._config.safeBox.address,
			new BigNumber(2).pow(256).minus(1).toFixed()
		);
	},

	deposit: async function (token, amount, beneficiary, secretHash, deadline, invoice, doneCallback, cancelCallback, isNative) {
		let abi = null;
		if (isNative) {
			abi = await this._loadJson(this._config.safeBoxNative.abi);
			web3Controller.sendContract(
				this._config.safeBoxNative.address,
				abi,
				"deposit",
				doneCallback,
				cancelCallback,
				amount,
				beneficiary,
				secretHash,
				deadline,
				invoice
			);
		} else {
			abi = await this._loadJson(this._config.safeBox.abi);
			web3Controller.sendContract(
				this._config.safeBox.address,
				abi,
				"deposit",
				doneCallback,
				cancelCallback,
				null,
				this._config.tokens[token].address,
				amount,
				beneficiary,
				secretHash,
				deadline,
				invoice
			);
		}
	},

	withdraw: async function (preimage, doneCallback, cancelCallback, native) {
		const abi = await this._loadJson(native ? this._config.safeBoxNative.abi : this._config.safeBox.abi);
		web3Controller.sendContract(
			native ? this._config.safeBoxNative.address : this._config.safeBox.address,
			abi,
			"withdraw",
			doneCallback,
			cancelCallback,
			null,
			preimage
		);
	},

	refund: async function (secret, doneCallback, cancelCallback, native) {
		const abi = await this._loadJson(native ? this._config.safeBoxNative.abi : this._config.safeBox.abi);
		web3Controller.sendContract(
			native ? this._config.safeBoxNative.address : this._config.safeBox.address,
			abi,
			"refund",
			doneCallback,
			cancelCallback,
			null,
			secret
		);
	},

	getDepositInfo: async function (secret, isNative) {
		let abi = await this._loadJson(isNative ? this._config.safeBoxNative.abi : this._config.safeBox.abi);
		const result = await web3Controller.callContract(
			isNative ? this._config.safeBoxNative.address : this._config.safeBox.address,
			abi,
			"getDeposit",
			secret
		);
		return result;
	},

	switchNetwork: function (indexOfNetwork) {
		window.localStorage.setItem(globalUtils.constants.AUTOCONNECT, 1);
		web3Controller.switchNetwork(indexOfNetwork);
	},

	shortenString: function (str, head, tail) {
		return str ? str.substring(0, head) + "..." + str.substring(str.length - tail) : "";
	},

	btc2sat: function (btc) {
		return BigNumber(btc).multipliedBy(100000000);
	},

	sat2btc: function (sat) {
		return BigNumber(sat).dividedBy(100000000);
	},

	_loadJson: async function (url) {
		return await (await fetch(url)).json();
	},

	_getWeb3Context: function () {
		this._chainId = web3Controller.chainId;

		if (this._checkChainIdSupported(this._chainId)) {
			this._account = web3Controller.account;
			this._updateAppConfig(this._chainId);

			return true;
		} else {
			return false;
		}
	},

	_checkChainIdSupported: function (cid) {
		return Object.values(appConfig.networks).find(network => network.chainId === cid);
	},

	_updateAppConfig: function (chainId) {
		this._config = {
			...this._config,
			...appConfig.exchanges[chainId]
		};
	},

	_updatePrice: function () {
		const parsePrices = apiResult => {
			const prices = {};

			apiResult.map(item => {
				return prices[item.symbol] = {
					symbol: item.symbol,
					price: apiResult[0].current_price / item.current_price,
					currentPrice: item.current_price
				}
			});

			return prices;
		};

		const getFromLocalStorage = () => {
			const dataStored = JSON.parse(window.localStorage.getItem(globalUtils.constants.PRICE_DATA_STORED));
			if (dataStored) {
				this._config.prices = parsePrices(dataStored);
			}
		};

		try {
			const lastestUpdate = parseInt(window.localStorage.getItem(globalUtils.constants.PRICE_DATA_UPDATED));
			if (lastestUpdate > 0) {
				getFromLocalStorage();
			}

			if (isNaN(lastestUpdate) || (new Date().getTime() - lastestUpdate) > appConfig.updateDurationMS) {
				setTimeout(async () => {
					try {
						const result = await (await fetch(this._config.priceApi)).json();
						this._config.prices = parsePrices(result);

						window.localStorage.setItem(globalUtils.constants.PRICE_DATA_STORED, JSON.stringify(result));
						window.localStorage.setItem(globalUtils.constants.PRICE_DATA_UPDATED, new Date().getTime());
					} catch (fetchError) {
						console.error(fetchError);
					}
				}, 1000);
			}
		} catch (storageError) {
			console.error(storageError);
		}
	}
};
