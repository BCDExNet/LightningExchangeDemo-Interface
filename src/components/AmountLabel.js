import { useState } from "react";
import "./AmountInput.css";

export const AmountLabel = ({
	title = "",
	tokens = [],
	onTokenSelected = () => { }
}) => {
	const [tokenSelected, setTokenSelected] = useState(0);

	const handleSelectToken = event => {
		const idx = event.target.selectedIndex;
		setTokenSelected(idx);
		onTokenSelected(idx);
	};

	return <div className="amountInputLayout">
		<div className="titleBar">
			<div className="title">{title}</div>
		</div>

		<div className="titleBar">
			<select
				value={tokens[tokenSelected]?.symbol}
				onChange={handleSelectToken}>
				{tokens.map(token => {
					return <option
						key={token.symbol}
						value={token.symbol}>
						{token.symbol}
					</option>
				})}
			</select>

			<div style={{ color: tokens[tokenSelected]?.deficit ? "red" : "" }}>
				{tokens[tokenSelected]?.value}
			</div>
		</div>
	</div>
};