import BigNumber from "bignumber.js";
import { useEffect, useState } from "react";
import { KeyAndValueInLine } from "../components/KeyAndValueInLine";
import { Tab } from "../components/Tab";
import { Tooltip } from "../components/Tooltip";
import { appConfig } from "../configs/appConfig";
import { appController } from "../libs/appController";
import { globalUtils } from "../libs/globalUtils";
import { B2CView } from "./B2CView";
import { C2CView } from "./C2CView";
import "./MainView.css";
import { MessageModal } from "./MessageModal";

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
	const [infoObj, setInfoObj] = useState(null);

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
		console.debug("handleRefund()");

		appController.refund(
			event.currentTarget.id,
			() => {
				setInfoObj({
					type: globalUtils.messageType.DONE,
					title: "refund Successful!",
					text: "refund Successful!"
				});
			},
			err => {
				setInfoObj({
					type: globalUtils.messageType.ERROR,
					title: globalUtils.constants.SOMETHING_WRONG,
					text: err.message
				});
			}
		);
	};

	const handleCloseMessageModal = () => {
		setInfoObj(null);
	}

	return <>
		<div className="appContainer">
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

					<div className="scrollBox">
						{deposits.map(deposit => {
							const theToken = Object.values(appConfig.exchanges[data?.chainId].tokens).find(item => item.address.toLocaleLowerCase() === deposit.token.toLocaleLowerCase());

							return <div
								key={deposit.secret}
								className="orderItem">
								<div className="headerLine">
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

								<KeyAndValueInLine
									keyStr="Beneficiary"
									value={deposit.beneficiary} />

								<KeyAndValueInLine
									keyStr="deadline"
									value={new Date(deposit.deadline * 1000).toLocaleString()} />

								<div className="buttons">
									<a
										className="fullwidthButton"
										style={{ textAlign: "center" }}
										href={"/deposit/" + deposit.secret}
										target="_blank"
										rel="noreferrer">details</a>

									<button
										className="fullwidthButtonWhite"
										id={deposit.secret}
										onClick={handleRefund}
										disabled={new Date(deposit.deadline * 1000) > new Date()}>Refund</button>
								</div>
							</div>
						})}
					</div>
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

		{infoObj && <MessageModal
			title={infoObj.title}
			text={infoObj.text}
			type={infoObj.type}
			onClick={handleCloseMessageModal} />}
	</>
};