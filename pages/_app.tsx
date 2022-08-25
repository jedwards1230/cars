import { NoSsr } from '@mui/material'
import '../styles/globals.css'

import { AppContext, defaultAppContextConfig } from "../src/context";
import { ThemeProvider } from 'next-themes';

function MyApp({ Component, pageProps }) {
  return (
    <NoSsr>
      <ThemeProvider defaultTheme="system" disableTransitionOnChange>
        <AppContext.Provider value={defaultAppContextConfig} >
          <Component {...pageProps} />
        </AppContext.Provider>
      </ThemeProvider>
    </NoSsr>
  )
}

export default MyApp
