import { gql } from '@apollo/client'

export const DEFAULT_LLM_OPTIONS = gql`
	query DefaultLlmOptions {
		defaultLlmOptions {
			defaultLlmOptions
		}
	}
`

export const MY_USER_PREFERENCES = gql`
	query MyUserPreference {
		myUserPreference {
			defaultLlm
		}
	}
`

export const UPDATE_MY_USER_PREFERENCES = gql`
	mutation UpdateMyUserPreference($defaultLlm: String) {
		updateMyUserPreference(defaultLlm: $defaultLlm) {
			userPreference {
				defaultLlm
			}
		}
	}
`

export const USER_PREFERENCES_BY_USER_ID = gql`
	query UserPreferenceByUserId($id: ID!) {
		userPreferenceByUserId(id: $id) {
			defaultLlm
		}
	}
`

export const UPDATE_USER_PREFERENCES_BY_USER_ID = gql`
	mutation UpdateUserPreference($id: ID!, $defaultLlm: String) {
		updateUserPreference(id: $id, defaultLlm: $defaultLlm) {
			userPreference {
				defaultLlm
			}
		}
	}
`

export const ME = gql`
	query {
		me {
			id
			email
			adminLevel
			firstName
			lastName
		}
	}
`

export const LOGIN = gql`
	mutation Login($email: String!, $password: String!) {
		login(email: $email, password: $password) {
			accessToken
		}
	}
`

export const LOGOUT = gql`
	mutation Logout {
		logout {
			success
		}
	}
`

export const UPDATE_ME = gql`
	mutation UpdateMe(
		$email: String!
		$firstName: String
		$lastName: String
		$password: String!
	) {
		updateMe(
			email: $email
			firstName: $firstName
			lastName: $lastName
			password: $password
		) {
			user {
				id
				email
				firstName
				lastName
			}
		}
	}
`

export const USERS_SEARCH = gql`
	query AllUsers(
		$email: String!
		$fromDate: DateTime
		$toDate: DateTime
		$page: Int!
		$limit: Int
	) {
		allUsers(
			email: $email
			fromDate: $fromDate
			toDate: $toDate
			page: $page
			limit: $limit
		) {
			users {
				id
				email
				emailVerified
				createdAt
				adminLevel
			}
			pages
			statistics {
				totalUsersCount
				verifiedUsersCount
			}
		}
	}
`

export const USER_BY_ID = gql`
	query UserById($id: ID!) {
		userById(id: $id) {
			id
			email
			emailVerified
			firstName
			lastName
			createdAt
			adminLevel
		}
	}
`

export const REGISTER_USER = gql`
	mutation RegisterUser($email: String!, $password: String!) {
		registerUser(email: $email, password: $password) {
			user {
				id
				email
				emailVerified
				createdAt
				adminLevel
			}
		}
	}
`

export const UPDATE_USER = gql`
	mutation UpdateUser(
		$id: ID!
		$email: String!
		$firstName: String
		$lastName: String
		$password: String
	) {
		updateUser(
			id: $id
			email: $email
			firstName: $firstName
			lastName: $lastName
			password: $password
		) {
			user {
				id
				email
				emailVerified
				firstName
				lastName
				createdAt
				adminLevel
			}
		}
	}
`

export const DELETE_USER = gql`
	mutation DeleteUser($id: ID!) {
		deleteUser(id: $id)
	}
`

export const USERS_AGGREGATE = gql`
	query UsersAggregate {
		usersAggregate {
			totalUsers
			totalBasicSubscribers
			totalPremiumSubscribers
		}
	}
`

export const AGENT_TASKS_SEARCH = gql`
	query ListAgentTasks(
		$status: String
		$documentType: String
		$documentId: String
		$page: Int!
		$limit: Int
	) {
		listAgentTasks(
			status: $status
			documentType: $documentType
			documentId: $documentId
			page: $page
			limit: $limit
		) {
			agentTasks {
				id
				projectId
				status
				statusMessage
				llmModel
				maxInputTokens
				maxOutputTokens
				temperature
				promptText
				systemRole
				documentType
				documentId
				metadata
				inputTokensUsed
				outputTokensUsed
				processTime
				agentResults
				agentId
				errors
				createdAt
				processingAt
				updatedAt
			}
			pages
			statistics {
				total
				statusCounts
			}
		}
	}
`

export const AGENT_TASK_BY_ID = gql`
	query AgentTaskById($id: ID!) {
		agentTaskById(id: $id) {
			id
			projectId
			status
			statusMessage
			llmModel
			maxInputTokens
			maxOutputTokens
			temperature
			promptText
			systemRole
			documentType
			documentId
			metadata
			inputTokensUsed
			outputTokensUsed
			processTime
			agentResults
			agentId
			errors
			createdAt
			processingAt
			updatedAt
		}
	}
`

export const DELETE_AGENT_TASK = gql`
	mutation DeleteAgentTask($id: ID!) {
		deleteAgentTask(id: $id) {
			success
		}
	}
`

export const RESET_AGENT_TASK = gql`
	mutation ResetAgentTask($id: ID!) {
		resetAgentTask(id: $id) {
			success
		}
	}
`

export const ALL_AUTHOR_STYLES = gql`
	query AllAuthorStyles(
		$nameSearchTerm: String
		$emailSearchTerm: String
		$idSearchTerm: String
		$includeArchived: Boolean!
		$globalOnly: Boolean!
		$page: Int!
		$limit: Int
	) {
		allAuthorStyles(
			nameSearchTerm: $nameSearchTerm
			emailSearchTerm: $emailSearchTerm
			idSearchTerm: $idSearchTerm
			includeArchived: $includeArchived
			globalOnly: $globalOnly
			page: $page
			limit: $limit
		) {
			authorStyles {
				id
				name
				promptText
				userId
				creatorEmail
				archived
				isGlobal
				createdAt
				modifiedAt
			}
			pages
			statistics {
				totalCount
				totalUserCreatedCount
				totalGlobalCount
				totalArchivedCount
				totalNonArchivedCount
			}
		}
	}
`

export const AUTHOR_STYLE_BY_ID = gql`
	query AuthorStyleById(
		$id: ID!
		$includeArchived: Boolean!
		$globalOnly: Boolean!
	) {
		authorStyleById(
			id: $id
			includeArchived: $includeArchived
			globalOnly: $globalOnly
		) {
			id
			archived
			isGlobal
			name
			promptText
		}
	}
`

export const REGISTER_AUTHOR_STYLE = gql`
	mutation RegisterAuthorStyle(
		$archived: Boolean
		$isGlobal: Boolean
		$name: String!
		$promptText: String!
	) {
		registerAuthorStyle(
			archived: $archived
			isGlobal: $isGlobal
			name: $name
			promptText: $promptText
		) {
			authorStyle {
				id
				archived
				isGlobal
				name
				promptText
			}
		}
	}
`

export const UPDATE_AUTHOR_STYLE = gql`
	mutation UpdateAuthorStyle(
		$id: ID!
		$archived: Boolean
		$isGlobal: Boolean
		$name: String!
		$promptText: String!
	) {
		updateAuthorStyle(
			id: $id
			archived: $archived
			isGlobal: $isGlobal
			name: $name
			promptText: $promptText
		) {
			authorStyle {
				id
				archived
				isGlobal
				name
				promptText
			}
		}
	}
`

export const DELETE_AUTHOR_STYLE = gql`
	mutation DeleteAuthorStyle($id: ID!) {
		deleteAuthorStyle(id: $id)
	}
`

export const ALL_STYLE_GUIDELINES = gql`
	query AllStyleGuidelines(
		$nameSearchTerm: String
		$emailSearchTerm: String
		$idSearchTerm: String
		$includeArchived: Boolean!
		$globalOnly: Boolean!
		$page: Int!
		$limit: Int
	) {
		allStyleGuidelines(
			nameSearchTerm: $nameSearchTerm
			emailSearchTerm: $emailSearchTerm
			idSearchTerm: $idSearchTerm
			includeArchived: $includeArchived
			globalOnly: $globalOnly
			page: $page
			limit: $limit
		) {
			styleGuidelines {
				id
				name
				promptText
				userId
				creatorEmail
				archived
				isGlobal
				createdAt
				modifiedAt
			}
			pages
			statistics {
				totalCount
				totalUserCreatedCount
				totalGlobalCount
				totalArchivedCount
				totalNonArchivedCount
			}
		}
	}
`

export const STYLE_GUIDELINE_BY_ID = gql`
	query StyleGuidelineById(
		$id: ID!
		$includeArchived: Boolean!
		$includeGlobal: Boolean!
	) {
		styleGuidelineById(
			id: $id
			includeArchived: $includeArchived
			includeGlobal: $includeGlobal
		) {
			id
			archived
			isGlobal
			name
			promptText
		}
	}
`

export const REGISTER_STYLE_GUIDELINE = gql`
	mutation RegisterStyleGuideline(
		$archived: Boolean
		$isGlobal: Boolean
		$name: String!
		$promptText: String!
	) {
		registerStyleGuideline(
			archived: $archived
			isGlobal: $isGlobal
			name: $name
			promptText: $promptText
		) {
			styleGuideline {
				id
				archived
				isGlobal
				name
				promptText
			}
		}
	}
`

export const UPDATE_STYLE_GUIDELINE = gql`
	mutation UpdateStyleGuideline(
		$id: ID!
		$archived: Boolean
		$isGlobal: Boolean
		$name: String!
		$promptText: String!
	) {
		updateStyleGuideline(
			id: $id
			archived: $archived
			isGlobal: $isGlobal
			name: $name
			promptText: $promptText
		) {
			styleGuideline {
				id
				archived
				isGlobal
				name
				promptText
			}
		}
	}
`

export const DELETE_STYLE_GUIDELINE = gql`
	mutation DeleteStyleGuideline($id: ID!) {
		deleteStyleGuideline(id: $id)
	}
`

export const ALL_SCRIPT_DIALOG_FLAVORS = gql`
	query AllScriptDialogFlavors(
		$nameSearchTerm: String
		$emailSearchTerm: String
		$idSearchTerm: String
		$includeArchived: Boolean!
		$globalOnly: Boolean!
		$page: Int!
		$limit: Int
	) {
		allScriptDialogFlavors(
			nameSearchTerm: $nameSearchTerm
			emailSearchTerm: $emailSearchTerm
			idSearchTerm: $idSearchTerm
			includeArchived: $includeArchived
			globalOnly: $globalOnly
			page: $page
			limit: $limit
		) {
			scriptDialogFlavors {
				id
				name
				promptText
				userId
				creatorEmail
				archived
				isGlobal
				createdAt
				modifiedAt
			}
			pages
			statistics {
				totalCount
				totalUserCreatedCount
				totalGlobalCount
				totalArchivedCount
				totalNonArchivedCount
			}
		}
	}
`

export const SCRIPT_DIALOG_FLAVOR_BY_ID = gql`
	query ScriptDialogFlavorById(
		$id: ID!
		$includeArchived: Boolean!
		$includeGlobal: Boolean!
	) {
		scriptDialogFlavorById(
			id: $id
			includeArchived: $includeArchived
			includeGlobal: $includeGlobal
		) {
			id
			archived
			isGlobal
			name
			promptText
		}
	}
`

export const REGISTER_SCRIPT_DIALOG_FLAVOR = gql`
	mutation RegisterScriptDialogFlavor(
		$archived: Boolean
		$isGlobal: Boolean
		$name: String!
		$promptText: String!
	) {
		registerScriptDialogFlavor(
			archived: $archived
			isGlobal: $isGlobal
			name: $name
			promptText: $promptText
		) {
			scriptDialogFlavor {
				id
				archived
				isGlobal
				name
				promptText
			}
		}
	}
`

export const UPDATE_SCRIPT_DIALOG_FLAVOR = gql`
	mutation UpdateScriptDialogFlavor(
		$id: ID!
		$archived: Boolean
		$isGlobal: Boolean
		$name: String!
		$promptText: String!
	) {
		updateScriptDialogFlavor(
			id: $id
			archived: $archived
			isGlobal: $isGlobal
			name: $name
			promptText: $promptText
		) {
			scriptDialogFlavor {
				id
				archived
				isGlobal
				name
				promptText
			}
		}
	}
`

export const DELETE_SCRIPT_DIALOG_FLAVOR = gql`
	mutation DeleteScriptDialogFlavor($id: ID!) {
		deleteScriptDialogFlavor(id: $id)
	}
`

export const ALL_PROMPT_TEMPLATES = gql`
	query AllPromptTemplates($searchTerm: String, $page: Int!, $limit: Int) {
		allPromptTemplates(searchTerm: $searchTerm, page: $page, limit: $limit) {
			promptTemplates {
				id
				name
				referenceKey
				promptText
				creatorEmail
				createdAt
				modifiedAt
				assignedSettings
			}
			pages
			statistics {
				totalPromptTemplatesCount
			}
		}
	}
`

export const PROMPT_TEMPLATE_BY_ID = gql`
	query PromptTemplateById($id: ID!) {
		promptTemplateById(id: $id) {
			id
			name
			referenceKey
			promptText
			creatorEmail
			createdAt
			modifiedAt
			assignedSettings
		}
	}
`

export const REGISTER_PROMPT_TEMPLATE = gql`
	mutation RegisterPromptTemplate(
		$name: String!
		$promptText: String!
		$referenceKey: String!
	) {
		registerPromptTemplate(
			name: $name
			promptText: $promptText
			referenceKey: $referenceKey
		) {
			promptTemplate {
				id
				name
				referenceKey
				promptText
				creatorEmail
				createdAt
				modifiedAt
			}
		}
	}
`

export const UPDATE_PROMPT_TEMPLATE = gql`
	mutation UpdatePromptTemplate(
		$id: ID!
		$name: String!
		$promptText: String!
		$referenceKey: String!
	) {
		updatePromptTemplate(
			id: $id
			name: $name
			promptText: $promptText
			referenceKey: $referenceKey
		) {
			promptTemplate {
				id
				name
				referenceKey
				promptText
				creatorEmail
				createdAt
				modifiedAt
			}
		}
	}
`

export const DELETE_PROMPT_TEMPLATE = gql`
	mutation DeletePromptTemplate($id: ID!) {
		deletePromptTemplate(id: $id)
	}
`

export const ALL_MAGIC_NOTES = gql`
	query ListMagicNoteCritics(
		$name: String
		$activeOnly: Boolean
		$page: Int!
		$limit: Int
	) {
		listMagicNoteCritics(
			name: $name
			activeOnly: $activeOnly
			page: $page
			limit: $limit
		) {
			magicNoteCritics {
				id
				userEmail
				active
				name
				orderRank
				storyTextPrompt
				sceneTextPrompt
				beatSheetPrompt
				scriptTextPrompt
				createdAt
				updatedAt
			}
			pages
			statistics {
				total
				activeCount
				inactiveCount
			}
		}
	}
`

export const MAGIC_NOTE_BY_ID = gql`
	query getMagicNoteCritic($criticId: ID!) {
		getMagicNoteCritic(criticId: $criticId) {
			id
			userEmail
			active
			name
			orderRank
			storyTextPrompt
			sceneTextPrompt
			beatSheetPrompt
			scriptTextPrompt
			createdAt
			updatedAt
		}
	}
`

export const ADD_MAGIC_NOTE = gql`
	mutation CreateMagicNoteCritic(
		$active: Boolean!
		$name: String!
		$orderRank: Int!
		$storyTextPrompt: String
		$sceneTextPrompt: String
		$beatSheetPrompt: String
		$scriptTextPrompt: String
	) {
		createMagicNoteCritic(
			active: $active
			name: $name
			orderRank: $orderRank
			storyTextPrompt: $storyTextPrompt
			sceneTextPrompt: $sceneTextPrompt
			beatSheetPrompt: $beatSheetPrompt
			scriptTextPrompt: $scriptTextPrompt
		) {
			magicNoteCritic {
				id
				userEmail
				active
				name
				orderRank
				storyTextPrompt
				sceneTextPrompt
				beatSheetPrompt
				scriptTextPrompt
				createdAt
				updatedAt
			}
		}
	}
`

export const UPDATE_MAGIC_NOTE = gql`
	mutation updateMagicNoteCritic(
		$criticId: ID!
		$active: Boolean!
		$name: String!
		$orderRank: Int!
		$storyTextPrompt: String
		$sceneTextPrompt: String
		$beatSheetPrompt: String
		$scriptTextPrompt: String
	) {
		updateMagicNoteCritic(
			criticId: $criticId
			active: $active
			name: $name
			orderRank: $orderRank
			storyTextPrompt: $storyTextPrompt
			sceneTextPrompt: $sceneTextPrompt
			beatSheetPrompt: $beatSheetPrompt
			scriptTextPrompt: $scriptTextPrompt
		) {
			magicNoteCritic {
				id
				userEmail
				active
				name
				orderRank
				storyTextPrompt
				sceneTextPrompt
				beatSheetPrompt
				scriptTextPrompt
				createdAt
				updatedAt
			}
		}
	}
`

export const DELETE_MAGIC_NOTE = gql`
	mutation DeleteMagicNote($criticId: ID!) {
		deleteMagicNoteCritic(criticId: $criticId) {
			success
		}
	}
`
export const PLATFORM_STATISTICS = gql`
  query PlatformStatistics($startDate: String, $endDate: String) {
    platformStatistics(startDate: $startDate, endDate: $endDate) {
      project
      storyText
      sceneText
      beatSheet
      scriptText
      characterProfile
      locationProfile
      suggestedStoryTitle
    }
  }
`

export const PLATFORM_SETTINGS = gql`
	query {
	  listPlatformSettings {
	    id
	    key
	    value
	    createdAt
	    modifiedAt
	  }
	}
`

export const GET_PLATFORM_SETTING = gql`
	query PlatformSetting($key: String){
	  platformSetting(key: $key) {
	    id
	    key
	    value
	    createdAt
	    modifiedAt
	  }
	}
`

export const UPDATE_PLATFORM_SETTING = gql`
	mutation UpdatePlatformSetting($key: String!, $value: String!) {
	  updatePlatformSetting(
	  key: $key,
	  value: $value
	) {
	    success
	  }
	}
`
;
