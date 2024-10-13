export const recordsTableReducerDefaultValues = {
	loading: false,
	hasErrors: false,
	refetch: false,
	page: 0,
	pages: null,
	rows: undefined,
	records: [],
}

export default function recordsTableReducer(state, action) {
	switch (action.type) {
		case 'REFETCH':
			return { ...state, refetch: !state.refetch }
		case 'START_LOADING':
			return { ...state, loading: true }
		case 'HANDLE_RESPONSE': {
			const { records, pages } = action.response
			return { ...state, records, pages, loading: false }
		}
		case 'SET_HAS_ERRORS': {
			const { hasErrors } = action
			return { ...state, hasErrors, loading: false }
		}
		case 'SET_PAGE': {
			const { page } = action
			return { ...state, page }
		}
		case 'SET_ROWS': {
			const { rows } = action
			return { ...state, rows }
		}
		default:
			return state
	}
}

export const refetchRecordsTableAction = () => ({
	type: 'REFETCH',
})

export const startRecordsTableLoadingAction = () => ({
	type: 'START_LOADING',
})

export const handleRecordsTableRestResponseAction = (response) => ({
	type: 'HANDLE_RESPONSE',
	response,
})

export const setHasErrors = (hasErrors) => ({
	type: 'SET_HAS_ERRORS',
	hasErrors,
})

export const setRecordsTablePageAction = (page) => ({
	type: 'SET_PAGE',
	page,
})

export const setRecordsTableRowsAction = (rows) => ({
	type: 'SET_ROWS',
	rows,
})
