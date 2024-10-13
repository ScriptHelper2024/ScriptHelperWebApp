import React from 'react'
import './RecordsTableNavigation.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
	faCaretRight,
	faForwardStep,
	faCaretLeft,
	faBackwardStep,
} from '@fortawesome/free-solid-svg-icons'
import { recordsTableControllerPropTypes } from './useRecordsTableController'

const RecordsTableNavigation = ({ recordsTableController }) => {
	const { page, pages } = recordsTableController.state

	const setPage = (page) => recordsTableController.setPage(page)

	const gotoFirstPage = page
		? () => {
				setPage(0)
		  }
		: undefined

	const gotoPreviousPage =
		page !== 0
			? () => {
					setPage(page - 1)
			  }
			: undefined

	const gotoNextPage =
		page + 1 < (pages === undefined ? Infinity : pages)
			? () => {
					setPage(page + 1)
			  }
			: undefined

	const gotoLastPage =
		page + 1 < pages
			? () => {
					setPage(pages - 1)
			  }
			: undefined

	return (
		<div className="RecordsTableNavigation">
			{!!pages && (
				<button disabled={!gotoFirstPage} onClick={() => gotoFirstPage()}>
					<FontAwesomeIcon icon={faBackwardStep} />
				</button>
			)}
			<button disabled={!gotoPreviousPage} onClick={() => gotoPreviousPage()}>
				<FontAwesomeIcon className="caret" icon={faCaretLeft} />
			</button>
			<div>
				<strong>Page: </strong> {page + 1}
			</div>
			{typeof pages === 'number' && (
				<>
					<span>of</span>
					<span>{pages}</span>
				</>
			)}
			<button disabled={!gotoNextPage} onClick={() => gotoNextPage()}>
				<FontAwesomeIcon className="caret" icon={faCaretRight} />
			</button>
			{!!pages && (
				<button disabled={!gotoLastPage} onClick={() => gotoLastPage()}>
					<FontAwesomeIcon icon={faForwardStep} />
				</button>
			)}
		</div>
	)
}
RecordsTableNavigation.propTypes = {
	recordsTableController: recordsTableControllerPropTypes.isRequired,
}

export default RecordsTableNavigation
