import BigNumber from "bignumber.js";
import { useEffect, useState } from "react";
import { Tab } from "../components/Tab";
import { Tooltip } from "../components/Tooltip";
import { appConfig } from "../configs/appConfig";
import { appController } from "../libs/appController";
import { B2CView } from "./B2CView";
import { C2CView } from "./C2CView";
import "./MainView.css";

const tabs = [
	{
		label: "B2C"
	},
	{
		label: "C2C"
	}
];

export const MainView = ({ data = null }) => {
	const [IndexOfMainTab, setIndexOfMainTab] = useState(0);
	const [deposits, setDeposits] = useState([]);

	useEffect(() => {
		if (!data?.orders) {
			return;
		}

		const getter = async () => {
			const tempArray = [];
			for (let i = 0; i < data.orders.length; i++) {
				const id = data.orders[i];
				const result = await appController.getDepositInfo(id);
				result.secret = id;
				tempArray.push(result);
			}
			setDeposits(tempArray);
		};

		getter();
	}, [data?.orders]);

	const handleSelectMainTab = idx => {
		setIndexOfMainTab(idx);
	};

	const handleRefund = event => {
		appController.refund(
			event.currentTarget.id,
			() => {
				console.log("call refund()");
			}
		);
	};

	return <div className="appContainer">
		<div className="titleBar">
			<h2>Exchange Method<Tooltip
				sup={true}
				content={<>B2B : exchange with robots<br />C2C: exchange with a friend of yours</>} /></h2>

			<Tab
				name="mainTab"
				tabs={tabs}
				onSelect={handleSelectMainTab} />
		</div>

		<div className="container">
			<div className="mainViewLayout">
				{IndexOfMainTab === 0 && <B2CView data={data} />}

				{IndexOfMainTab === 1 && <C2CView data={data} />}
			</div>

			{deposits.length > 0 && <div className="mainViewLayout">
				<h3>your orders</h3>

				{deposits.map(deposit => {
					const theToken = Object.values(appConfig.exchanges[data?.chainId].tokens).find(item => item.address.toLocaleLowerCase() === deposit.token.toLocaleLowerCase());

					return <div
						key={deposit.secret}
						className="orderItem">
						<div>
							<div className="keyAndValue">
								{theToken?.logo && <img
									src={theToken.logo}
									height="24px"
									alt="token logo" />}

								<span>{BigNumber(deposit.amount).shiftedBy(-theToken.decimals).toFixed()}&nbsp;{theToken.symbol}</span>

								<span className="subValue">~{BigNumber(deposit.amount).shiftedBy(-theToken.decimals).multipliedBy(appController.getTokenPrice(theToken.symbol)).toFixed()}&nbsp;USD</span>
							</div>

							<div className="statusLabel">
								<img
									src={deposit.withdrawn ? "/images/received.png" : "/images/sent.png"}
									height="12px"
									alt="status icon" />

								{deposit.withdrawn ? "received" : "sent"}
							</div>
						</div>

						<div>
							<span className="key">Beneficiary</span>
							<span className="value">{deposit.beneficiary}</span>
						</div>

						<div>
							<span className="key">Deadline</span>
							<span>{new Date(deposit.deadline * 1000).toLocaleString()}</span>
						</div>

						<div style={{
							display: "flex",
							justifyContent: "space-between",
							columnGap: "1em",
							flex: "1 1"
						}}>
							<button
								className="fullwidthButton"
								id={deposit.secret}
								onClick={handleRefund}
								disabled={new Date(deposit.deadline * 1000) > new Date()}>Refund</button>

							<a
								className="fullwidthButtonWhite"
								style={{ textAlign: "center" }}
								href={"/deposit/" + deposit.secret}
								target="_blank" rel="noreferrer">Review</a>
						</div>
					</div>
				})}
			</div>}

			{data?.orders.length === 0 && <div
				className="mainViewLayout"
				style={{ textAlign: "center" }}>
				<h3>your orders</h3>

				<div>No order yet</div>

				<img
					src="/images/no_orders.png"
					height="177px"
					alt="no orders" />
			</div>}
		</div>
	</div>
};