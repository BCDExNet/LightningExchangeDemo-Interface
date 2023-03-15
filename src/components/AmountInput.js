import { useState } from "react";
import "./AmountInput.css";

export const AmountInput = ({
	title = "",
	balance = 0,
	symbol = "",
	tokenName = "",
	onChange = () => { }
}) => {
	const [value, setValue] = useState(0);

	const handleChange = event => {
		const val = Number(event.currentTarget.value);

		if (!isNaN(val) && val <= balance) {
			setValue(val);
			onChange(val);
		}
	};

	const handleMax = event => {
		setValue(balance);
		onChange(balance);
	};

	return <div className="amountInputLayout">
		<div className="titleBar">
			<div className="title">{title}</div>

			<div>
				<span>Balance: {balance}&nbsp;</span>

				<button onClick={handleMax}>MAX</button>
			</div>
		</div>

		<div className="titleBar">
			<div>{symbol}&nbsp;</div>

			<input
				className="numberInput"
				type="number"
				onChange={handleChange}
				placeholder={0}
				value={value} />
		</div>
	</div>
};