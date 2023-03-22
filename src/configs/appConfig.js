export const appConfig = {
	fee: 100,
	btcLimit: 50000,
	updateDurationMS: 600000,
	priceApi: "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&sparkline=false&page=1&ids=bitcoin,usd-coin,binance-usd,binance-bitcoin",
	networks: {
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
			iconUrls: []
		},
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
			iconUrls: []
		}
	},
	exchanges: {
		"20": {
			b2cTaker: "0xf495e080adcc153579423a3860801a4e282b26f2",
			tokens: {
				usdc: {
					address: "0xA06be0F5950781cE28D965E5EFc6996e88a8C141",
					abi: "/abis/erc20.json",
					decimals: 6
				}
			},
			safeBox: {
				address: "0xdEF092bC601cEcccAd596268b841B42306273970",
				abi: "/abis/safe_box.json"
			}
		},
		"56": {
			b2cTaker: "0xf495e080adcc153579423a3860801a4e282b26f2",
			tokens: {
				usdc: {
					address: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
					abi: "/abis/erc20.json",
					decimals: 18
				},
				busd: {
					address: "0xe9e7cea3dedca5984780bafc599bd69add087d56",
					abi: "/abis/erc20.json",
					decimals: 18
				},
				btcb: {
					address: "0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c",
					abi: "/abis/erc20.json",
					decimals: 18
				}
			},
			safeBox: {
				address: "0xd1a9559D4D54Ae11ad5ceBa1b309484502f4575d",
				abi: "/abis/safe_box.json"
			}
		}
	}
};