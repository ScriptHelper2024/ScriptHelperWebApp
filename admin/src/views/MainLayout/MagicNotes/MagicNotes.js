import React from 'react'
import './MagicNotes.scss'
import PageContextMenu from '../../../components/PageContextMenu/PageContextMenu'
import usePageTitle from '../../../hooks/usePageTitle'
import useApi from '../../../api/useApi'
import { FeedbackContext } from '../../../contexts/FeedbackContext/FeedbackContext'
import RecordsTable, {
	RecordsTableHeader,
	RecordsTableBody,
	RecordsTableNavigation,
	useRecordsTableController,
} from '../../../components/RecordsTable/RecordsTable'
import formatDate from '../../../util/formatDate'
import formatYesNo from '../../../util/formatYesNo'
import SearchInput from '../../../components/SearchInput/SearchInput'
import LoadingBlocker from '../../../components/LoadingBlocker/LoadingBlocker'
import EditMagicNotesDialog from '../../../components/EditMagicNotesDialog/EditMagicNotesDialog'

const MagicNotes = () => {
	usePageTitle('Magic Notes')

	const [statistics, setStatistics] = React.useState({})
	const [nameSearchTerm, setNameSearchTerm] = React.useState('')
	const [activeOnlyFilter, setActiveOnlyFilter] = React.useState(false)
	const [editingRecord, setEditingRecord] = React.useState(false)
	const [editingRecordId, setEditingRecordId] = React.useState(null)

	const api = useApi()
	const feedbackContext = React.useContext(FeedbackContext)
	const recordsTableController = useRecordsTableController()

	React.useEffect(() => {
		recordsTableController.resetPage()
	}, [nameSearchTerm, activeOnlyFilter])

	React.useEffect(() => {
		recordsTableController.indicateLoading()

		api
			.searchMagicNotes(
				nameSearchTerm,
				activeOnlyFilter,
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
		<div className="MagicNotes page">
			<PageContextMenu title="Magic Notes" />

			<section>
				<LoadingBlocker loading={recordsTableController.state.loading}>
					<div className="statistics">
						<div>
							<ul>
								<li>
									<strong>Total Magic Notes: </strong>
									<span>{statistics?.['total']}</span>
								</li>
								<li>
									<strong>Active Magic Notes: </strong>
									<span>{statistics?.['activeCount']}</span>
								</li>
								<li>
									<strong>Inactive Magic Notes: </strong>
									<span>{statistics?.['inactiveCount']}</span>
								</li>
							</ul>
						</div>
					</div>
				</LoadingBlocker>

				<div className="balanced-row-inline">
					<div className="records-filter">
						<label>
							<span>Search by Name</span>
							<SearchInput
								type="search"
								placeholder="Search by..."
								value={nameSearchTerm}
								onChange={(e) => setNameSearchTerm(e.target.value)}
							/>
						</label>
					</div>
					<div className="records-filter">
						<label>
							<span>Active Only</span>
							<input
								type="checkbox"
								onChange={(e) => setActiveOnlyFilter(e.target.checked)}
							/>
						</label>
					</div>
				</div>

				<div className="balanced-row">
					<div>
						<button className="theme" onClick={handleAdd}>
							Add Magic Note
						</button>
					</div>
					<RecordsTableNavigation recordsTableController={recordsTableController} />
				</div>

				<RecordsTable recordsTableController={recordsTableController}>
					<RecordsTableHeader>
						<tr>
							<th>ID</th>
							<th>User</th>
							<th>Active</th>
							<th>Name</th>
							<th>Order Rank</th>
							<th>Created</th>
							<th>Updated</th>
							<th></th>
						</tr>
					</RecordsTableHeader>
					<RecordsTableBody>
						{recordsTableController.state.records?.map((record) => (
							<tr key={record.id}>
								<td>{record.id}</td>
								<td>{record.userEmail}</td>
								<td>{formatYesNo(record.active)}</td>
								<td>{record.name}</td>
								<td>{record.orderRank}</td>
								<td>{formatDate(record.createdAt)}</td>
								<td>{formatDate(record.updatedAt)}</td>
								<td className="actions">
									<button className="theme tight" onClick={() => handleEdit(record.id)}>
										Edit
									</button>
								</td>
							</tr>
						))}
					</RecordsTableBody>
				</RecordsTable>
				{editingRecord && (
					<EditMagicNotesDialog
						isOpen={editingRecord}
						recordId={editingRecordId}
						onFinished={handleFinishedEditing}
					/>
				)}
			</section>
		</div>
	)
}

export default MagicNotes
