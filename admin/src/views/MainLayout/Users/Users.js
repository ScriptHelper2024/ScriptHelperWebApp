import React from 'react'
import './Users.scss'

import { useNavigate } from 'react-router-dom'
import PageContextMenu from '../../../components/PageContextMenu/PageContextMenu'
import usePageTitle from '../../../hooks/usePageTitle'
import useApi from '../../../api/useApi'
import formatDate from '../../../util/formatDate'
import formatYesNo from '../../../util/formatYesNo'
import DateRangePicker from '../../../components/DateRangePicker/DateRangePicker'
import { FeedbackContext } from '../../../contexts/FeedbackContext/FeedbackContext'
import RecordsTable, {
	useRecordsTableController,
	RecordsTableHeader,
	RecordsTableBody,
	RecordsTableNavigation,
} from '../../../components/RecordsTable/RecordsTable'
import SearchInput from '../../../components/SearchInput/SearchInput'

const Users = () => {
	usePageTitle('Users')

	const [usersSearchTerm, setUsersSearchTerm] = React.useState('')
	const [fromDate, setFromDate] = React.useState(null)
	const [toDate, setToDate] = React.useState(null)
	const [statistics, setStatistics] = React.useState(null)

	const api = useApi()
	const feedbackContext = React.useContext(FeedbackContext)
	const navigate = useNavigate()
	const recordsTableController = useRecordsTableController()

	React.useEffect(() => {
		recordsTableController.resetPage()
	}, [usersSearchTerm, fromDate, toDate])

	React.useEffect(() => {
		recordsTableController.indicateLoading()
		api
			.searchUsers(
				usersSearchTerm,
				fromDate,
				toDate,
				recordsTableController.state.page
			)
			.then((data) => {
				recordsTableController.handleResponse(data)
				setStatistics(data.statistics)
			})
			.catch((e) => feedbackContext.handleException(e))
	}, [
		recordsTableController.state.refetch,
		recordsTableController.state.page,
		usersSearchTerm,
		fromDate,
		toDate,
	])

	const handleViewUser = (userId) => {
		navigate(`/user/${userId}`)
	}

	return (
		<div className="Users page">
			<PageContextMenu title="Users" />

			<section>
				<div className="balanced-row-inline">
					<div className="records-filter">
						<label>
							<span>Search</span>
							<SearchInput
								type="text"
								onChange={(e) => setUsersSearchTerm(e.target.value)}
								value={usersSearchTerm}
								placeholder="Search users by email"
							/>
						</label>
					</div>

					<div className="records-filter">
						<label>
							<span>Filter by Date Created</span>
						</label>
						<DateRangePicker
							fromDate={fromDate}
							changeFromDate={(date) => setFromDate(date)}
							toDate={toDate}
							changeToDate={(date) => setToDate(date)}
						/>
					</div>
				</div>

				{statistics && (
					<dl className="aggregates">
						<dt>Total Users:</dt>
						<dd>{statistics.totalUsersCount}</dd>
						<dt>Verified Users:</dt>
						<dd>{statistics.verifiedUsersCount}</dd>
					</dl>
				)}

				<div className="balanced-row">
					<div></div>
					<RecordsTableNavigation recordsTableController={recordsTableController} />
				</div>

				<RecordsTable recordsTableController={recordsTableController}>
					<RecordsTableHeader>
						<tr>
							<th>Created</th>
							<th>User ID</th>
							<th>Email</th>
							<th>Verified</th>
							<th>Admin</th>
							<th></th>
							<th></th>
							<th></th>
						</tr>
					</RecordsTableHeader>
					<RecordsTableBody>
						{recordsTableController.state.records?.map((user) => (
							<tr key={user.id}>
								<td>{formatDate(user.createdAt)}</td>
								<td>{user.id}</td>
								<td>{user.email}</td>
								<td>{formatYesNo(user.emailVerified)}</td>
								<td>{formatYesNo(user.adminLevel)}</td>
								<td></td>
								<td></td>
								<td className="actions">
									<button
										className="theme tight"
										onClick={() => handleViewUser(user.id)}
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

export default Users
