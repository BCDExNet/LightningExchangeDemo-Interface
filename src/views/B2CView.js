import BigNumber from "bignumber.js";
import { useEffect, useState } from "react";
// import { AmountInput } from "../components/AmountInput";
import { AmountLabel } from "../components/AmountLabel";
import { StringInput } from "../components/StringInput";
import { appController } from "../libs/appController";
import { invoiceDecoder } from "../libs/invoiceDecoder";
import "./MainView.css";

export const B2CView = ({ data = null }) => {
	const taker = appController.config.b2cTaker;
	const [usdcAmount, setUSDCAmount] = useState(BigNumber(0));
	// const [btcValue, setBtcValue] = useState(BigNumber(0));
	const [invoice, setInvoice] = useState("");
	const [btcAmount, setBTCAmount] = useState(0);
	const [expiry, setExpiry] = useState(0);
	const [secretHash, setSecretHash] = useState("");

	// useEffect(() => {
	// 	setBtcValue(appController.computeBTCWithUSDC(1));
	// }, [data?.updated]);

	// const handleChange = val => {
	// 	setUSDCAmount(BigNumber(val).shiftedBy(6));
	// 	setBtcValue(appController.computeBTCWithUSDC(val));
	// };

	const handleChangeInvoice = val => {
		try {
			const decoded = invoiceDecoder.decode(val);
			if (decoded.amount > 0) {
				setBTCAmount(decoded.amount);
				setUSDCAmount(appController.computeUSDCWithBTC(decoded.amount));
				setExpiry(decoded.timeStamp + decoded.expiry + 3600);
				setSecretHash("0x" + decoded.paymentHash);
				setInvoice(val);
			} else {
				window.alert("Amount is 0.");

				setBTCAmount(0);
				setUSDCAmount(BigNumber(0));
				setExpiry(0);
				setSecretHash("");
			}
		} catch (error) {
			console.error(error);
		}
	};

	const handleApprove = () => {
		appController.approve(() => {
			// window.location.reload();
		});
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
				// window.location.reload();
			}
		);
	};

	return <div className="subViewLayout">
		<StringInput
			title="LN Invoice"
			onChange={handleChangeInvoice}
			placeholder="lnbc1..."
			qr={true} />

		{/* <AmountInput
			title="You Sell"
			balance={data?.usdcBalance?.shiftedBy(-6).toNumber()}
			symbol="USDC"
			tokenName="USD Coin"
			onChange={handleChange}
			max={10} /> */}
		<AmountLabel
			title="You Sell"
			symbol="USDC"
			tokenName="USD Coin"
			value={usdcAmount.shiftedBy(-6).toFixed()}
			deficit={usdcAmount.gt(data?.usdcBalance)} />

		<AmountLabel
			title="You Buy"
			symbol="LN BTC"
			tokenName="Wrapped BTC"
			value={btcAmount.toFixed(0) + " SATs"} />

		{data?.allowance?.lt(usdcAmount) ? <button
			className="fullwidthButton"
			onClick={handleApprove}>Approve</button> : <button
				className="fullwidthButton"
				onClick={handleDeposit}
				disabled={usdcAmount.eq(0) || !taker || !invoice || usdcAmount.gt(data?.usdcBalance)}>Deposit</button>}
	</div>
};
