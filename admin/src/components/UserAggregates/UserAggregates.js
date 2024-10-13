import React from 'react'
import PropTypes from 'prop-types'

const UserAggregates = ({ aggregates }) => {
	return (
		<dl className="aggregates">
			<dt>Total Users:</dt>
			<dd>{aggregates.totalUsers}</dd>
			<dt>Total Basic Subscribers:</dt>
			<dd>{aggregates.totalBasicSubscribers}</dd>
			<dt>Total Premium Subscribers:</dt>
			<dd>{aggregates.totalPremiumSubscribers}</dd>
		</dl>
	)
}

UserAggregates.propTypes = {
	aggregates: PropTypes.shape({
		totalUsers: PropTypes.number.isRequired,
		totalBasicSubscribers: PropTypes.number.isRequired,
		totalPremiumSubscribers: PropTypes.number.isRequired,
	}),
}

export default UserAggregates
