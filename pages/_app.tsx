import { CssBaseline, NoSsr } from '@mui/material'
import '../styles/globals.css'

import { AppContext, defaultAppContextConfig } from "../src/context";

function MyApp({ Component, pageProps }) {
  return (
    <NoSsr>
      <AppContext.Provider value={defaultAppContextConfig} >
        <CssBaseline />
        <Component {...pageProps} />
      </AppContext.Provider>
    </NoSsr>
  )
}

export default MyApp
