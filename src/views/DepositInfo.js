import { toCanvas } from "qrcode";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { StringInput } from "../components/StringInput";
import { appController } from "../libs/appController";
import "./DepositInfo.css";

export const DepositInfo = () => {
	const { secret } = useParams();
	const [data, setData] = useState(null);
	const [preimage, setPreimage] = useState("");

	useEffect(() => {
		const getData = async () => {
			const result = await appController.getDepositInfo(secret);

			setData(result);

			toCanvas(
				document.getElementById("qr"),
				result.invoice,
				function (error) {
					if (error) console.error(error)
					console.log('success!');
				}
			);
		};

		getData();
	}, [secret]);

	const handleChangePreimage = val => {
		setPreimage(val);
	};

	const handleWithdraw = event => {
		appController.withdraw(
			preimage,
			() => {
				window.alert("Withdrawn!");
			}
		);
	};

	return <div className="depositInfoLayout">
		<div className="item">
			<span>Secret:</span>
			<span>{secret.substring(0, 12) + "..."}</span>
		</div>

		{data && <>
			<div className="item">
				<span>Depositor:</span>
				<span>{data.depositor.substring(0, 12) + "..."}</span>
			</div>

			<div className="item">
				<span>Beneficiary:</span>
				<span>{data.beneficiary.substring(0, 12) + "..."}</span>
			</div>

			<div className="item">
				<span>Token:</span>
				<span>{data.token.substring(0, 12) + "..."}</span>
			</div>

			<div className="item">
				<span>Amount:</span>
				<span>{data.amount}</span>
			</div>
		</>}

		<div style={{ textAlign: "center" }}>
			<canvas id="qr" />
		</div>

		{!(data?.withdrawn) && <>
			<StringInput
				title="preimage/secret"
				onChange={handleChangePreimage}
				placeholder="0x..." />

			<button
				className="fullwidthButton"
				onClick={handleWithdraw}>Withdraw</button>
		</>}
	</div>
};