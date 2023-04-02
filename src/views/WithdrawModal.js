import { KeyAndValueInLine } from "../components/KeyAndValueInLine";
import { Modal } from "../components/Modal";
import "./DepositModal.css";

export const WithdrawModal = ({
	onClose = () => { },
	amount = "",
	account = "",
	txId = ""
}) => {
	return <Modal>
		<div className="depositModalLayout">
			<img
				src="/images/deposit.png"
				width="180px"
				alt="deposit" />

			<h3>Withdraw Successful!&nbsp;<img src="/images/success_stamp.png" width="18px" alt="success stamp" /></h3>

			<KeyAndValueInLine
				keyStr="amount"
				value={amount} />

			<KeyAndValueInLine
				keyStr="wallet address"
				value={account} />

			<KeyAndValueInLine
				keyStr="TxnID"
				value={txId} />

			<button
				className="fullwidthButtonWhite"
				onClick={onClose}>close</button>
		</div>
	</Modal>
};