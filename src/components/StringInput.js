import QrScanner from "qr-scanner";
import { useEffect, useState } from "react";
import "./AmountInput.css";

export const StringInput = ({
	title = "",
	onChange = () => { },
	placeholder = "",
	qr = false
}) => {
	const [value, setValue] = useState("");
	const [isShowQR, setIsShowQR] = useState(false);

	const handleChange = event => {
		const val = event.currentTarget.value;
		setValue(val);

		setTimeout(() => {
			onChange(val);
		}, 1000);
	};

	const handleScan = event => {
		setIsShowQR(true);
	};

	useEffect(() => {
		if (isShowQR) {
			setTimeout(() => {
				const qrScanner = new QrScanner(
					document.getElementById("scanner"),
					result => {
						setValue(result);
						onChange(result);

						qrScanner.stop();
						setIsShowQR(false);
					}
				);
				qrScanner.start();
			}, 1000);
		}
	}, [isShowQR]);

	return <div className="amountInputLayout">
		<div className="titleBar">
			<div className="title">{title}</div>
		</div>

		<div className="titleBar">

			<input
				type="text"
				onChange={handleChange}
				className="stringInput"
				placeholder={placeholder}
				value={value} />

			{qr && <button
				className="tinyButton"
				onClick={handleScan}>≢</button>}
		</div>

		{isShowQR && <div className="scanner">
			<video id="scanner" />
		</div>}
	</div>
};