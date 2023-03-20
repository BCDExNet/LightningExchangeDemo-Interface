import { web3Controller } from "./web3Controller";
import BigNumber from "bignumber.js";
import { globalUtils } from "./globalUtils";
import { appConfig } from "../configs/appConfig";

export const appController = {
	_config: {
		b2cTaker: "0xf495e080adcc153579423a3860801a4e282b26f2",
		price: 24969.0668,
		priceApi: "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&sparkline=false&page=1&ids=bitcoin,usd-coin",
		"USDC": {
			address: "0xA06be0F5950781cE28D965E5EFc6996e88a8C141",
			abi: "/abis/erc20.json"
		},
		safeBox: {
			address: "0xdEF092bC601cEcccAd596268b841B42306273970",
			abi: "/abis/safe_box.json"
		}
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
		await web3Controller.connect(eventObject => {
			this._getWeb3Context();
			updateWeb3Func(eventObject);
		});

		this._getWeb3Context();
	},

	_getWeb3Context: function () {
		this._account = web3Controller.account;
		this._chainId = web3Controller.chainId;
	},

	_updatePrice: function () {
		const getFromLocalStorage = () => {
			const dataStored = JSON.parse(window.localStorage.getItem(globalUtils.constants.PRICE_DATA_STORED));
			if (dataStored) {
				this._config.price = dataStored[0].current_price / dataStored[1].current_price;
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
						this._config.price = result[0].current_price / result[1].current_price;

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
	},

	getData: async function () {
		this._updatePrice();

		const erc20Abi = await this._loadJson(this._config.USDC.abi);
		const safeBoxAbi = await this._loadJson(this._config.safeBox.abi);
		let i = 0;

		const allowance = await web3Controller.callContract(this._config.USDC.address, erc20Abi, "allowance", this._account, this._config.safeBox.address);

		const usdcBalance = await web3Controller.callContract(this._config.USDC.address, erc20Abi, "balanceOf", this._account);

		const orders = [];

		let howManyOrder = await web3Controller.callContract(this._config.safeBox.address, safeBoxAbi, "getDepositorHashLength", this._account);
		while (i < howManyOrder) {
			orders.push(await web3Controller.callContract(this._config.safeBox.address, safeBoxAbi, "getDepositorHashByIndex", this._account, i));
			i++;
		}

		i = 0;
		howManyOrder = await web3Controller.callContract(this._config.safeBox.address, safeBoxAbi, "getWithdrawerHashLength", this._account);
		while (i < howManyOrder) {
			orders.push(await web3Controller.callContract(this._config.safeBox.address, safeBoxAbi, "getWithdrawerHashByIndex", this._account, i));
			i++;
		}

		return {
			allowance: BigNumber(allowance),
			usdcBalance: BigNumber(usdcBalance),
			orders
		};
	},

	computeBTCWithUSDC: function (usdcAmount, price = undefined) {
		return BigNumber(usdcAmount).dividedBy(price ?? this._config.price).multipliedBy(100000000);
	},

	computeUSDCWithBTC: function (satAmount, price = undefined) {
		return BigNumber(satAmount).dividedBy(100000000).multipliedBy(price ?? this._config.price).shiftedBy(6).integerValue();
	},

	getBTCPrice: function () {
		return this._config.price;
	},

	approve: async function (doneCallback, cancelCallback) {
		const abi = await this._loadJson(this._config.USDC.abi);
		web3Controller.sendContract(
			this._config.USDC.address,
			abi,
			"approve",
			doneCallback,
			cancelCallback,
			this._config.safeBox.address,
			new BigNumber(2).pow(256).minus(1).toFixed()
		);
	},

	deposit: async function (amount, beneficiary, secretHash, deadline, invoice, doneCallback, cancelCallback) {
		const abi = await this._loadJson(this._config.safeBox.abi);
		web3Controller.sendContract(
			this._config.safeBox.address,
			abi,
			"deposit",
			doneCallback,
			cancelCallback,
			this._config.USDC.address,
			amount,
			beneficiary,
			secretHash,
			deadline,
			invoice
		);
	},

	withdraw: async function (preimage, doneCallback, cancelCallback) {
		const abi = await this._loadJson(this._config.safeBox.abi);
		web3Controller.sendContract(
			this._config.safeBox.address,
			abi,
			"withdraw",
			doneCallback,
			cancelCallback,
			preimage
		);
	},

	refund: async function (secret, doneCallback, cancelCallback) {
		const abi = await this._loadJson(this._config.safeBox.abi);
		web3Controller.sendContract(
			this._config.safeBox.address,
			abi,
			"refund",
			doneCallback,
			cancelCallback,
			secret
		);
	},

	getDepositInfo: async function (secret) {
		const abi = await this._loadJson(this._config.safeBox.abi);
		const result = await web3Controller.callContract(
			this._config.safeBox.address,
			abi,
			"getDeposit",
			secret
		);
		return result;
	},

	switchNetwork: function (indexOfNetwork) {
		web3Controller.switchNetwork(indexOfNetwork);
	},

	_loadJson: async function (url) {
		return await (await fetch(url)).json();
	}
};
