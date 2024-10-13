import React from 'react'
import PropTypes from 'prop-types'

import recordsTableReducer, {
	refetchRecordsTableAction,
	startRecordsTableLoadingAction,
	handleRecordsTableRestResponseAction,
	setHasErrors,
	recordsTableReducerDefaultValues,
	setRecordsTablePageAction,
	setRecordsTableRowsAction,
} from './recordsTableReducer'

const useRecordsTableController = () => {
	const [state, dispatch] = React.useReducer(
		recordsTableReducer,
		recordsTableReducerDefaultValues
	)

	/* toggle the refetch state. state.refetch is used in useEffect blocks 
	as a watch variable and indicates that the table data is invalid and should 
	be fetched again */
	const toggleRefetch = () => {
		dispatch(refetchRecordsTableAction())
	}

	const indicateLoading = () => {
		// refactor to startRequest
		dispatch(setHasErrors(false))
		dispatch(startRecordsTableLoadingAction())
	}

	const handleResponse = (response) =>
		dispatch(handleRecordsTableRestResponseAction(response))

	const resetPage = () => {
		dispatch(setRecordsTablePageAction(0))
		toggleRefetch()
	}

	const setPage = (page) => {
		dispatch(setRecordsTablePageAction(page))
		toggleRefetch()
	}

	const setRows = (rows) => {
		dispatch(setRecordsTableRowsAction(rows))
	}

	const handleException = () => {
		dispatch(setHasErrors(true))
	}

	return {
		state,
		dispatch,
		toggleRefetch,
		indicateLoading,
		handleResponse,
		handleException,
		setPage,
		setRows,
		resetPage,
	}
}

export const recordsTableControllerPropTypes = PropTypes.shape({
	state: PropTypes.shape({
		loading: PropTypes.bool,
		refetch: PropTypes.bool,
		page: PropTypes.number,
		pages: PropTypes.number,
		records: PropTypes.array,
		rowCount: PropTypes.number,
	}).isRequired,
	dispatch: PropTypes.func.isRequired,
	toggleRefetch: PropTypes.func.isRequired,
	indicateLoading: PropTypes.func.isRequired,
	handleResponse: PropTypes.func.isRequired,
	setRows: PropTypes.func.isRequired,
})

useRecordsTableController.propTypes = recordsTableControllerPropTypes

export default useRecordsTableController
