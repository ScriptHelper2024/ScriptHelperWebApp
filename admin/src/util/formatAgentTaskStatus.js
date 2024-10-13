export const agentTaskStatusOptions = {
	pending: 'Pending',
	processing: 'Processing',
	completed: 'Completed',
	error: 'Error',
}

const formatAgentTaskStatus = (status) => {
	return agentTaskStatusOptions[status]
}

export default formatAgentTaskStatus
