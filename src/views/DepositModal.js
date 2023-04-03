import { useEffect } from "react";
import { KeyAndValueInLine } from "../components/KeyAndValueInLine";
import { Modal } from "../components/Modal";
import { SecretHashLabel } from "../components/SecretHashLabel";
import "./DepositModal.css";
import ClipboardJS from "clipboard";

export const DepositModal = ({
	onClose = () => { },
	secret = "",
	deposited = "",
	depositor = "",
	beneficiary = ""
}) => {
	useEffect(() => {
		const cp = new ClipboardJS("#copyHashButton", {
			text: () => {
				return window.location.origin + "/deposit/" + secret
			}
		});

		// cp.on('success', function (e) {
		// 	// 
		// });

		// cp.on('error', function (e) {
		// 	console.error(e);
		// });

		return () => {
			cp.destroy();
		};
	}, []);

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

				<button
					id="copyHashButton"
					className="smallButton">
					<img
						src="/images/copy_black.png"
						height="16px"
						alt="copy" />

					<span>copy link</span>
				</button>
			</div>

			<button
				className="fullwidthButton"
				style={{ backgroundColor: "transparent" }}
				onClick={onClose}>close</button>
		</div>
	</Modal>
};