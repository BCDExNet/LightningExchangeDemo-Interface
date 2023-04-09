export const appConfig = {
	fraction: 6,
	fee: 100,
	btcLimit: 50000,
	updateDurationMS: 600000,
	priceApi: "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&sparkline=false&page=1&ids=bitcoin,usd-coin,binance-usd,binance-bitcoin,tether,binancecoin,wrapped-bitcoin,elastos,ethereum",
	defaultNetwork: "bsc",
	networks: {
		bsc: {
			chainName: "Binance",
			chain: "BSC",
			chainId: 56,
			rpcUrls: [
				"https://bsc-dataseed1.defibit.io/"
			],
			nativeCurrency: {
				name: "BINANCE",
				symbol: "BSC",
				decimals: 18
			},
			blockExplorerUrls: [
				"https://bscscan.com/"
			],
			iconUrls: ["/images/bsc.svg"]
		},
		elastos: {
			chainName: "Elastos",
			chain: "ESC",
			chainId: 20,
			rpcUrls: [
				"https://api.elastos.io/esc"
			],
			nativeCurrency: {
				name: "ELA",
				symbol: "ELA",
				decimals: 18
			},
			blockExplorerUrls: [
				"https://eth.elastos.io/"
			],
			iconUrls: ["/images/esc.svg"]
		},
		arbitrum: {
			chainName: "Arbitrum",
			chain: "Arbitrum",
			chainId: 42161,
			rpcUrls: [
				"https://arb1.arbitrum.io/rpc"
			],
			nativeCurrency: {
				name: "ETH",
				symbol: "ETH",
				decimals: 18
			},
			blockExplorerUrls: [
				"https://arbiscan.io/"
			],
			iconUrls: ["/images/arbitrum.svg"]
		}
	},
	exchanges: {
		"20": {
			b2cTaker: "0xf495e080adcc153579423a3860801a4e282b26f2",
			tokens: {
				usdc: {
					name: "USD Coin",
					address: "0xA06be0F5950781cE28D965E5EFc6996e88a8C141",
					abi: "/abis/erc20.json",
					decimals: 6,
					logo: "/images/usdc.png"
				},
				ela: {
					isNative: true,
					name: "ELA",
					decimals: 18,
					logo: "/images/ela.svg"
				}
			},
			safeBox: {
				// address: "0xdEF092bC601cEcccAd596268b841B42306273970",
				address: "0xcCfC09e473911820639e5DD3c71987fD0597eec0",
				abi: "/abis/safe_box.json"
			},
			safeBoxNative: {
				address: "0x23DafbC321dEEEcd3Efdf3fA7593C8d33dcbac11",
				abi: "/abis/LightningSwapNative.json"
			}
		},
		"56": {
			b2cTaker: "0xf495e080adcc153579423a3860801a4e282b26f2",
			tokens: {
				usdc: {
					name: "USD Coin",
					address: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
					abi: "/abis/erc20.json",
					decimals: 18,
					logo: "/images/usdc.png"
				},
				busd: {
					name: "Binance USD",
					address: "0xe9e7cea3dedca5984780bafc599bd69add087d56",
					abi: "/abis/erc20.json",
					decimals: 18,
					logo: "/images/busd.png"
				},
				btcb: {
					name: "Binance Bitcoin",
					address: "0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c",
					abi: "/abis/erc20.json",
					decimals: 18,
					logo: "/images/btc.png"
				},
				bnb: {
					isNative: true,
					name: "BNB",
					decimals: 18,
					logo: "/images/bnb.png"
				}
			},
			safeBox: {
				address: "0xd1a9559D4D54Ae11ad5ceBa1b309484502f4575d",
				abi: "/abis/safe_box.json"
			},
			safeBoxNative: {
				address: "0x316a4B704cbb793d16b7DF228805F49beeb040c5",
				abi: "/abis/LightningSwapNative.json"
			}
		},
		"42161": {
			b2cTaker: "0xf495e080adcc153579423a3860801a4e282b26f2",
			tokens: {
				usdc: {
					name: "USD Coin",
					address: "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8",
					abi: "/abis/erc20.json",
					decimals: 6,
					logo: "/images/usdc.png"
				},
				usdt: {
					name: "Techer USD",
					address: "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
					abi: "/abis/erc20.json",
					decimals: 6,
					logo: "/images/usdt.svg"
				},
				wbtc: {
					name: "Wrapped Bitcoin",
					address: "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f",
					abi: "/abis/erc20.json",
					decimals: 8,
					logo: "/images/btc.png"
				},
				eth: {
					isNative: true,
					name: "ETH",
					decimals: 18,
					logo: "/images/eth.svg"
				}
			},
			safeBox: {
				address: "0xB5a90265631efECF6e4B4F23C23f4B7367839D63",
				abi: "/abis/safe_box.json"
			},
			safeBoxNative: {
				address: "0xeDF9AE3Dfa601ec70085ed7c898D0553b6450F08",
				abi: "/abis/LightningSwapNative.json"
			}
		}
	}
};
