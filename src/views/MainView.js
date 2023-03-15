import BigNumber from "bignumber.js";
import { useEffect, useState } from "react";
import { Tab } from "../components/Tab";
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
		<div className="mainViewLayout">
			<Tab
				name="mainTab"
				tabs={tabs}
				onSelect={handleSelectMainTab} />

			{IndexOfMainTab === 0 && <B2CView data={data} />}

			{IndexOfMainTab === 1 && <C2CView data={data} />}
		</div>

		{deposits.length > 0 && <div className="mainViewLayout">
			{deposits.map(deposit => {
				return <div
					key={deposit.secret}
					className="orderItem">
					<div>
						<span>Beneficiary</span>
						<span className="value">{deposit.beneficiary}</span>
					</div>

					<div>
						<span>Amount</span>
						<span>{BigNumber(deposit.amount).shiftedBy(-6).toFixed()}</span>
					</div>

					<div>
						<span>Deadline</span>
						<span>{new Date(deposit.deadline * 1000).toLocaleString()}</span>
					</div>

					<div style={{
						display: "flex",
						justifyContent: "flex-end",
						columnGap: "1em"
					}}>
						<button
							className="smallButton"
							id={deposit.secret}
							onClick={handleRefund}
							disabled={new Date(deposit.deadline * 1000) > new Date()}>Refund</button>

						<a className="smallButton"
							href={"/deposit/" + deposit.secret}
							target="_blank" rel="noreferrer">Review</a>
					</div>
				</div>
			})}
		</div>}

		{data?.orders.length === 0 && <div>No Order</div>}
	</div>
};