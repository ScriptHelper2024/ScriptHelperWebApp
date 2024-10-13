import React from 'react'
import './PromptTemplates.scss'

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
import formatDate from '../../../util/formatDate'
import EditPromptTemplatesModal from '../../../components/EditPromptTemplatesModal/EditPromptTemplatesModal'
import LoadingBlocker from '../../../components/LoadingBlocker/LoadingBlocker'
import SearchInput from '../../../components/SearchInput/SearchInput'

const PromptTemplates = () => {
	usePageTitle('Prompt Templates')

	const [statistics, setStatistics] = React.useState(null)
	const [searchTerm, setSearchTerm] = React.useState('')
	const [editingRecord, setEditingRecord] = React.useState(false)
	const [editingRecordId, setEditingRecordId] = React.useState(null)

	const feedbackContext = React.useContext(FeedbackContext)
	const api = useApi()

	const recordsTableController = useRecordsTableController()

	React.useEffect(() => {
		recordsTableController.resetPage()
	}, [searchTerm])

	React.useEffect(() => {
		recordsTableController.indicateLoading()
		api
			.searchPromptTemplates(recordsTableController.state.page, searchTerm)
			.then((data) => {
				recordsTableController.handleResponse(data)
				setStatistics(data.statistics)
			})
			.catch((e) => feedbackContext.handleException(e))
	}, [
		searchTerm,
		recordsTableController.state.refetch,
		recordsTableController.state.page,
	])

	const handleEdit = (userId) => {
		setEditingRecord(true)
		setEditingRecordId(userId)
	}

	const handleAdd = () => {
		setEditingRecord(true)
		setEditingRecordId(null)
	}

	const handleFinishedEditing = (recordUpdated) => {
		setEditingRecord(false)
		setEditingRecordId(null)
		if (recordUpdated) {
			recordsTableController.toggleRefetch()
		}
	}

	return (
		<div className="PromptTemplates page">
			<PageContextMenu title="Prompt Templates" />

			<section>
				<LoadingBlocker loading={recordsTableController.state.loading}>
					<div className="statistics">
						<div>
							<ul>
								<li>
									<strong>Total Prompt Templates:</strong>
									<span>{statistics?.totalPromptTemplatesCount}</span>
								</li>
							</ul>
						</div>
					</div>
				</LoadingBlocker>

				<div className="records-filter search">
					<label>
						<span>Search</span>
						<SearchInput
							type="text"
							className="search-name-reference"
							onChange={(e) => setSearchTerm(e.target.value)}
							value={searchTerm}
							placeholder="Search by Name/Reference Key"
						/>
					</label>
				</div>

				<div className="balanced-row">
					<div>
						<button className="theme" onClick={handleAdd}>
							Add Prompt Template
						</button>
					</div>
					<div>
						<RecordsTableNavigation recordsTableController={recordsTableController} />
					</div>
				</div>
				<RecordsTable recordsTableController={recordsTableController}>
				    <RecordsTableHeader>
				        <tr>
				            <th>ID</th>
				            <th>Name</th>
				            <th>Feature Assignments</th> {/* Updated from Reference Key to Feature Assignments */}
				            <th>User</th>
				            <th>Created</th>
				            <th>Modified</th>
				            <th></th>
				        </tr>
				    </RecordsTableHeader>
				    <RecordsTableBody>
				        {recordsTableController.state.records?.map((row) => (
				            <tr key={row.id}>
				                <td>{row.id}</td>
				                <td>{row.name}</td>
				                {/* Display the assignedSettings */}
				                <td>
				                    {row.assignedSettings.length > 0 ? (
				                        row.assignedSettings.map((setting, index) => (
				                            <React.Fragment key={index}>
				                                {setting}
				                                <br />
				                            </React.Fragment>
				                        ))
				                    ) : (
				                        <span>None</span>
				                    )}
				                </td>
				                <td>{row.creatorEmail}</td>
				                <td>{formatDate(row.createdAt)}</td>
				                <td>{formatDate(row.modifiedAt)}</td>
				                <td className="actions">
				                    <button className="theme tight" onClick={() => handleEdit(row.id)}>
				                        Edit
				                    </button>
				                </td>
				            </tr>
				        ))}
				    </RecordsTableBody>
				</RecordsTable>
				{editingRecord && (
					<EditPromptTemplatesModal
						isOpen={editingRecord}
						recordId={editingRecordId}
						onFinished={handleFinishedEditing}
					/>
				)}
			</section>
		</div>
	)
}

export default PromptTemplates
