import { createTheme } from "@mui/material";
import { Theme, themes } from "../themes/Theme";
import { useState, useEffect } from "react";
import { useAppStorage } from "./useAppStorage";
import kanagawa from "../themes/kanagawa";

function applyThemeCssVars(t: Theme): void {
	const bg = (t.themeContent.palette as { background: Record<string, string> }).background ?? {}
	const root = document.documentElement.style
	root.setProperty('--pg-bg-app-base',      bg.app      ?? '')
	root.setProperty('--pg-bg-panel-base',    bg.panel    ?? '')
	root.setProperty('--pg-bg-header-base',   bg.header   ?? '')
	root.setProperty('--pg-bg-button-base',   bg.button   ?? '')
	root.setProperty('--pg-bg-card-base',     bg.card     ?? '')
	root.setProperty('--pg-bg-disabled-base', bg.disabled ?? '')
	root.setProperty('--pg-bg-hover-base',    bg.hover    ?? '')
}

export const useTheme = () => {
	const { theme, setTheme } = useAppStorage();
	const muiTheme = createTheme(themes.find(t => t.name === theme)?.themeContent || kanagawa.themeContent);

	const [currentTheme, setCurrentTheme] = useState<Theme>(kanagawa);
	
	useEffect(() => {
		const storedTheme = localStorage.getItem("theme");
		if (storedTheme) {
			const foundTheme = themes.find(t => t.name === storedTheme);
			if (foundTheme) {
				setCurrentTheme(foundTheme);
			}
		}
	}, [theme]);

	// Write --pg-bg-*-base CSS variables so the immersive color-mix chain works
	useEffect(() => {
		applyThemeCssVars(currentTheme);
	}, [currentTheme]);

	const changeTheme = (themeName: string) => {
		const foundTheme = themes.find(t => t.name === themeName);
		if (foundTheme) {
			setCurrentTheme(foundTheme);
			setTheme(themeName);
		}
	}


	return {
		currentTheme,
		changeTheme,
		muiTheme
	};
}

