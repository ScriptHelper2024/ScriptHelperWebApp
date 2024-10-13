import React from 'react'
import PropTypes from 'prop-types'
import './TabPanel.scss'

const TabContext = React.createContext(null)

const TabPanel = ({ children, tabs }) => {
	const [selectedTab, setSelectedTab] = React.useState(tabs[0])

	return (
		<TabContext.Provider value={selectedTab}>
			<div className="TabPanel">
				<div className="tabs">
					{tabs.map((tab) => (
						<button
							key={tab}
							className={`${selectedTab === tab ? 'selected' : ''}`}
							onClick={() => setSelectedTab(tab)}
						>
							{tab}
						</button>
					))}
					<div className="spacer"></div>
				</div>
				{children}
			</div>
		</TabContext.Provider>
	)
}

TabPanel.propTypes = {
	children: PropTypes.oneOfType([
		PropTypes.arrayOf(PropTypes.node),
		PropTypes.node,
	]).isRequired,
	tabs: PropTypes.arrayOf(PropTypes.string).isRequired,
}

export default TabPanel

export const TabPanelPanel = ({ children, tabName }) => {
	const selectedTab = React.useContext(TabContext)
	return (
		selectedTab === tabName && <div className="TabPanelPanel">{children}</div>
	)
}

TabPanelPanel.propTypes = {
	children: PropTypes.oneOfType([
		PropTypes.arrayOf(PropTypes.node),
		PropTypes.node,
	]).isRequired,
	tabName: PropTypes.string.isRequired,
}
