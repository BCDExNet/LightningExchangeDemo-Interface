import BigNumber from "bignumber.js";
import { useEffect, useState } from "react";
import { AmountInput } from "../components/AmountInput";
import { AmountLabel } from "../components/AmountLabel";
import { PriceControl } from "../components/PriceControl";
import { StringInput } from "../components/StringInput";
import { appConfig } from "../configs/appConfig";
import { appController } from "../libs/appController";
import { globalUtils } from "../libs/globalUtils";
import { invoiceDecoder } from "../libs/invoiceDecoder";
import "./MainView.css";

export const C2CView = ({ data = null }) => {
	const [tokenAmount, setTokenAmount] = useState(globalUtils.constants.BIGNUMBER_ZERO);
	// const [btcValue, setBtcValue] = useState(globalUtils.constants.BIGNUMBER_ZERO);
	const [taker, setTaker] = useState("");
	const [btcAmount, setBTCAmount] = useState(0);
	const [expiry, setExpiry] = useState(0);
	const [secretHash, setSecretHash] = useState("");
	const [invoice, setInvoice] = useState("");
	const [price, setPrice] = useState(0);
	const [tokenToSellSelected, setTokenToSellSelected] = useState(0);

	useEffect(() => {
		if (data) {
			setPrice(appController.getBTCPrice(data.tokens[0].symbol));
			setBTCAmount(appController.computeBTCWithToken(data.tokens[0].symbol, 1));
		}
	}, []);

	// useEffect(() => {
	// 	// setBtcValue(appController.computeBTCWithToken(data?.tokens[0].symbol, 1, price));
	// 	setBTCAmount(appController.computeBTCWithToken(data?.tokens[0].symbol, 1, price));
	// }, [data.updated, price]);

	const handleChange = val => {
		const theToken = data?.tokens[tokenToSellSelected];
		setTokenAmount(BigNumber(val).shiftedBy(theToken.decimals));
		// setBtcValue(appController.computeBTCWithToken(theToken.symbol, val, price));
		setBTCAmount(appController.computeBTCWithToken(theToken.symbol, val, price));
	};

	const handleChangeBTC = val => {
		setBTCAmount(val);
		setTokenAmount(appController.computeTokenWithBTC(val, data.tokens[tokenToSellSelected].symbol, price));
	}

	const handleChangeTaker = val => {
		setTaker(val);
	};

	const reset = () => {
		setBTCAmount(0);
		setTokenAmount(globalUtils.constants.BIGNUMBER_ZERO)
		setExpiry(0);
		setSecretHash("");
	};

	const handleChangeInvoice = val => {
		try {
			const decoded = invoiceDecoder.decode(val);
			if (decoded.amount > 0) {
				const sats = decoded.amount / 1000 + appConfig.fee;

				recomputeAmountToSell(tokenToSellSelected, sats);

				setTokenAmount(appController.computeTokenWithBTC(sats, data.tokens[tokenToSellSelected].symbol));
				setBTCAmount(sats);
				setExpiry(decoded.timeStamp + decoded.expiry + 3600);
				setSecretHash("0x" + decoded.paymentHash);
				setInvoice(val);
			} else {
				window.alert("Amount is 0.");
				reset();
			}
		} catch (error) {
			console.error(error);
			reset();
		}
	};

	const handleUpdatePrice = val => {
		setPrice(val);
	};

	const handleDeposit = () => {
		appController.deposit(
			tokenAmount.toString(),
			taker,
			secretHash,
			expiry,
			invoice,
			() => {
				window.alert("deposit successfully! secretHash = " + secretHash);
			}
		);
	};

	const handleApprove = () => {
		appController.approve(() => {
			// window.location.reload();
		});
	};

	const updateTokenData = async index => {
		const theToken = data.tokens[index];
		const result = await appController.getDataWithToken(theToken.symbol);
		theToken.allowance = result.allowance;
		theToken.balance = result.balance;
	};

	const recomputeAmountToSell = (index, sats) => {
		const theToken = data.tokens[index];
		const howMuchToken = appController.computeTokenWithBTC(sats, theToken.symbol);
		theToken.value = howMuchToken.shiftedBy(-theToken.decimals).toFixed();
		theToken.deficit = howMuchToken.gt(theToken.balance);
	};

	const handleSelectToken = async idx => {
		await updateTokenData(idx);
		setTokenToSellSelected(idx);
		setPrice(appController.getBTCPrice(data?.tokens[idx].symbol));
		setBTCAmount(appController.computeBTCWithToken(data?.tokens[idx].symbol, 1));
		recomputeAmountToSell(idx, btcAmount);
	};

	return <div className="subViewLayout">
		<StringInput
			title="LN Invoice"
			onChange={handleChangeInvoice}
			placeholder="lnbc1..."
			qr={true} />

		<AmountInput
			title="You Sell"
			tokens={data?.tokens}
			onTokenSelected={handleSelectToken}
			onChange={handleChange}
			valueForced={tokenAmount.shiftedBy(-data.tokens[tokenToSellSelected].decimals).toNumber()}
		/>

		<AmountInput
			title="You Buy"
			tokens={[{
				symbol: "LN BTC(Sat)",
				value: btcAmount.toFixed(0) + " SATs",
				balance: BigNumber(Number.MAX_SAFE_INTEGER).shiftedBy(12),
				decimals: 12
			}]}
			valueForced={btcAmount?.toFixed(0)}
			onChange={handleChangeBTC}
			showMax={false}
		/>

		<PriceControl
			title="USDC per WBTC (+1.17%)"
			defaultPrice={price}
			onChange={handleUpdatePrice} />

		<StringInput
			title="Taker Address"
			onChange={handleChangeTaker}
			placeholder="0x..." />

		{data?.allowance?.lt(tokenAmount) ? <button
			className="fullwidthButton"
			onClick={handleApprove}>Approve</button> : <button
				className="fullwidthButton"
				onClick={handleDeposit}
				disabled={tokenAmount.eq(0) || !taker || !invoice || data?.tokens[tokenToSellSelected].deficit}>Deposit</button>}
	</div>
};
