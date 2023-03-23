import { useEffect, useState } from "react";
import { AmountLabel } from "../components/AmountLabel";
import { StringInput } from "../components/StringInput";
import { appConfig } from "../configs/appConfig";
import { appController } from "../libs/appController";
import { globalUtils } from "../libs/globalUtils";
import { invoiceDecoder } from "../libs/invoiceDecoder";
import "./MainView.css";

export const B2CView = ({ data = null }) => {
	const taker = appController.config.b2cTaker;
	const [tokenAmount, setTokenAmount] = useState(globalUtils.constants.BIGNUMBER_ZERO);
	const [invoice, setInvoice] = useState("");
	const [btcAmount, setBTCAmount] = useState(0);
	const [expiry, setExpiry] = useState(0);
	const [secretHash, setSecretHash] = useState("");
	const [tokenToSellSelected, setTokenToSellSelected] = useState(0);

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

		setTokenAmount(howMuchToken.integerValue());
	};

	useEffect(() => {
		if (data) {
			updateTokenData(0);
		}
	}, [data]);

	const handleChangeInvoice = val => {
		try {
			const decoded = invoiceDecoder.decode(val);
			if (decoded.amount > 0 && decoded.amount < appConfig.btcLimit * 1000) {
				const sats = decoded.amount / 1000;

				recomputeAmountToSell(tokenToSellSelected, sats + appConfig.fee);

				setBTCAmount(sats);
				setExpiry(decoded.timeStamp + decoded.expiry + 3600);
				setSecretHash("0x" + decoded.paymentHash);
				setInvoice(val);
			} else {
				window.alert("Amount is 0 or more than " + appConfig.btcLimit);

				setBTCAmount(0);
				setTokenAmount(globalUtils.constants.BIGNUMBER_ZERO);
				setExpiry(0);
				setSecretHash("");
			}
		} catch (error) {
			console.error(error);
		}
	};

	const handleApprove = () => {
		appController.approve(
			data?.tokens[tokenToSellSelected].symbol,
			() => {
				setTimeout(() => {
					recomputeAmountToSell(tokenToSellSelected, btcAmount + appConfig.fee);
				}, 6000);
			}
		);
	};

	const handleDeposit = () => {
		appController.deposit(
			data?.tokens[tokenToSellSelected].symbol,
			tokenAmount.toString(),
			taker,
			secretHash,
			expiry,
			invoice,
			() => {
				window.alert("deposit successfully! secretHash = " + secretHash);
				// window.location.reload();
			}
		);
	};

	const handleSelectToken = async idx => {
		await updateTokenData(idx);
		setTokenToSellSelected(idx);
		recomputeAmountToSell(idx, btcAmount);
	};

	return <div className="subViewLayout">
		<StringInput
			title="LN Invoice"
			onChange={handleChangeInvoice}
			placeholder="lnbc1..."
			qr={true} />

		<AmountLabel
			title="You Sell"
			tokens={data?.tokens}
			onTokenSelected={handleSelectToken} />

		<AmountLabel
			title="You Buy"
			tokens={[{
				symbol: "LN BTC(Sat)",
				value: btcAmount.toFixed(0) + " SATs"
			}]} />

		{data?.tokens[tokenToSellSelected].allowance?.lt(tokenAmount) ? <button
			className="fullwidthButton"
			onClick={handleApprove}>Approve</button> : <button
				className="fullwidthButton"
				onClick={handleDeposit}
				disabled={tokenAmount.eq(0) || !taker || !invoice || data?.tokens[tokenToSellSelected].deficit}>Deposit</button>}
	</div>
};
