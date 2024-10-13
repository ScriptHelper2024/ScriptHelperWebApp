import React from 'react'
import './AgentTask.scss'

import usePageTitle from '../../../hooks/usePageTitle'
import { useParams, Link } from 'react-router-dom'
import useApi from '../../../api/useApi'
import { FeedbackContext } from '../../../contexts/FeedbackContext/FeedbackContext'
import LoadingBlocker from '../../../components/LoadingBlocker/LoadingBlocker'
import PageContextMenu from '../../../components/PageContextMenu/PageContextMenu'
import { useNavigate } from 'react-router-dom'
import SmallLoadingIndicator from '../../../components/SmallLoadingIndicator/SmallLoadingIndicator'

import { prettyPrintJson } from 'pretty-print-json'
import '../../../../node_modules/pretty-print-json/dist/css/pretty-print-json.min.css'

const AgentTask = () => {
	const [agentTask, setAgentTask] = React.useState(null)
	const [loading, setLoading] = React.useState(false)

	usePageTitle('Agent Task')

	const { agentTaskId } = useParams()
	const navigate = useNavigate()

	const feedbackContext = React.useContext(FeedbackContext)
	const api = useApi()

	React.useEffect(() => {
		if (agentTaskId) {
			setLoading(true)
			api
				.getAgentTask(agentTaskId)
				.then((data) => setAgentTask(data.agentTask))
				.catch((e) => feedbackContext.handleException(e))
				.finally(() => setLoading(false))
		}
	}, [agentTaskId])

	const breadcrumb = [
		// eslint-disable-next-line react/jsx-key
		<Link to="/agent-tasks">Agent Tasks</Link>,
	]

	const [loadingDelete, setLoadingDelete] = React.useState(false)

	const handleDelete = (recordId) => {
		if (
			!confirm(
				'Are you sure you want to delete this Agent Task?\n\nNote: This action cannot be undone.'
			)
		) {
			return
		}

		setLoadingDelete(true)
		api
			.deleteAgentTask(recordId)
			.then(() => {
				feedbackContext.indicateSuccess('Agent Task deleted')
				goBack()
			})
			.catch((e) => feedbackContext.handleException(e))
			.finally(() => setLoadingDelete(false))
	}

	const [loadingReset, setLoadingReset] = React.useState(false)

	const handleReset = (recordId) => {
		if (!confirm('Are you sure you want to reset this Agent Task?')) {
			return
		}

		setLoadingReset(true)
		api
			.resetAgentTask(recordId)
			.then(() =>
				feedbackContext.indicateSuccess('The Agent Task has been reset.')
			)
			.catch((e) => feedbackContext.handleException(e))
			.finally(() => setLoadingReset(false))
	}

	const goBack = () => navigate('/agent-tasks')

	return (
		<div className="AgentTask page">
			<PageContextMenu
				title={'Agent Task: ' + agentTaskId}
				breadcrumb={breadcrumb}
			/>
			<button className="theme back-button" onClick={goBack}>
				Back
			</button>

			<section>
				<div className="info-and-actions">
					<LoadingBlocker loading={loading}>
						<pre
							className="json-output"
							dangerouslySetInnerHTML={{ __html: prettyPrintJson.toHtml(agentTask) }}
						/>
					</LoadingBlocker>
					<div className="actions">
						<h3>Actions:</h3>
						<button
							className="theme danger"
							onClick={() => handleDelete(agentTaskId)}
						>
							Delete Agent Task
							<SmallLoadingIndicator loading={loadingDelete} />
						</button>
						<button className="theme" onClick={() => handleReset(agentTaskId)}>
							Reset Agent Task
							<SmallLoadingIndicator loading={loadingReset} />
						</button>
					</div>
				</div>
			</section>
		</div>
	)
}

export default AgentTask
