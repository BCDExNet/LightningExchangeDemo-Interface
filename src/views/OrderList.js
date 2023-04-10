import { appConfig } from "../configs/appConfig";
import BigNumber from "bignumber.js";
import { KeyAndValueInLine } from "../components/KeyAndValueInLine";
import { appController } from "../libs/appController";
import "./MainView.css";
import { globalUtils } from "../libs/globalUtils";
import { useEffect, useRef, useState } from "react";

const OrderItem = ({
	deposit = null,
	theToken = null,
	theDepositAmount = globalUtils.constants.BIGNUMBER_ZERO,
	onRefund = () => { },
	onWithdraw = () => { }
}) => {
	const [countDown, setCountDown] = useState("");
	let timer = useRef(null);

	const stopTimer = () => {
		if (timer.current) {
			clearInterval(timer.current);
			timer.current = null;
		}
	};

	useEffect(() => {
		return () => {
			stopTimer();
		}
	}, []);

	useEffect(() => {
		stopTimer();

		if (!deposit) {
			return;
		}

		timer.current = setInterval(() => {
			setCountDown(globalUtils.timeDiff(deposit.deadline));
		}, 1000);
	}, [deposit]);

	const handleRefund = event => {
		onRefund(event.currentTarget.id, event.currentTarget.dataset.native);
	};

	const handleWithdraw = event => {
		onWithdraw(
			event.currentTarget.id,
			event.currentTarget.dataset.amount,
			event.currentTarget.dataset.native
		);
	};

	return <div className="orderItem">
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
				disabled={new Date(deposit.deadline * 1000) > new Date()}>
				<span>Refund</span>
				<span style={{ fontSize: "smaller" }}>{countDown !== 0 ? " - " + countDown : ""}</span>
			</button>}

			{!deposit.sent && <button
				className="fullwidthButtonWhite"
				id={deposit.secret}
				data-amount={theDepositAmount.toFixed()}
				data-native={Number(Boolean(theToken.isNative))}
				onClick={handleWithdraw}>withdraw</button>}
		</div>
	</div>
};

export const OrderList = ({
	deposits = [],
	data = null,
	onRefund = () => { },
	onWithdraw = () => { }
}) => {
	return <>
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

					return <OrderItem
						key={deposit.id}
						deposit={deposit}
						theToken={theToken}
						theDepositAmount={theDepositAmount}
						onRefund={onRefund}
						onWithdraw={onWithdraw} />
				})}
			</div>
		</div>}

		{deposits.length === 0 && <div
			className="mainViewLayout"
			style={{ textAlign: "center" }}>
			<h3>your orders</h3>

			<div>No order yet</div>

			<img
				src="/images/no_orders.png"
				height="177px"
				alt="no orders" />
		</div>}
	</>
};