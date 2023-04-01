import "./linkWithIcon.css";

export const LinkWithIcon = ({
	icon = "",
	label = "",
	url = "",
	fullWidth = false,
	onClick = () => { }
}) => {
	return <a
		className="linkWithIcon"
		href={url}
		style={{ width: fullWidth ? "calc(100% - 32px)" : "fit-content" }}
		target="_blank"
		rel="noreferrer"
		onClick={onClick}>
		{icon && <img
			src={icon}
			height="16px"
			alt="link icon" />}

		{label}
	</a>
};