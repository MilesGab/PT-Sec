'use client'

import { ThemeProvider } from "@mui/material"
import theme from "./theme"

export default function ApplicationTheme({ children }){
    return(
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
    )
}