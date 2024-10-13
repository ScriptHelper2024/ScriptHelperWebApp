import React from 'react'
import PropTypes from 'prop-types'
import ApolloClientProvider from '../../apollo/ApolloClientProvider'
import useApi from '../../api/useApi'

const UseApiTestComponent = ({ fn }) => {
	return (
		<ApolloClientProvider>
			<UseApiTestContainer fn={fn} />
		</ApolloClientProvider>
	)
}

UseApiTestComponent.propTypes = {
	fn: PropTypes.func,
}

const UseApiTestContainer = ({ fn }) => {
	fn(useApi())
	return <div>test</div>
}

UseApiTestContainer.propTypes = {
	fn: PropTypes.func,
}

export default UseApiTestComponent
