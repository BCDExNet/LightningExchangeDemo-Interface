import "./KeyAndValueInLine.css";

export const KeyAndValueInLine = ({
	keyStr = "",
	value = ""
}) => {
	return <div className="keyAndValueInLineLayout">
		<div className="key">{keyStr}</div>
		<div className="value">{value}</div>
	</div>
};