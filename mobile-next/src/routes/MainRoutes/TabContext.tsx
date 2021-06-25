import { createContext, FC, useState } from 'react'

export const TabContext = createContext({
  hideTabs: () => {},
  showTabs: () => {}
})

export const useTabContext = () => {
  const [tabHidden, setTabHidden] = useState(false)

  const TabContextProvider: FC = ({ children }) => (
    <TabContext.Provider
      value={{
        hideTabs: () => setTabHidden(true),
        showTabs: () => setTabHidden(false)
      }}
    >
      {children}
    </TabContext.Provider>
  )

  return { TabContextProvider, tabHidden }
}
