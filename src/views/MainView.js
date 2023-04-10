import { useEffect, useState } from "react";
import { Tab } from "../components/Tab";
import { Tooltip } from "../components/Tooltip";
import { appController } from "../libs/appController";
import { B2CView } from "./B2CView";
import { C2CView } from "./C2CView";
import "./MainView.css";
import { MessageModal } from "./MessageModal";
import { OrderList } from "./OrderList";
import { globalUtils } from "../libs/globalUtils";
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

	const handleCloseMessageModal = () => {
		setInfoObj(null);
	}

	const handleCloseWithdrawModal = () => {
		setIsShowWithdrawModal(false);
	};

	const handleRefund = (id, native) => {
		appController.refund(
			id,
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
			Boolean(parseInt(native))
		);
	};

	const handleWithdraw = (id, amount, native) => {
		setCurrentWithdrawAmount(amount);

		appController.withdraw(
			id,
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
			Boolean(parseInt(native))
		);
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

				<OrderList
					data={data}
					deposits={deposits}
					onRefund={handleRefund}
					onWithdraw={handleWithdraw} />
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