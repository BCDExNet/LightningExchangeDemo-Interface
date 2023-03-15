import "./AmountInput.css";

export const AmountLabel = ({
	title = "",
	symbol = "",
	tokenName = "",
	value = 0
}) => {
	return <div className="amountInputLayout">
		<div className="titleBar">
			<div className="title">{title}</div>
		</div>

		<div className="titleBar">
			<div>{symbol}</div>

			<div>{value}</div>
		</div>
	</div>
};