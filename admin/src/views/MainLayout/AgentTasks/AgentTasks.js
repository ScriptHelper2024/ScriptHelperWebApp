import React from 'react'
import './AgentTasks.scss'

import { useNavigate } from 'react-router-dom'
import PageContextMenu from '../../../components/PageContextMenu/PageContextMenu'
import usePageTitle from '../../../hooks/usePageTitle'
import useApi from '../../../api/useApi'
import { FeedbackContext } from '../../../contexts/FeedbackContext/FeedbackContext'
import RecordsTable, {
	useRecordsTableController,
	RecordsTableHeader,
	RecordsTableBody,
	RecordsTableNavigation,
} from '../../../components/RecordsTable/RecordsTable'
import SearchInput from '../../../components/SearchInput/SearchInput'
import formatDate from '../../../util/formatDate'
import formatAgentTaskStatus, {
	agentTaskStatusOptions,
} from '../../../util/formatAgentTaskStatus'
import formatMilliseconds from '../../../util/formatMilliseconds'
import LoadingBlocker from '../../../components/LoadingBlocker/LoadingBlocker'

const searchFieldOptions = {
	documentType: 'Document Type',
	documentId: 'Document ID',
}

const AgentTasks = () => {
	usePageTitle('Agent Tasks')

	const [statusFilter, setStatusFilter] = React.useState('')
	const [searchTerm, setSearchTerm] = React.useState('')
	const [searchField, setSearchField] = React.useState('documentType')
	const [statistics, setStatistics] = React.useState(null)

	const api = useApi()
	const feedbackContext = React.useContext(FeedbackContext)
	const navigate = useNavigate()
	const recordsTableController = useRecordsTableController()

	React.useEffect(() => {
		recordsTableController.resetPage()
	}, [statusFilter, searchTerm, searchField])

	React.useEffect(() => {
		recordsTableController.indicateLoading()
		const documentType = searchField === 'documentType' && searchTerm.trim()
		const documentId = searchField === 'documentId' && searchTerm.trim()
		api
			.searchAgentTasks(
				statusFilter,
				documentType,
				documentId,
				recordsTableController.state.page
			)
			.then((data) => {
				recordsTableController.handleResponse(data)
				setStatistics(data.statistics)
			})
			.catch((e) => {
				feedbackContext.handleException(e)
				recordsTableController.handleException(e)
			})
	}, [recordsTableController.state.refetch])

	const handleViewRecord = (id) => {
		navigate(`/agent-task/${id}`)
	}

	return (
		<div className="AgentTasks page">
			<PageContextMenu title="Agent Tasks" />

			<section>
				<LoadingBlocker loading={recordsTableController.state.loading}>
					<div className="statistics">
						<div>
							<h5 className="title">Status Totals</h5>
							<ul>
								{Object.keys(statistics?.['statusCounts'] ?? {}).map((key) => (
									<li key={key}>
										<strong>{agentTaskStatusOptions[key]}: </strong>
										<span>{statistics['statusCounts'][key]}</span>
									</li>
								))}
							</ul>
						</div>

						<div>
							<ul>
								<li>
									<strong>Total Agent Tasks: </strong>
									<span>{statistics?.['total']}</span>
								</li>
							</ul>
						</div>
					</div>
				</LoadingBlocker>

				<div className="balanced-row-inline">
					<div className="records-filter">
						<label>
							<span>Filter by Status</span>
							<select
								value={statusFilter}
								onChange={(e) => setStatusFilter(e.target.value)}
							>
								<option value=""> - select - </option>
								{Object.keys(agentTaskStatusOptions).map((key) => (
									<option key={key} value={key}>
										{agentTaskStatusOptions[key]}
									</option>
								))}
							</select>
						</label>
					</div>

					<div className="records-filter">
						<label>
							<span>Search</span>

							<div className="input-select">
								<SearchInput
									type="search"
									placeholder="Search by..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
								/>
								<select
									onChange={(e) => setSearchField(e.target.value)}
									value={searchField}
								>
									{Object.keys(searchFieldOptions).map((key) => (
										<option key={key} value={key}>
											{searchFieldOptions[key]}
										</option>
									))}
								</select>
							</div>
						</label>
					</div>
				</div>

				<div className="balanced-row">
					<div></div>
					<RecordsTableNavigation recordsTableController={recordsTableController} />
				</div>

				<RecordsTable recordsTableController={recordsTableController}>
					<RecordsTableHeader>
						<tr>
							<th>ID</th>
							<th>Project ID</th>
							<th>Status</th>
							<th>LLM</th>
							<th>Type</th>
							<th>Document Id</th>
							<th>Time</th>
							<th>Input Tokens</th>
							<th>Output Tokens</th>
							<th>Created</th>
							<th></th>
						</tr>
					</RecordsTableHeader>
					<RecordsTableBody>
						{recordsTableController.state.records?.map((record) => (
							<tr key={record.id}>
								<td>{record.id}</td>
								<td>{record.projectId}</td>
								<td>{`${formatAgentTaskStatus(record.status)}: ${
									record.statusMessage
								}`}</td>
								<td>{record.llmModel}</td>
								<td>{record.documentType}</td>
								<td>{record.documentId}</td>
								<td>{formatMilliseconds(record.processTime)}</td>
								<td>{record.inputTokensUsed}</td>
								<td>{record.outputTokensUsed}</td>
								<td>{formatDate(record.createdAt)}</td>
								<td className="actions">
									<button
										className="theme tight"
										onClick={() => handleViewRecord(record.id)}
									>
										View
									</button>
								</td>
							</tr>
						))}
					</RecordsTableBody>
				</RecordsTable>
			</section>
		</div>
	)
}

export default AgentTasks
