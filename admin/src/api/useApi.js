import { useMutation, useLazyQuery, NetworkStatus } from '@apollo/client'
import {
	LOGIN,
	LOGOUT,
	ME,
	UPDATE_ME,
	MY_USER_PREFERENCES,
	USER_PREFERENCES_BY_USER_ID,
	UPDATE_MY_USER_PREFERENCES,
	UPDATE_USER_PREFERENCES_BY_USER_ID,
	USERS_SEARCH,
	USER_BY_ID,
	UPDATE_USER,
	DELETE_USER,
	AGENT_TASKS_SEARCH,
	AGENT_TASK_BY_ID,
	ALL_AUTHOR_STYLES,
	AUTHOR_STYLE_BY_ID,
	REGISTER_AUTHOR_STYLE,
	UPDATE_AUTHOR_STYLE,
	DELETE_AUTHOR_STYLE,
	ALL_STYLE_GUIDELINES,
	STYLE_GUIDELINE_BY_ID,
	REGISTER_STYLE_GUIDELINE,
	UPDATE_STYLE_GUIDELINE,
	DELETE_STYLE_GUIDELINE,
	ALL_SCRIPT_DIALOG_FLAVORS,
	SCRIPT_DIALOG_FLAVOR_BY_ID,
	REGISTER_SCRIPT_DIALOG_FLAVOR,
	UPDATE_SCRIPT_DIALOG_FLAVOR,
	DELETE_SCRIPT_DIALOG_FLAVOR,
	ALL_PROMPT_TEMPLATES,
	PROMPT_TEMPLATE_BY_ID,
	REGISTER_PROMPT_TEMPLATE,
	UPDATE_PROMPT_TEMPLATE,
	DELETE_PROMPT_TEMPLATE,
	DEFAULT_LLM_OPTIONS,
	DELETE_AGENT_TASK,
	RESET_AGENT_TASK,
	ALL_MAGIC_NOTES,
	MAGIC_NOTE_BY_ID,
	ADD_MAGIC_NOTE,
	UPDATE_MAGIC_NOTE,
	DELETE_MAGIC_NOTE,
	PLATFORM_STATISTICS,
	PLATFORM_SETTINGS,
	GET_PLATFORM_SETTING,
	UPDATE_PLATFORM_SETTING
} from '../gql/queries'
import appConfig from '../configuration/appConfig'

const { recordLimit } = appConfig

const NOT_AUTHORIZED_ERROR = 'Not authorized: insufficient admin level'
/* unspecific error: inidicates an issue interpreting the response or a server error */
const UNKNOWN_DATA_ERROR = 'Unexpected data response from the server.'

const useApi = () => {
	const getAuthToken = () => {
		return localStorage.getItem('authentication')
	}

	const setAuthToken = (token) => {
		localStorage.setItem('authentication', token)
	}

	const clearAuthToken = () => {
		localStorage.removeItem('authentication')
	}

	const isAuthenticated = () => {
		return !!getAuthToken()
	}

	const [doLoginMutation] = useMutation(LOGIN)

	const doLogin = async (email, password) => {
		return doLoginMutation({ variables: { email, password } }).then((data) => {
			const token = data.data.login.accessToken
			setAuthToken(token)

			return getMe().then((data) => {
				throwErrors(data)
				if (data.user.adminLevel > 0) {
					return true
				} else {
					throw new Error(NOT_AUTHORIZED_ERROR)
				}
			})
		})
	}

	const [doLogoutMutation] = useMutation(LOGOUT)

	const doLogout = async () => {
		return doLogoutMutation().then((data) => {
			if (data.data.logout.success) {
				clearAuthToken()
			}
		})
	}

	const [defaultLlmOptionsQuery] = useLazyQuery(DEFAULT_LLM_OPTIONS)

	const getDefaultLlmOptions = async () => {
		return defaultLlmOptionsQuery().then((data) => {
			throwErrors(data)
			const defaultLlmOptions = JSON.parse(
				data.data.defaultLlmOptions.defaultLlmOptions
			)
			return { defaultLlmOptions }
		})
	}

	const [myUserPreferencesQuery] = useLazyQuery(MY_USER_PREFERENCES)

	const getMyUserPreferences = async () => {
		return myUserPreferencesQuery().then((data) => {
			throwErrors(data)
			return data.data.myUserPreference
		})
	}

	const [updateMyUserPreferencesMutation] = useMutation(
		UPDATE_MY_USER_PREFERENCES
	)

	const updateMyUserPreferences = async (variables) => {
		return updateMyUserPreferencesMutation({ variables }).then((data) => {
			throwErrors(data)
			try {
				return { userPreference: data.data.updateMyUserPreference.userPreference }
			} catch {
				throw new Error(UNKNOWN_DATA_ERROR)
			}
		})
	}

	const [userPreferencesByUserQuery] = useLazyQuery(USER_PREFERENCES_BY_USER_ID)

	const getUserPreferencesByUser = async (id) => {
		return userPreferencesByUserQuery({ variables: { id } }).then((data) => {
			throwErrors(data)
			if (!data.data.userPreferenceByUserId) {
				throw new Error('User Preferences not found.')
			}
			try {
				return data.data.userPreferenceByUserId
			} catch {
				throw new Error(UNKNOWN_DATA_ERROR)
			}
		})
	}

	const [updateUserPreferencesMutation] = useMutation(
		UPDATE_USER_PREFERENCES_BY_USER_ID
	)

	const updateUserPreferences = async (id, variables) => {
		return updateUserPreferencesMutation({
			variables: { id, ...variables },
		}).then((data) => {
			throwErrors(data)
			try {
				return { userPreference: data.data.updateUserPreference.userPreference }
			} catch {
				throw new Error(UNKNOWN_DATA_ERROR)
			}
		})
	}

	const [getMeQuery] = useLazyQuery(ME)

	const getMe = async () => {
		return getMeQuery().then((data) => {
			throwErrors(data)
			if (data?.data?.me?.email) {
				return {
					user: data.data.me,
				}
			} else {
				throw new Error(UNKNOWN_DATA_ERROR)
			}
		})
	}

	const [updateMeMutation] = useMutation(UPDATE_ME)

	const updateMe = async (email, firstName, lastName, password) => {
		return updateMeMutation({
			variables: { email, firstName, lastName, password },
		}).then((data) => {
			throwErrors(data)
			return { user: data.data.updateMe.user }
		})
	}

	const [searchUsersQuery] = useLazyQuery(USERS_SEARCH)

	const searchUsers = async (term, fromDate, toDate, page, limit) => {
		return searchUsersQuery({
			variables: {
				email: term,
				fromDate,
				toDate,
				page: page + 1,
				limit: limit ?? recordLimit,
			},
		}).then((data) => {
			throwErrors(data)
			try {
				return {
					records: data.data.allUsers.users,
					pages: data.data.allUsers.pages,
					statistics: data.data.allUsers.statistics,
				}
			} catch (e) {
				throw new Error(UNKNOWN_DATA_ERROR)
			}
		})
	}

	const [getUserQuery] = useLazyQuery(USER_BY_ID)

	const getUser = async (id) => {
		return getUserQuery({ variables: { id } }).then((data) => {
			throwErrors(data)
			if (data?.data?.userById) {
				return { user: data.data.userById }
			} else {
				throw new Error(UNKNOWN_DATA_ERROR)
			}
		})
	}

	const [updateUserMutation] = useMutation(UPDATE_USER)

	const updateUser = async (id, email, firstName, lastName, password) => {
		return updateUserMutation({
			variables: { id, email, password, firstName, lastName },
		}).then((data) => {
			throwErrors(data)
			if (data?.data?.updateUser?.user) {
				return { user: data.data.updateUser.user }
			} else {
				throw new Error(UNKNOWN_DATA_ERROR)
			}
		})
	}

	const [deleteUserMutation] = useMutation(DELETE_USER)

	const deleteUser = async (id) => {
		return deleteUserMutation({ variables: { id } }).then((data) => {
			throwErrors(data)
			if (data?.data?.deleteUser) {
				return true
			} else {
				throw new Error(UNKNOWN_DATA_ERROR)
			}
		})
	}

	const [searchAgentTasksQuery] = useLazyQuery(AGENT_TASKS_SEARCH)

	const searchAgentTasks = async (status, documentType, documentId, page) => {
		const variables = {
			page: page + 1,
			limit: recordLimit,
		}

		variables.status = status || ''
		variables.documentType = documentType || ''
		variables.documentId = documentId || ''

		return searchAgentTasksQuery({ variables }).then((data) => {
			throwErrors(data)
			try {
				const statistics = { ...data.data.listAgentTasks.statistics }
				statistics.statusCounts = JSON.parse(statistics.statusCounts)
				return {
					records: data.data.listAgentTasks.agentTasks,
					pages: data.data.listAgentTasks.pages,
					statistics,
				}
			} catch (e) {
				throw new Error(UNKNOWN_DATA_ERROR)
			}
		})
	}

	const [getAgentTaskQuery] = useLazyQuery(AGENT_TASK_BY_ID)

	const getAgentTask = async (id) => {
		return getAgentTaskQuery({ variables: { id } }).then((data) => {
			throwErrors(data)
			if (!data.data.agentTaskById) {
				throw new Error('Agent Task not found.')
			}
			try {
				return {
					agentTask: data.data.agentTaskById,
				}
			} catch {
				throw new Error(UNKNOWN_DATA_ERROR)
			}
		})
	}

	const [deleteAgentTaskMutation] = useMutation(DELETE_AGENT_TASK)

	const deleteAgentTask = async (id) => {
		return deleteAgentTaskMutation({ variables: { id } }).then((data) => {
			throwErrors(data)
			try {
				return data.data.deleteAgentTask.success
			} catch {
				throw new Error(UNKNOWN_DATA_ERROR)
			}
		})
	}

	const [resetAgentTaskMutation] = useMutation(RESET_AGENT_TASK)

	const resetAgentTask = async (id) => {
		return resetAgentTaskMutation({ variables: { id } }).then((data) => {
			throwErrors(data)
			try {
				return data.data.resetAgentTask.success
			} catch {
				throw new Error(UNKNOWN_DATA_ERROR)
			}
		})
	}

	const [searchAuthorStylesQuery] = useLazyQuery(ALL_AUTHOR_STYLES)

	const searchAuthorStyles = async (
		searchTerm,
		searchField,
		includeArchived,
		globalOnly,
		page
	) => {
		const search = {}
		search[searchField + 'SearchTerm'] = searchTerm

		const variables = {
			nameSearchTerm: '',
			emailSearchTerm: '',
			idSearchTerm: '',
			...search,
			includeArchived,
			globalOnly,
			page: page + 1,
			limit: recordLimit,
		}

		return searchAuthorStylesQuery({
			variables,
		}).then((data) => {
			throwErrors(data)
			try {
				return {
					records: data.data.allAuthorStyles.authorStyles,
					pages: data.data.allAuthorStyles.pages,
					statistics: data.data.allAuthorStyles.statistics,
				}
			} catch (e) {
				throw new Error(UNKNOWN_DATA_ERROR)
			}
		})
	}

	const [addAuthorStyleMutation] = useMutation(REGISTER_AUTHOR_STYLE)

	const addAuthorStyle = async (variables) => {
		variables.isGlobal = true
		return addAuthorStyleMutation({ variables }).then((data) => {
			throwErrors(data)
			if (data?.data?.registerAuthorStyle?.authorStyle?.id) {
				return { record: data.data.registerAuthorStyle.authorStyle }
			} else {
				throw new Error(UNKNOWN_DATA_ERROR)
			}
		})
	}

	const [updateAuthorStyleMutation] = useMutation(UPDATE_AUTHOR_STYLE)

	const updateAuthorStyle = async (variables) => {
		return updateAuthorStyleMutation({ variables }).then((data) => {
			throwErrors(data)
			if (data?.data?.updateAuthorStyle?.authorStyle?.id) {
				return { record: data.data.updateAuthorStyle.authorStyle }
			} else {
				throw new Error(UNKNOWN_DATA_ERROR)
			}
		})
	}

	const [getAuthorStyleQuery] = useLazyQuery(AUTHOR_STYLE_BY_ID)

	const getAuthorStyle = async (id) => {
		const variables = { id, includeArchived: true, globalOnly: false }
		return getAuthorStyleQuery({ variables }).then((data) => {
			throwErrors(data)
			if (data?.data?.authorStyleById) {
				return { authorStyle: data.data.authorStyleById }
			} else {
				throw new Error(UNKNOWN_DATA_ERROR)
			}
		})
	}

	const [deleteAuthorStyleMutation] = useMutation(DELETE_AUTHOR_STYLE)

	const deleteAuthorStyle = async (id) => {
		return deleteAuthorStyleMutation({ variables: { id } }).then((data) => {
			throwErrors(data)
			if (data?.data?.deleteAuthorStyle) {
				return data.data.deleteAuthorStyle
			} else {
				throw new Error(UNKNOWN_DATA_ERROR)
			}
		})
	}

	const [searchStyleGuidelinesQuery] = useLazyQuery(ALL_STYLE_GUIDELINES)

	const searchStyleGuidelines = async (
		searchTerm,
		searchField,
		includeArchived,
		globalOnly,
		page
	) => {
		const search = {}
		search[searchField + 'SearchTerm'] = searchTerm

		const variables = {
			nameSearchTerm: '',
			emailSearchTerm: '',
			idSearchTerm: '',
			...search,
			includeArchived,
			globalOnly,
			page: page + 1,
			limit: recordLimit,
		}

		return searchStyleGuidelinesQuery({
			variables,
		}).then((data) => {
			throwErrors(data)
			try {
				return {
					records: data.data.allStyleGuidelines.styleGuidelines,
					pages: data.data.allStyleGuidelines.pages,
					statistics: data.data.allStyleGuidelines.statistics,
				}
			} catch (e) {
				throw new Error(UNKNOWN_DATA_ERROR)
			}
		})
	}

	const [addStyleGuidelineMutation] = useMutation(REGISTER_STYLE_GUIDELINE)

	const addStyleGuideline = async (variables) => {
		variables.isGlobal = true
		return addStyleGuidelineMutation({ variables }).then((data) => {
			throwErrors(data)
			if (data?.data?.registerStyleGuideline?.styleGuideline?.id) {
				return { record: data.data.registerStyleGuideline.styleGuideline }
			} else {
				throw new Error(UNKNOWN_DATA_ERROR)
			}
		})
	}

	const [updateStyleGuidelineMutation] = useMutation(UPDATE_STYLE_GUIDELINE)

	const updateStyleGuideline = async (values) => {
		return updateStyleGuidelineMutation({ variables: values }).then((data) => {
			throwErrors(data)
			if (data?.data?.updateStyleGuideline?.styleGuideline?.id) {
				return { record: data.data.updateStyleGuideline.styleGuideline }
			} else {
				throw new Error(UNKNOWN_DATA_ERROR)
			}
		})
	}

	const [getStyleGuidelineQuery] = useLazyQuery(STYLE_GUIDELINE_BY_ID)

	const getStyleGuideline = async (id) => {
		const variables = { id, includeArchived: true, includeGlobal: true }
		return getStyleGuidelineQuery({ variables }).then((data) => {
			throwErrors(data)
			if (data?.data?.styleGuidelineById) {
				return { styleGuideline: data.data.styleGuidelineById }
			} else {
				throw new Error(UNKNOWN_DATA_ERROR)
			}
		})
	}

	const [deleteStyleGuidelineMutation] = useMutation(DELETE_STYLE_GUIDELINE)

	const deleteStyleGuideline = async (id) => {
		return deleteStyleGuidelineMutation({ variables: { id } }).then((data) => {
			throwErrors(data)
			if (data?.data?.deleteStyleGuideline) {
				return data.data.deleteStyleGuideline
			} else {
				throw new Error(UNKNOWN_DATA_ERROR)
			}
		})
	}

	const [searchScriptDialogFlavorsQuery] = useLazyQuery(
		ALL_SCRIPT_DIALOG_FLAVORS
	)

	const allScriptDialogFlavors = async (
		searchTerm,
		searchField,
		includeArchived,
		globalOnly,
		page
	) => {
		const search = {}
		search[searchField + 'SearchTerm'] = searchTerm

		const variables = {
			nameSearchTerm: '',
			emailSearchTerm: '',
			idSearchTerm: '',
			...search,
			includeArchived,
			globalOnly,
			page: page + 1,
			limit: recordLimit,
		}

		return searchScriptDialogFlavorsQuery({ variables }).then((data) => {
			throwErrors(data)
			try {
				return {
					records: data.data.allScriptDialogFlavors.scriptDialogFlavors,
					pages: data.data.allScriptDialogFlavors.pages,
					statistics: data.data.allScriptDialogFlavors.statistics,
				}
			} catch (e) {
				throw new Error(UNKNOWN_DATA_ERROR)
			}
		})
	}

	const [addScriptDialogFlavorMutation] = useMutation(
		REGISTER_SCRIPT_DIALOG_FLAVOR
	)

	const addScriptDialogFlavor = async (variables) => {
		variables.isGlobal = true
		return addScriptDialogFlavorMutation({ variables }).then((data) => {
			throwErrors(data)
			if (data?.data?.registerScriptDialogFlavor?.scriptDialogFlavor?.id) {
				return { record: data.data.registerScriptDialogFlavor.scriptDialogFlavor }
			} else {
				throw new Error(UNKNOWN_DATA_ERROR)
			}
		})
	}

	const [updateScriptDialogFlavorMutation] = useMutation(
		UPDATE_SCRIPT_DIALOG_FLAVOR
	)

	const updateScriptDialogFlavor = async (values) => {
		return updateScriptDialogFlavorMutation({ variables: values }).then(
			(data) => {
				throwErrors(data)
				if (data?.data?.updateScriptDialogFlavor?.scriptDialogFlavor?.id) {
					return { record: data.data.updateScriptDialogFlavor.scriptDialogFlavor }
				} else {
					throw new Error(UNKNOWN_DATA_ERROR)
				}
			}
		)
	}

	const [getScriptDialogFlavorQuery] = useLazyQuery(SCRIPT_DIALOG_FLAVOR_BY_ID)

	const getScriptDialogFlavor = async (id) => {
		const variables = { id, includeArchived: true, includeGlobal: true }
		return getScriptDialogFlavorQuery({ variables }).then((data) => {
			throwErrors(data)
			if (data?.data?.scriptDialogFlavorById) {
				return { scriptDialogFlavor: data.data.scriptDialogFlavorById }
			} else {
				throw new Error(UNKNOWN_DATA_ERROR)
			}
		})
	}

	const [deleteScriptDialogFlavorMutation] = useMutation(
		DELETE_SCRIPT_DIALOG_FLAVOR
	)

	const deleteScriptDialogFlavor = async (id) => {
		return deleteScriptDialogFlavorMutation({ variables: { id } }).then(
			(data) => {
				throwErrors(data)
				if (data?.data?.deleteScriptDialogFlavor) {
					return data.data.deleteScriptDialogFlavor
				} else {
					throw new Error(UNKNOWN_DATA_ERROR)
				}
			}
		)
	}

	const [searchPromptTemplatesQuery] = useLazyQuery(ALL_PROMPT_TEMPLATES)

	const searchPromptTemplates = async (page, searchTerm) => {
		return searchPromptTemplatesQuery({
			variables: {
				searchTerm: searchTerm,
				includeArchived: true,
				includeGlobal: true,
				page: page + 1,
				limit: recordLimit,
			},
		}).then((data) => {
			throwErrors(data)
			try {
				return {
					records: data.data.allPromptTemplates.promptTemplates,
					pages: data.data.allPromptTemplates.pages,
					statistics: data.data.allPromptTemplates.statistics,
				}
			} catch (e) {
				throw new Error(UNKNOWN_DATA_ERROR)
			}
		})
	}

	const [getPromptTemplateQuery] = useLazyQuery(PROMPT_TEMPLATE_BY_ID)

	const getPromptTemplate = async (id) => {
		const variables = { id, includeArchived: true, includeGlobal: true }
		return getPromptTemplateQuery({ variables }).then((data) => {
			throwErrors(data)
			if (data?.data?.promptTemplateById) {
				return { promptTemplate: data.data.promptTemplateById }
			} else {
				throw new Error(UNKNOWN_DATA_ERROR)
			}
		})
	}

	const [addPromptTemplateMutation] = useMutation(REGISTER_PROMPT_TEMPLATE)

	const addPromptTemplate = async (values) => {
		return addPromptTemplateMutation({ variables: values }).then((data) => {
			throwErrors(data)
			if (data?.data?.registerPromptTemplate?.promptTemplate?.id) {
				return { record: data.data.registerPromptTemplate.promptTemplate }
			} else {
				throw new Error(UNKNOWN_DATA_ERROR)
			}
		})
	}

	const [updatePromptTemplateMutation] = useMutation(UPDATE_PROMPT_TEMPLATE)

	const updatePromptTemplate = async (values) => {
		return updatePromptTemplateMutation({ variables: values }).then((data) => {
			throwErrors(data)
			if (data?.data?.updatePromptTemplate?.promptTemplate?.id) {
				return { record: data.data.updatePromptTemplate.promptTemplate }
			} else {
				throw new Error(UNKNOWN_DATA_ERROR)
			}
		})
	}

	const [deletePromptTemplateMutation] = useMutation(DELETE_PROMPT_TEMPLATE)

	const deletePromptTemplate = async (id) => {
		return deletePromptTemplateMutation({ variables: { id } }).then((data) => {
			throwErrors(data)
			if (data?.data?.deletePromptTemplate) {
				return data.data.deletePromptTemplate
			} else {
				throw new Error(UNKNOWN_DATA_ERROR)
			}
		})
	}

	const [searchMagicNotesQuery] = useLazyQuery(ALL_MAGIC_NOTES)

	const searchMagicNotes = async (name, activeOnly, page) => {
		return searchMagicNotesQuery({
			variables: {
				name,
				activeOnly,
				page: page + 1,
				limit: recordLimit,
			},
		}).then((data) => {
			throwErrors(data)
			try {
				return {
					records: data.data.listMagicNoteCritics.magicNoteCritics,
					pages: data.data.listMagicNoteCritics.pages,
					statistics: data.data.listMagicNoteCritics.statistics,
				}
			} catch (e) {
				console.log(e)
				throw new Error(UNKNOWN_DATA_ERROR)
			}
		})
	}

	const [getMagicNoteQuery] = useLazyQuery(MAGIC_NOTE_BY_ID)

	const getMagicNote = async (id) => {
		const variables = { criticId: id }
		return getMagicNoteQuery({ variables }).then((data) => {
			throwErrors(data)
			if (data?.data?.getMagicNoteCritic) {
				return { magicNote: data.data.getMagicNoteCritic }
			} else {
				throw new Error(UNKNOWN_DATA_ERROR)
			}
		})
	}

	const [addMagicNoteMutation] = useMutation(ADD_MAGIC_NOTE)

	const addMagicNote = async (values) => {
		values.updateExisting = false
		values.orderRank = Number(values.orderRank)
		return addMagicNoteMutation({ variables: values }).then((data) => {
			throwErrors(data)
			if (data?.data?.createMagicNoteCritic?.magicNoteCritic?.id) {
				return { record: data.data.createMagicNoteCritic.magicNoteCritic }
			} else {
				throw new Error(UNKNOWN_DATA_ERROR)
			}
		})
	}

	const [updateMagicNoteMutation] = useMutation(UPDATE_MAGIC_NOTE)

	const updateMagicNote = async (values) => {
		values.criticId = values.id
		delete values.id
		values.orderRank = Number(values.orderRank)
		return updateMagicNoteMutation({ variables: values }).then((data) => {
			throwErrors(data)
			if (data?.data?.updateMagicNoteCritic?.magicNoteCritic?.id) {
				return { record: data.data.updateMagicNoteCritic.magicNoteCritic }
			} else {
				throw new Error(UNKNOWN_DATA_ERROR)
			}
		})
	}

	const [deleteMagicNoteMutation] = useMutation(DELETE_MAGIC_NOTE)

	const deleteMagicNote = async (id) => {
		return deleteMagicNoteMutation({ variables: { criticId: id } }).then(
			(data) => {
				throwErrors(data)
				if (data?.data?.deleteMagicNoteCritic) {
					return data.data.deleteMagicNoteCritic
				} else {
					throw new Error(UNKNOWN_DATA_ERROR)
				}
			}
		)
	}

	const [getPlatformStatisticsQuery] = useLazyQuery(PLATFORM_STATISTICS);

	const platformStatistics = async ({ startDate = '', endDate = '' } = {}) => {
			const variables = { startDate, endDate }; // Prepare variables, allowing them to be optional
			return getPlatformStatisticsQuery({ variables })
					.then(data => {
							// Always ensure error handling is robust in production code
							throwErrors(data);

							if (data?.data?.platformStatistics) {
									return data.data.platformStatistics;
							} else {
									throw new Error('Unknown data structure from API');
							}
					});
	};

	const [platformSettings] = useLazyQuery(PLATFORM_SETTINGS);

	const [getPlatformSettingQuery] = useLazyQuery(GET_PLATFORM_SETTING);

	const getPlatformSetting = async ({ key = ''} = {}) => {
			const variables = { key }; // Prepare variables, allowing them to be optional
			return getPlatformSettingQuery({ variables })
					.then(data => {
							// Always ensure error handling is robust in production code
							throwErrors(data);

							if (data?.data?.platformSetting) {
									return data.data.platformSetting;
							} else {
									throw new Error('Unknown data structure from API');
							}
					});
	};

	const [updatePlatformSettingMutation] = useMutation(UPDATE_PLATFORM_SETTING);

  const updatePlatformSetting = async ({ key, value }) => {
    try {
      const response = await updatePlatformSettingMutation({
        variables: { key, value },
      });

      if (response.errors) {
        console.error('Error updating platform setting:', response.errors);
        throw new Error(`Failed to update platform setting with key: ${key}`);
      }

      if (!response.data.updatePlatformSetting.success) {
        throw new Error(`Mutation did not succeed for key: ${key}`);
      }

      return response.data.updatePlatformSetting;
    } catch (error) {
      console.error('Error in updatePlatformSetting:', error);
      throw error;
    }
  };

	return {
		getMyUserPreferences,
		getUserPreferencesByUser,
		updateMyUserPreferences,
		updateUserPreferences,
		getDefaultLlmOptions,
		getAuthToken,
		doLogin,
		isAuthenticated,
		getMe,
		doLogout,
		updateMe,
		searchUsers,
		getUser,
		updateUser,
		deleteUser,
		searchAgentTasks,
		getAgentTask,
		deleteAgentTask,
		resetAgentTask,
		searchAuthorStyles,
		getAuthorStyle,
		addAuthorStyle,
		updateAuthorStyle,
		deleteAuthorStyle,
		searchStyleGuidelines,
		addStyleGuideline,
		updateStyleGuideline,
		getStyleGuideline,
		deleteStyleGuideline,
		allScriptDialogFlavors,
		addScriptDialogFlavor,
		updateScriptDialogFlavor,
		getScriptDialogFlavor,
		deleteScriptDialogFlavor,
		searchPromptTemplates,
		addPromptTemplate,
		updatePromptTemplate,
		getPromptTemplate,
		deletePromptTemplate,
		searchMagicNotes,
		getMagicNote,
		addMagicNote,
		updateMagicNote,
		deleteMagicNote,
		platformStatistics,
		platformSettings,
		getPlatformSetting,
		updatePlatformSetting
	}
}

function throwErrors(data) {
	if (data?.networkStatus === NetworkStatus.error) {
		throw new Error('Network response error.')
	} else if (data.error) {
		throw data.error
	}
}

export default useApi
