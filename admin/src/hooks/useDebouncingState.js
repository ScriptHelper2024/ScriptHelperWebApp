import React from 'react'
import _ from 'lodash'
/*
	Creates a debounced state for use with inputs that desire a delay before actually updating
	values via their onChange handler. This component creates an additional state value that
	stores the current value to be displayed in the input as well as an onChange handler that 
	calls the original onChange handler after a delay.
*/
const useDebouncingState = (currentValue, onChange, wait = 300) => {
	const debounceRef = React.useRef(null)

	const [debouncedValue, setDebouncedValue] = React.useState(currentValue)

	const handleOnChange = (debouncedValue, currentValue) => {
		if (debouncedValue !== currentValue) {
			onChange(debouncedValue)
		}
	}

	React.useEffect(() => {
		if (debounceRef.current === null) {
			debounceRef.current = _.debounce(handleOnChange, wait)
		}
	}, [debounceRef])

	React.useEffect(() => {
		debounceRef.current(debouncedValue, currentValue)
	}, [debouncedValue])

	return [debouncedValue, setDebouncedValue]
}

export default useDebouncingState
