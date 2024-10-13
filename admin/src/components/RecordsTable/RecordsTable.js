import React from 'react'
import './RecordsTable.scss'
import PropTypes from 'prop-types'

import RecordsTableHeader from './RecordsTableHeader'
import RecordsTableBody from './RecordsTableBody'
import RecordsTableFooter from './RecordsTableFooter'
import RecordsTableNavigation from './RecordsTableNavigation'
import RecordsTableRowLimit from './RecordsTableRowLimit'
import useRecordsTableController, {
	recordsTableControllerPropTypes,
} from './useRecordsTableController'

export {
	RecordsTableHeader,
	RecordsTableBody,
	RecordsTableFooter,
	RecordsTableNavigation,
	RecordsTableRowLimit,
	useRecordsTableController,
	recordsTableControllerPropTypes,
}

export const TableContext = React.createContext()

const RecordsTable = ({ children, recordsTableController }) => {
	const ref = React.useRef(null)

	const [columns, setColumns] = React.useState(0)
	const [resizedBrowser, setResizedBrowser] = React.useState(false)
	const [resizingBrowser, setResizingBrowser] = React.useState(false)

	const { loading, records } = recordsTableController.state

	const onResizeBrowser = () => {
		if (!resizingBrowser) {
			setResizingBrowser(true)
			setTimeout(() => {
				setResizedBrowser((resized) => !resized)
				setResizingBrowser(false)
			}, 100)
		}
	}

	React.useEffect(() => {
		addEventListener('resize', onResizeBrowser)
		return () => removeEventListener('resize', onResizeBrowser)
	}, [])

	React.useLayoutEffect(() => {
		if (ref.current) {
			const tr = ref.current.querySelector('thead tr')
			setColumns(tr.children.length)
		}
	}, [ref.current])

	React.useEffect(() => {
		if (!loading && records?.length && ref.current) {
			const trs = ref.current.querySelectorAll('tbody tr')
			recordsTableController.setRows(trs.length)
			trs.forEach((row) => {
				const tds = row.querySelectorAll('td')
				tds.forEach((cell) => {
					if (cell.scrollWidth > cell.clientWidth) {
						cell.classList.add('overflow')
						cell.title = cell.innerHTML
					} else {
						cell.classList.remove('overflow')
						cell.title = ''
					}
				})
			})
		}
	}, [ref.current, records, loading, resizedBrowser])

	const value = {
		columns,
		hasData: !!records?.length,
		recordsTableController,
	}

	let gridTemplateColumns = ''
	for (let i = 0; i < columns; i++) {
		gridTemplateColumns += 'auto '
	}

	return (
		<TableContext.Provider value={value}>
			<div className="RecordsTable">
				<table ref={ref} style={{ gridTemplateColumns }}>
					{children}
				</table>
			</div>
		</TableContext.Provider>
	)
}

export default RecordsTable

RecordsTable.propTypes = {
	children: PropTypes.oneOfType([
		PropTypes.arrayOf(PropTypes.node),
		PropTypes.node,
	]).isRequired,
	recordsTableController: recordsTableControllerPropTypes,
}
