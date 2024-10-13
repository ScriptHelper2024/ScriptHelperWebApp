import React from 'react'

const useRecordPaging = () => {
	const [page, setPage] = React.useState(0)
	const [pageCount, setPageCount] = React.useState(undefined)

	const resetPage = () => {
		setPage(0)
	}

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
		page + 1 < (pageCount === undefined ? Infinity : pageCount)
			? () => {
					setPage(page + 1)
			  }
			: undefined

	const gotoLastPage =
		page + 1 < pageCount
			? () => {
					setPage(pageCount - 1)
			  }
			: undefined

	return {
		resetPage,
		page,
		pages: pageCount,
		setPages: setPageCount,
		gotoFirstPage,
		gotoPreviousPage,
		gotoNextPage,
		gotoLastPage,
	}
}

export default useRecordPaging
