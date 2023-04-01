import { KeyAndValueInLine } from "../components/KeyAndValueInLine";
import { Modal } from "../components/Modal";
import { SecretHashLabel } from "../components/SecretHashLabel";
import "./DepositModal.css";

export const DepositModal = ({
	onClose = () => { },
	secret = "",
	deposited = "",
	depositor = "",
	beneficiary = ""
}) => {
	return <Modal>
		<div className="depositModalLayout">
			<img
				src="/images/deposit.png"
				width="180px"
				alt="deposit" />

			<h3>Deposit Successful!&nbsp;<img src="/images/success_stamp.png" width="18px" alt="success stamp" /></h3>

			<SecretHashLabel secret={secret} />

			<KeyAndValueInLine
				keyStr="Deposited"
				value={deposited} />

			<KeyAndValueInLine
				keyStr="Depositor"
				value={depositor} />

			<KeyAndValueInLine
				keyStr="Beneficiary"
				value={beneficiary} />

			<div className="tipBlock">
				<h3>share</h3>

				<div>Send the link to your exchange partner so that he can complete the transaction</div>

				{/* <button className="smallButton">
					<img
						src="/images/copy_black.png"
						height="16px"
						alt="copy" />

					<span>copy link</span>
				</button> */}
				<a
					href={"/deposit/" + secret}
					target="_blank"
					rel="noreferrer">details</a>
			</div>

			<button
				className="fullwidthButton"
				style={{ backgroundColor: "transparent" }}
				onClick={onClose}>close</button>
		</div>
	</Modal>
};