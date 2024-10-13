import React from 'react'
import './ScriptDialogFlavors.scss'

import PageContextMenu from '../../../components/PageContextMenu/PageContextMenu'
import usePageTitle from '../../../hooks/usePageTitle'
import useApi from '../../../api/useApi'
import formatDate from '../../../util/formatDate'
import formatYesNo from '../../../util/formatYesNo'
import { FeedbackContext } from '../../../contexts/FeedbackContext/FeedbackContext'
import RecordsTable, {
	useRecordsTableController,
	RecordsTableHeader,
	RecordsTableBody,
	RecordsTableNavigation,
} from '../../../components/RecordsTable/RecordsTable'
import EditScriptDialogFlavorsModal from '../../../components/EditScriptDialogFlavorsModal/EditScriptDialogFlavorsModal'
import LoadingBlocker from '../../../components/LoadingBlocker/LoadingBlocker'
import SearchInput from '../../../components/SearchInput/SearchInput'

const ScriptDialogFlavors = () => {
	usePageTitle('Style Guidelines')

	const [searchTerm, setSearchTerm] = React.useState('')
	const [searchField, setSearchField] = React.useState('name')
	const [includeArchived, setIncludeArchived] = React.useState(false)
	const [globalOnly, setGlobalOnly] = React.useState(false)
	const [editingRecord, setEditingRecord] = React.useState(false)
	const [editingRecordId, setEditingRecordId] = React.useState(null)
	const [statistics, setStatistics] = React.useState(null)

	const api = useApi()
	const feedbackContext = React.useContext(FeedbackContext)
	const recordsTableController = useRecordsTableController()

	React.useEffect(() => {
		recordsTableController.resetPage()
	}, [searchTerm, searchField, includeArchived, globalOnly])

	React.useEffect(() => {
		recordsTableController.indicateLoading()
		api
			.allScriptDialogFlavors(
				searchTerm,
				searchField,
				includeArchived,
				globalOnly,
				recordsTableController.state.page
			)
			.then((data) => {
				recordsTableController.handleResponse(data)
				setStatistics(data.statistics)
			})
			.catch((e) => feedbackContext.handleException(e))
	}, [
		searchTerm,
		searchField,
		includeArchived,
		globalOnly,
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
		<div className="ScriptDialogFlavors page">
			<PageContextMenu title="Script Dialog Flavors" />

			<section>
				<LoadingBlocker loading={recordsTableController.state.loading}>
					<div className="statistics">
						<div>
							<ul>
								<li>
									<strong>Archived Script Dialog Flavors: </strong>
									<span>{statistics?.totalArchivedCount}</span>
								</li>
								<li>
									<strong>Non-Archived Script Dialog Flavors: </strong>
									<span>{statistics?.totalNonArchivedCount}</span>
								</li>
								<li>
									<strong>Global Script Dialog Flavors: </strong>
									<span>{statistics?.totalGlobalCount}</span>
								</li>
								<li>
									<strong>User Script Dialog Flavors: </strong>
									<span>{statistics?.totalUserCreatedCount}</span>
								</li>
								<li>
									<strong>Total Script Dialog Flavors: </strong>
									<span>{statistics?.totalCount}</span>
								</li>
							</ul>
						</div>
					</div>
				</LoadingBlocker>

				<div className="layout-row">
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
									<option value="name">Name</option>
									<option value="id">User ID</option>
									<option value="email">User Email</option>
								</select>
							</div>
						</label>
					</div>

					<div className="records-filter">
						<label>
							<span>Include Archived</span>
							<input
								type="checkbox"
								onClick={() => setIncludeArchived(!includeArchived)}
								value={includeArchived}
							/>
						</label>
					</div>

					<div className="records-filter">
						<label>
							<span>Global Only</span>
							<input
								type="checkbox"
								onClick={() => setGlobalOnly(!globalOnly)}
								value={globalOnly}
							/>
						</label>
					</div>
				</div>

				<div className="balanced-row">
					<div>
						<button className="theme" onClick={handleAdd}>
							Add Script Dialog Flavor
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
							<th>Global</th>
							<th>Archived</th>
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
								<td>{formatYesNo(row.isGlobal)}</td>
								<td>{formatYesNo(row.archived)}</td>
								<td>{row.creatorEmail}</td>
								<td>{formatDate(row.createdAt)}</td>
								<td>{formatDate(row.modified)}</td>
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
					<EditScriptDialogFlavorsModal
						isOpen={editingRecord}
						recordId={editingRecordId}
						onFinished={handleFinishedEditing}
					/>
				)}
			</section>
		</div>
	)
}

export default ScriptDialogFlavors
