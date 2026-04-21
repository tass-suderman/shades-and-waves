import { createTheme } from "@mui/material";
import kanagawa from "../themes/kanagawa";

export const useTheme = () => {
	const muiTheme = createTheme(kanagawa.themeContent);

	return {
		muiTheme
	};
}
