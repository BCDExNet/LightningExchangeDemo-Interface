import { useState } from "react";
import "./AmountInput.css";
import { Select } from "./Select";
import { Tooltip } from "./Tooltip";
import { appController } from "../libs/appController";
import BigNumber from "bignumber.js";
import { appConfig } from "../configs/appConfig";
import { globalUtils } from "../libs/globalUtils";

export const AmountLabel = ({
	title = "",
	tooltip = null,
	tokens = [],
	onTokenSelected = () => { }
}) => {
	const [tokenSelected, setTokenSelected] = useState(0);
	const theToken = tokens[tokenSelected];

	const handleSelectToken = idx => {
		setTokenSelected(idx);
		onTokenSelected(idx);
	};

	return <div className="amountInputLayout">
		<div className="amountInputTitleBar">
			<div className="title">
				{title}

				{tooltip && <Tooltip content={tooltip} />}
			</div>

			<div className="balanceBar">balance:&nbsp;{theToken?.balance?.shiftedBy(-theToken.decimals).toFixed()}</div>
		</div>

		<div className="amountInputTitleBar">
			<Select
				value={tokenSelected}
				onChange={handleSelectToken}
				showCheckIcon={false}
				options={tokens.map(token => {
					return <div
						className="tokenOptionLayout"
						key={token.symbol}
						value={token.symbol}>
						{token.logo && <img
							src={token.logo}
							height="24px"
							alt="token logo" />}

						<div>
							<div className="tokenSymbol">{token.symbol}</div>

							<div className="tokenName">{token.name}</div>
						</div>
					</div>
				})} />

			<div
				className="values"
				style={{ color: theToken?.deficit ? "red" : "" }}>
				<div>{theToken?.fee && theToken?.value.gt(0) ? (globalUtils.formatBigNumber(theToken.value.minus(theToken.fee)) + " + " + globalUtils.formatBigNumber(theToken.fee) + "(fee)") : (theToken?.value ? globalUtils.formatBigNumber(theToken.value) : 0)}</div>

				<div className="subValue">{theToken?.value ? globalUtils.formatBigNumber(theToken?.value.multipliedBy(appController.getTokenPrice(theToken?.symbol))) : 0}&nbsp;USD</div>
			</div>
		</div>
	</div>
};