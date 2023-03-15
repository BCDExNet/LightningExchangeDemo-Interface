import BigNumber from "bignumber.js";
import { BN } from "bn.js";
import { useState } from "react";
import { AmountInput } from "../components/AmountInput";
import { AmountLabel } from "../components/AmountLabel";
import { PriceControl } from "../components/PriceControl";
import { StringInput } from "../components/StringInput";
import { appController } from "../libs/appController";
import { invoiceDecoder } from "../libs/invoiceDecoder";
import "./MainView.css";

export const C2CView = ({ data = null }) => {
	const [usdcAmount, setUSDCAmount] = useState(BigNumber(0));
	const [btcValue, setBtcValue] = useState(BigNumber(0));
	const [taker, setTaker] = useState("");
	const [btcAmount, setBTCAmount] = useState(0);
	const [expiry, setExpiry] = useState(0);
	const [secretHash, setSecretHash] = useState("");
	const [invoice, setInvoice] = useState("");
	const [price, setPrice] = useState(appController.getBTCPrice());

	const handleChange = val => {
		setUSDCAmount(BigNumber(val).shiftedBy(6));
		setBtcValue(appController.computeBTCWithUSDC(val));
	};

	const handleChangeTaker = val => {
		setTaker(val);
	};

	const handleChangeInvoice = val => {
		try {
			const decoded = invoiceDecoder.decode(val);
			setBTCAmount(decoded.amount);
			setExpiry(decoded.timeStamp + decoded.expiry + 3600);
			setSecretHash("0x" + decoded.paymentSecret);
			setInvoice(val);
		} catch (error) {
			console.error(error);
		}
	};

	const handleUpdatePrice = val => {
		setPrice(val);
	};

	const handleDeposit = () => {
		appController.deposit(
			usdcAmount.toString(),
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
			window.location.reload();
		});
	};

	return <div className="subViewLayout">
		<AmountInput
			title="You Sell"
			balance={data?.usdcBalance?.shiftedBy(-6).toNumber()}
			symbol="USDC"
			tokenName="USD Coin"
			onChange={handleChange} />

		<AmountLabel
			title="You Buy"
			symbol="LN BTC"
			tokenName="Wrapped BTC"
			value={btcValue.toFixed()} />

		<PriceControl
			title="USDC per WBTC (+1.17%)"
			defaultPrice={appController.getBTCPrice()}
			onChange={handleUpdatePrice} />

		<StringInput
			title="Taker Address"
			onChange={handleChangeTaker}
			placeholder="0x..." />

		<StringInput
			title="LN Invoice"
			onChange={handleChangeInvoice}
			placeholder="lnbc1..." />

		{data?.allowance?.lt(usdcAmount) ? <button
			className="fullwidthButton"
			onClick={handleApprove}>Approve</button> : <button
				className="fullwidthButton"
				onClick={handleDeposit}
				disabled={usdcAmount.eq(0) || !taker || !invoice}>Deposit</button>}
	</div>
};