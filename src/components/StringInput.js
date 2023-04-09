import QrScanner from "qr-scanner";
import { useEffect, useState } from "react";
import "./AmountInput.css";
import { Tooltip } from "./Tooltip";

let qrScanner = null;

export const StringInput = ({
	title = "",
	tooltip = null,
	onChange = () => { },
	placeholder = "",
	qr = false,
	onClear = () => { }
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

	const handleClear = () => {
		setValue("");
		onChange("");
		onClear();
	};

	const handlePaste = event => {
		event.stopPropagation();

		window.navigator?.clipboard?.readText && navigator?.clipboard?.readText().then(clipText => {
			setValue(clipText);

			setTimeout(() => {
				onChange(clipText);
			}, 1000);
		})
	};

	const handleScan = () => {
		setIsShowQR(true);
	};

	useEffect(() => {
		if (isShowQR) {
			setTimeout(() => {
				if (qrScanner) {
					qrScanner.stop();
					qrScanner = null;
				}

				qrScanner = new QrScanner(
					document.getElementById("scanner"),
					result => {
						setValue(result.data);
						onChange(result.data);

						qrScanner.stop();
						setIsShowQR(false);
					},
					{ highlightScanRegion: true }
				);
				qrScanner.start();
			}, 1000);
		}
	}, [isShowQR]);

	const handleCloseScanner = event => {
		if (qrScanner) {
			qrScanner.stop();
			qrScanner = null;
			setIsShowQR(false);
		}
	};

	return <div className="amountInputLayout">
		<div className="amountInputTitleBar">
			<div className="title">
				{title}

				{tooltip && <Tooltip content={tooltip} />}
			</div>
		</div>

		<div className="stringInput">

			<input
				type="text"
				onChange={handleChange}
				placeholder={placeholder}
				value={value} />

			{value && <button
				className="tinyButton"
				onClick={handleClear}>
				<img
					src="/images/clear.png"
					height="16px"
					alt="clear icon" />
				<span>clear</span>
			</button>}

			{!value && window.navigator?.clipboard?.readText && <button
				className="tinyButton"
				onClick={handlePaste}>
				<img
					src="/images/paste_icon.png"
					height="16px"
					alt="paste icon" />
				<span>paste</span>
			</button>}

			{qr && !value && <button
				className="tinyButtonPrimary"
				onClick={handleScan}>
				<img
					src="/images/scan_icon.png"
					height="16px"
					alt="scan icon" />
				<span>scan</span>
			</button>}
		</div>

		{isShowQR && <div className="scanner">
			<video id="scanner" />

			<div className="description">
				<div className="title">
					<img
						src="/images/scan_icon_white.png"
						height="16px"
						alt="scan_icon" />

					<span>Scan Lightning Invoice</span>
				</div>

				<div>Hold the invoice QR code generate inside the frame, it will be scanned automatically</div>

				<button
					className="fullwidthButtonWhite"
					onClick={handleCloseScanner}>Close</button>
			</div>
		</div>}
	</div>
};