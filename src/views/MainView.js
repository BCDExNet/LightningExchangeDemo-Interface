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
import { WithdrawModal } from "./WithdrawModal";

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
	const [isShowWithdrawModal, setIsShowWithdrawModal] = useState(false);
	const [currentWithdrawAmount, setCurrentWithdrawAmount] = useState("");
	const [txId, setTxId] = useState("");

	useEffect(() => {
		if (!data?.orders) {
			return;
		}

		const getter = async () => {
			const tempArray = [];
			for (let i = 0; i < data.orders.length; i++) {
				const theDeposit = data.orders[i];
				const id = theDeposit.hash;
				const result = await appController.getDepositInfo(id, theDeposit.native);
				result.secret = id;
				result.id = id + String(i);
				result.sent = theDeposit.sent;
				result.native = theDeposit.native;
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
				setInfoObj({
					type: globalUtils.messageType.DONE,
					title: "Refund Successful!",
					text: "Refund Successful!"
				});
			},
			err => {
				setInfoObj({
					type: globalUtils.messageType.ERROR,
					title: globalUtils.constants.SOMETHING_WRONG,
					text: err.message
				});
			},
			Boolean(parseInt(event.currentTarget.dataset.native))
		);
	};

	const handleWithdraw = event => {
		setCurrentWithdrawAmount(event.currentTarget.dataset.amount);

		appController.withdraw(
			event.currentTarget.id,
			tx => {
				setTxId(tx);
				setIsShowWithdrawModal(true);
			},
			err => {
				handleCloseWithdrawModal();

				setInfoObj({
					type: globalUtils.messageType.ERROR,
					title: globalUtils.constants.SOMETHING_WRONG,
					text: err.message.length < 100 ? err.message : globalUtils.constants.REVERTED_MESSAGE
				});
			},
			Boolean(parseInt(event.currentTarget.dataset.native))
		);
	};

	const handleCloseMessageModal = () => {
		setInfoObj(null);
	}

	const handleCloseWithdrawModal = () => {
		setIsShowWithdrawModal(false);
	};

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
							const theToken = Object.values(appConfig.exchanges[data?.chainId].tokens).find(item => {
								if (deposit.token) {
									return item.address?.toLocaleLowerCase() === deposit.token?.toLocaleLowerCase();
								} else {
									return item.isNative;
								}
							});
							const theDepositAmount = BigNumber(deposit.amount).shiftedBy(-theToken.decimals);

							return <div
								key={deposit.id}
								className="orderItem">
								<div className="headerLine">
									<div className="keyAndValue">
										{theToken?.logo && <img
											src={theToken.logo}
											height="24px"
											alt="token logo" />}

										<span>{theDepositAmount.toFixed(appConfig.fraction)}&nbsp;{theToken.symbol}</span>

										<span className="subValue">~{theDepositAmount.multipliedBy(appController.getTokenPrice(theToken.symbol)).toFixed(appConfig.fraction)}&nbsp;USD</span>
									</div>

									<div style={{
										display: "flex",
										flexDirection: "row",
										gap: "0.5em"
									}}>
										<div className="statusLabel">
											<img
												src={!deposit.sent ? "/images/received.png" : "/images/sent.png"}
												height="12px"
												alt="status icon" />

											{!deposit.sent ? "received" : "sent"}
										</div>

										{deposit.native && <div className="statusLabel">native</div>}
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
										href={"/deposit/" + deposit.secret + "?native=" + Number(Boolean(theToken.isNative))}
										target="_blank"
										rel="noreferrer">details</a>

									{deposit.sent && <button
										className="fullwidthButtonWhite"
										id={deposit.secret}
										data-native={Number(Boolean(theToken.isNative))}
										onClick={handleRefund}
										disabled={new Date(deposit.deadline * 1000) > new Date()}>Refund</button>}

									{!deposit.sent && <button
										className="fullwidthButtonWhite"
										id={deposit.secret}
										data-amount={theDepositAmount.toFixed()}
										data-native={Number(Boolean(theToken.isNative))}
										onClick={handleWithdraw}>withdraw</button>}
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

		{isShowWithdrawModal && <WithdrawModal
			account={appController.shortenString(data?.account, 4, 4)}
			amount={currentWithdrawAmount}
			txId={appController.shortenString(txId, 4, 4)}
			onClose={handleCloseWithdrawModal} />}
	</>
};