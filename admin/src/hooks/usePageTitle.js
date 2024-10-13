import React from 'react'

const usePageTitle = (title) => {
	React.useEffect(() => {
		document.title = title
	}, [title])
}

export default usePageTitle
