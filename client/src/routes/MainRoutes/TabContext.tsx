import { createContext, useState } from 'react'

export const TabContext = createContext({
  hideTabs: () => {},
  showTabs: () => {}
})

export const useTabContext = () => {
  const [tabHidden, setTabHidden] = useState(false)

  return {
    TabContextProvider: TabContext.Provider,
    value: {
      hideTabs: () => setTabHidden(true),
      showTabs: () => setTabHidden(false)
    },
    tabHidden
  }
}
