import "./AmountInput.css";

export const AmountLabel = ({
	title = "",
	symbol = "",
	tokenName = "",
	value = 0,
	deficit = false
}) => {
	return <div className="amountInputLayout">
		<div className="titleBar">
			<div className="title">{title}</div>
		</div>

		<div className="titleBar">
			<div>{symbol}</div>

			<div style={{ color: deficit ? "red" : "" }}>{value}</div>
		</div>
	</div>
};