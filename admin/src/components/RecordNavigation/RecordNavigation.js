import React from 'react'
import './RecordNavigation.scss'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
	faCaretRight,
	faForwardStep,
	faCaretLeft,
	faBackwardStep,
} from '@fortawesome/free-solid-svg-icons'

const RecordNavigation = ({
	page,
	pages,
	gotoFirstPage,
	gotoPreviousPage,
	gotoNextPage,
	gotoLastPage,
}) => {
	return (
		<div className="RecordNavigation">
			{!!pages && (
				<button disabled={!gotoFirstPage} onClick={() => gotoFirstPage()}>
					<FontAwesomeIcon icon={faBackwardStep} />
				</button>
			)}
			<button disabled={!gotoPreviousPage} onClick={() => gotoPreviousPage()}>
				<FontAwesomeIcon className="caret" icon={faCaretLeft} />
			</button>
			Page: {page + 1}
			{typeof pages === 'number' && ` of ${pages}`}
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

RecordNavigation.propTypes = {
	page: PropTypes.number.isRequired,
	pages: PropTypes.number,
	gotoFirstPage: PropTypes.func,
	gotoPreviousPage: PropTypes.func,
	gotoNextPage: PropTypes.func,
	gotoLastPage: PropTypes.func,
}

export default RecordNavigation
