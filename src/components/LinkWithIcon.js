import "./linkWithIcon.css";

export const LinkWithIcon = ({
	icon = "",
	label = "",
	url = ""
}) => {
	return <a
		className="linkWithIcon"
		href={url}>
		{icon && <img
			src={icon}
			height="16px"
			alt="link icon" />}

		{label}
	</a>
};