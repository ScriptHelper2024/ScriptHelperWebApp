export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  DateTime: any;
  DynamicValue: any;
  GenericScalar: any;
  JSONString: any;
  UUID: any;
};

export type AgentTask = {
  __typename: 'AgentTask';
  agentId?: Maybe<Scalars['String']>;
  agentResults?: Maybe<Scalars['String']>;
  createdAt?: Maybe<Scalars['DateTime']>;
  documentId?: Maybe<Scalars['String']>;
  documentType?: Maybe<Scalars['String']>;
  errors?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  inputTokensUsed?: Maybe<Scalars['Int']>;
  llmModel: Scalars['String'];
  maxInputTokens?: Maybe<Scalars['Int']>;
  maxOutputTokens?: Maybe<Scalars['Int']>;
  metadata?: Maybe<Scalars['GenericScalar']>;
  outputTokensUsed?: Maybe<Scalars['Int']>;
  processTime?: Maybe<Scalars['Int']>;
  processingAt?: Maybe<Scalars['DateTime']>;
  projectId?: Maybe<Scalars['String']>;
  promptText?: Maybe<Scalars['String']>;
  status: Scalars['String'];
  statusMessage?: Maybe<Scalars['String']>;
  systemRole?: Maybe<Scalars['String']>;
  temperature?: Maybe<Scalars['Float']>;
  updatedAt?: Maybe<Scalars['DateTime']>;
};

export type AgentTasksList = {
  __typename: 'AgentTasksList';
  agentTasks?: Maybe<Array<AgentTask>>;
  pages: Scalars['Int'];
  statistics: AgentTasksStatistics;
};

export type AgentTasksStatistics = {
  __typename: 'AgentTasksStatistics';
  statusCounts: Scalars['String'];
  total: Scalars['Int'];
};

export type AllAuthorStyles = {
  __typename: 'AllAuthorStyles';
  authorStyles: Array<AuthorStyle>;
  pages: Scalars['Int'];
  statistics: AllAuthorStylesStatistics;
};

export type AllAuthorStylesStatistics = {
  __typename: 'AllAuthorStylesStatistics';
  totalArchivedCount: Scalars['Int'];
  totalCount: Scalars['Int'];
  totalGlobalCount: Scalars['Int'];
  totalNonArchivedCount: Scalars['Int'];
  totalUserCreatedCount: Scalars['Int'];
};

export type AllPromptTemplates = {
  __typename: 'AllPromptTemplates';
  pages: Scalars['Int'];
  promptTemplates: Array<PromptTemplate>;
  statistics: PromptTemplateStatistics;
};

export type AllScriptDialogFlavorStatistics = {
  __typename: 'AllScriptDialogFlavorStatistics';
  totalArchivedCount: Scalars['Int'];
  totalCount: Scalars['Int'];
  totalGlobalCount: Scalars['Int'];
  totalNonArchivedCount: Scalars['Int'];
  totalUserCreatedCount: Scalars['Int'];
};

export type AllScriptDialogFlavors = {
  __typename: 'AllScriptDialogFlavors';
  pages: Scalars['Int'];
  scriptDialogFlavors: Array<ScriptDialogFlavor>;
  statistics: AllScriptDialogFlavorStatistics;
};

export type AllStyleGuidelines = {
  __typename: 'AllStyleGuidelines';
  pages: Scalars['Int'];
  statistics: AllStyleGuidelinesStatistics;
  styleGuidelines: Array<StyleGuideline>;
};

export type AllStyleGuidelinesStatistics = {
  __typename: 'AllStyleGuidelinesStatistics';
  totalArchivedCount: Scalars['Int'];
  totalCount: Scalars['Int'];
  totalGlobalCount: Scalars['Int'];
  totalNonArchivedCount: Scalars['Int'];
  totalUserCreatedCount: Scalars['Int'];
};

export type ApplySuggestion = {
  __typename: 'ApplySuggestion';
  success?: Maybe<Scalars['Boolean']>;
};

export type ArchiveProject = {
  __typename: 'ArchiveProject';
  success?: Maybe<Scalars['Boolean']>;
};

/** AuthorStyle GraphQL Object  */
export type AuthorStyle = {
  __typename: 'AuthorStyle';
  archived: Scalars['Boolean'];
  createdAt?: Maybe<Scalars['DateTime']>;
  creatorEmail: Scalars['String'];
  id: Scalars['ID'];
  isGlobal: Scalars['Boolean'];
  modifiedAt?: Maybe<Scalars['DateTime']>;
  name: Scalars['String'];
  promptText?: Maybe<Scalars['String']>;
  userId: Scalars['ID'];
};

export type BeatSheet = {
  __typename: 'BeatSheet';
  characterCount?: Maybe<Scalars['Int']>;
  createdAt?: Maybe<Scalars['DateTime']>;
  createdBy?: Maybe<Scalars['ID']>;
  id: Scalars['ID'];
  llmModel?: Maybe<Scalars['String']>;
  sceneKey: Scalars['ID'];
  sceneTextId?: Maybe<Scalars['ID']>;
  sourceVersionNumber?: Maybe<Scalars['Int']>;
  textContent?: Maybe<Scalars['String']>;
  textNotes?: Maybe<Scalars['String']>;
  versionLabel?: Maybe<Scalars['String']>;
  versionNumber: Scalars['Int'];
  versionType: Scalars['String'];
};

export type CharacterProfile = {
  __typename: 'CharacterProfile';
  characterCount?: Maybe<Scalars['Int']>;
  characterKey: Scalars['String'];
  characterOrder?: Maybe<Scalars['Int']>;
  createdAt?: Maybe<Scalars['DateTime']>;
  createdBy?: Maybe<Scalars['ID']>;
  id: Scalars['ID'];
  llmModel?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  projectId: Scalars['ID'];
  sourceVersionNumber?: Maybe<Scalars['Int']>;
  textContent?: Maybe<Scalars['String']>;
  textNotes?: Maybe<Scalars['String']>;
  textSeed?: Maybe<Scalars['String']>;
  versionLabel?: Maybe<Scalars['String']>;
  versionNumber: Scalars['Int'];
  versionType: Scalars['String'];
};

export type CloneProject = {
  __typename: 'CloneProject';
  success?: Maybe<Scalars['Boolean']>;
};

export type CollateProject = {
  __typename: 'CollateProject';
  text: Scalars['String'];
};

export type CreateCharacterProfile = {
  __typename: 'CreateCharacterProfile';
  characterProfile?: Maybe<CharacterProfile>;
};

export type CreateLocationProfile = {
  __typename: 'CreateLocationProfile';
  locationProfile?: Maybe<LocationProfile>;
};

export type CreateMagicNoteCritic = {
  __typename: 'CreateMagicNoteCritic';
  magicNoteCritic?: Maybe<MagicNoteCritic>;
};

export type CreateProject = {
  __typename: 'CreateProject';
  project?: Maybe<Project>;
};

export type CreateSceneText = {
  __typename: 'CreateSceneText';
  sceneText?: Maybe<SceneText>;
};

export type CreateSuggestion = {
  __typename: 'CreateSuggestion';
  success?: Maybe<Scalars['Boolean']>;
  suggestion?: Maybe<SuggestedStoryTitle>;
};

export type DefaultLlmOptions = {
  __typename: 'DefaultLlmOptions';
  defaultLlmOptions?: Maybe<Scalars['JSONString']>;
};

export type DeleteAgentTask = {
  __typename: 'DeleteAgentTask';
  success: Scalars['Boolean'];
};

export type DeleteAllSuggestions = {
  __typename: 'DeleteAllSuggestions';
  success?: Maybe<Scalars['Boolean']>;
};

export type DeleteCharacterByKey = {
  __typename: 'DeleteCharacterByKey';
  success?: Maybe<Scalars['Boolean']>;
};

export type DeleteLocationByKey = {
  __typename: 'DeleteLocationByKey';
  success?: Maybe<Scalars['Boolean']>;
};

export type DeleteMagicNoteCritic = {
  __typename: 'DeleteMagicNoteCritic';
  success?: Maybe<Scalars['Boolean']>;
};

export type DeleteSceneByKey = {
  __typename: 'DeleteSceneByKey';
  success?: Maybe<Scalars['Boolean']>;
};

export type DeleteSuggestion = {
  __typename: 'DeleteSuggestion';
  success?: Maybe<Scalars['Boolean']>;
};

export type FinalizeSocialLoginMutation = {
  __typename: 'FinalizeSocialLoginMutation';
  accessToken?: Maybe<Scalars['String']>;
};

export type GenerateBeatSheetFromScene = {
  __typename: 'GenerateBeatSheetFromScene';
  agentTaskId?: Maybe<Scalars['ID']>;
};

export type GenerateBeatSheetWithNotes = {
  __typename: 'GenerateBeatSheetWithNotes';
  agentTaskId?: Maybe<Scalars['ID']>;
};

export type GenerateCharacterFromSeed = {
  __typename: 'GenerateCharacterFromSeed';
  agentTaskId?: Maybe<Scalars['ID']>;
};

export type GenerateCharacterWithNotes = {
  __typename: 'GenerateCharacterWithNotes';
  agentTaskId?: Maybe<Scalars['ID']>;
};

export type GenerateExpansiveNotes = {
  __typename: 'GenerateExpansiveNotes';
  agentTaskId?: Maybe<Scalars['String']>;
};

export type GenerateLocationFromSeed = {
  __typename: 'GenerateLocationFromSeed';
  agentTaskId?: Maybe<Scalars['ID']>;
};

export type GenerateLocationWithNotes = {
  __typename: 'GenerateLocationWithNotes';
  agentTaskId?: Maybe<Scalars['ID']>;
};

export type GenerateMagicNotes = {
  __typename: 'GenerateMagicNotes';
  agentTaskId?: Maybe<Scalars['String']>;
};

export type GenerateMakeScenes = {
  __typename: 'GenerateMakeScenes';
  agentTaskId?: Maybe<Scalars['ID']>;
};

export type GenerateSceneFromSeed = {
  __typename: 'GenerateSceneFromSeed';
  agentTaskId?: Maybe<Scalars['ID']>;
};

export type GenerateSceneWithNotes = {
  __typename: 'GenerateSceneWithNotes';
  agentTaskId?: Maybe<Scalars['ID']>;
};

export type GenerateScriptAndBeatSheet = {
  __typename: 'GenerateScriptAndBeatSheet';
  agentTaskId?: Maybe<Scalars['ID']>;
};

export type GenerateScriptTextFromScene = {
  __typename: 'GenerateScriptTextFromScene';
  agentTaskId?: Maybe<Scalars['ID']>;
};

export type GenerateScriptTextWithNotes = {
  __typename: 'GenerateScriptTextWithNotes';
  agentTaskId?: Maybe<Scalars['ID']>;
};

export type GenerateStoryFromSeed = {
  __typename: 'GenerateStoryFromSeed';
  agentTaskId?: Maybe<Scalars['ID']>;
};

export type GenerateStoryWithNotes = {
  __typename: 'GenerateStoryWithNotes';
  agentTaskId?: Maybe<Scalars['ID']>;
};

export type GenerateSuggestion = {
  __typename: 'GenerateSuggestion';
  agentTaskId?: Maybe<Scalars['ID']>;
};

/**
 * This is the HealthCheck GraphQL type.
 *
 * The HealthCheck type can be queried to check the status of the server.
 * This is useful for monitoring and ensuring that the server is up and running.
 *
 * Fields:
 * - status (String): The current status of the server. By default, it is set to "OK".
 *   If the server is running without any issues, the "OK" status is returned.
 */
export type HealthCheck = {
  __typename: 'HealthCheck';
  status?: Maybe<Scalars['String']>;
};

export type LocationProfile = {
  __typename: 'LocationProfile';
  createdAt?: Maybe<Scalars['DateTime']>;
  createdBy?: Maybe<Scalars['ID']>;
  id: Scalars['ID'];
  llmModel?: Maybe<Scalars['String']>;
  locationCount?: Maybe<Scalars['Int']>;
  locationKey: Scalars['String'];
  locationOrder?: Maybe<Scalars['Int']>;
  name: Scalars['String'];
  projectId: Scalars['ID'];
  sourceVersionNumber?: Maybe<Scalars['Int']>;
  textContent?: Maybe<Scalars['String']>;
  textNotes?: Maybe<Scalars['String']>;
  textSeed?: Maybe<Scalars['String']>;
  versionLabel?: Maybe<Scalars['String']>;
  versionNumber: Scalars['Int'];
  versionType: Scalars['String'];
};

export type LoginMutation = {
  __typename: 'LoginMutation';
  accessToken?: Maybe<Scalars['String']>;
};

export type LogoutMutation = {
  __typename: 'LogoutMutation';
  success?: Maybe<Scalars['Boolean']>;
};

export type MagicNoteCritic = {
  __typename: 'MagicNoteCritic';
  active: Scalars['Boolean'];
  beatSheetPrompt?: Maybe<Scalars['String']>;
  createdAt?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  name: Scalars['String'];
  orderRank: Scalars['Int'];
  sceneTextPrompt?: Maybe<Scalars['String']>;
  scriptTextPrompt?: Maybe<Scalars['String']>;
  storyTextPrompt?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['String']>;
  userEmail: Scalars['ID'];
  userId: Scalars['ID'];
};

export type MagicNoteCriticsStatistics = {
  __typename: 'MagicNoteCriticsStatistics';
  activeCount: Scalars['Int'];
  inactiveCount: Scalars['Int'];
  total: Scalars['Int'];
};

export type MagicNotesCriticsPagedWithStatistics = {
  __typename: 'MagicNotesCriticsPagedWithStatistics';
  magicNoteCritics: Array<MagicNoteCritic>;
  pages: Scalars['Int'];
  statistics: MagicNoteCriticsStatistics;
};

export type Mutations = {
  __typename: 'Mutations';
  applyTitleSuggestion?: Maybe<ApplySuggestion>;
  archiveProject?: Maybe<ArchiveProject>;
  cloneProject?: Maybe<CloneProject>;
  createCharacterProfile?: Maybe<CreateCharacterProfile>;
  createLocationProfile?: Maybe<CreateLocationProfile>;
  createMagicNoteCritic?: Maybe<CreateMagicNoteCritic>;
  createProject?: Maybe<CreateProject>;
  createSceneText?: Maybe<CreateSceneText>;
  createTitleSuggestion?: Maybe<CreateSuggestion>;
  deleteAgentTask?: Maybe<DeleteAgentTask>;
  deleteAllTitleSuggestions?: Maybe<DeleteAllSuggestions>;
  /** DeleteAuthorStyle Mutation to delete an AuthorStyle */
  deleteAuthorStyle?: Maybe<Scalars['Boolean']>;
  deleteCharacterByKey?: Maybe<DeleteCharacterByKey>;
  deleteLocationByKey?: Maybe<DeleteLocationByKey>;
  deleteMagicNoteCritic?: Maybe<DeleteMagicNoteCritic>;
  /** DeletePromptTemplate Mutation to delete an PromptTemplate */
  deletePromptTemplate?: Maybe<Scalars['Boolean']>;
  deleteSceneByKey?: Maybe<DeleteSceneByKey>;
  /** DeleteScriptDialogFlavor Mutation to delete an ScriptDialogFlavor */
  deleteScriptDialogFlavor?: Maybe<Scalars['Boolean']>;
  /** DeleteStyleGuideline Mutation to delete an StyleGuideline */
  deleteStyleGuideline?: Maybe<Scalars['Boolean']>;
  deleteTitleSuggestion?: Maybe<DeleteSuggestion>;
  /** DeleteUser Mutation to delete a User  */
  deleteUser?: Maybe<Scalars['Boolean']>;
  finalizeSocialLogin?: Maybe<FinalizeSocialLoginMutation>;
  generateBeatSheetFromScene?: Maybe<GenerateBeatSheetFromScene>;
  generateBeatSheetWithNotes?: Maybe<GenerateBeatSheetWithNotes>;
  generateCharacterFromSeed?: Maybe<GenerateCharacterFromSeed>;
  generateCharacterWithNotes?: Maybe<GenerateCharacterWithNotes>;
  generateExpansiveNotes?: Maybe<GenerateExpansiveNotes>;
  generateLocationFromSeed?: Maybe<GenerateLocationFromSeed>;
  generateLocationWithNotes?: Maybe<GenerateLocationWithNotes>;
  generateMagicNotes?: Maybe<GenerateMagicNotes>;
  generateMakeScenes?: Maybe<GenerateMakeScenes>;
  generateSceneFromSeed?: Maybe<GenerateSceneFromSeed>;
  generateSceneWithNotes?: Maybe<GenerateSceneWithNotes>;
  generateScriptAndBeatSheet?: Maybe<GenerateScriptAndBeatSheet>;
  generateScriptTextFromScene?: Maybe<GenerateScriptTextFromScene>;
  generateScriptTextWithNotes?: Maybe<GenerateScriptTextWithNotes>;
  generateStoryFromSeed?: Maybe<GenerateStoryFromSeed>;
  generateStoryWithNotes?: Maybe<GenerateStoryWithNotes>;
  generateTitleSuggestion?: Maybe<GenerateSuggestion>;
  login?: Maybe<LoginMutation>;
  logout?: Maybe<LogoutMutation>;
  passwordReset?: Maybe<PasswordResetMutation>;
  passwordResetRequest?: Maybe<PasswordResetRequestMutation>;
  rebaseBeatSheet?: Maybe<RebaseBeatSheet>;
  rebaseCharacterProfile?: Maybe<RebaseCharacterProfile>;
  rebaseLocationProfile?: Maybe<RebaseLocationProfile>;
  rebaseSceneText?: Maybe<RebaseSceneText>;
  rebaseScriptText?: Maybe<RebaseScriptText>;
  rebaseStoryText?: Maybe<RebaseStoryText>;
  /** RegisterAuthorStyle Mutation to create a new AuthorStyle */
  registerAuthorStyle?: Maybe<RegisterAuthorStyle>;
  /** RegisterPromptTemplate Mutation to create a new PromptTemplate */
  registerPromptTemplate?: Maybe<RegisterPromptTemplate>;
  /** RegisterScriptDialogFlavor Mutation to create a new ScriptDialogFlavor */
  registerScriptDialogFlavor?: Maybe<RegisterScriptDialogFlavor>;
  /** RegisterStyleGuideline Mutation to create a new StyleGuideline */
  registerStyleGuideline?: Maybe<RegisterStyleGuideline>;
  /** RegisterUser Mutation to create a new User  */
  registerUser?: Maybe<RegisterUser>;
  reorderCharacter?: Maybe<ReorderCharacter>;
  reorderLocation?: Maybe<ReorderLocation>;
  reorderScene?: Maybe<ReorderScene>;
  resetAgentTask?: Maybe<ResetAgentTask>;
  restoreProject?: Maybe<RestoreProject>;
  sendEmailVerification?: Maybe<SendEmailVerificationMutation>;
  socialLogin?: Maybe<SocialLoginMutation>;
  updateAgentTask?: Maybe<UpdateAgentTask>;
  /** UpdateAuthorStyle Mutation to update an Author Style's name or prompt text */
  updateAuthorStyle?: Maybe<UpdateAuthorStyle>;
  updateBeatSheet?: Maybe<UpdateBeatSheet>;
  updateBeatSheetVersionLabel?: Maybe<UpdateBeatSheetVersionLabel>;
  updateCharacterProfile?: Maybe<UpdateCharacterProfile>;
  updateCharacterVersionLabel?: Maybe<UpdateCharacterVersionLabel>;
  updateLocationProfile?: Maybe<UpdateLocationProfile>;
  updateLocationVersionLabel?: Maybe<UpdateLocationVersionLabel>;
  updateMagicNoteCritic?: Maybe<UpdateMagicNoteCritic>;
  /** UpdateMe Mutation to update the currently logged in User's account settings  */
  updateMe?: Maybe<UpdateMe>;
  /** UpdateMyUserPreference Mutation to update the currently logged in User's preference settings  */
  updateMyUserPreference?: Maybe<UpdateMyUserPreference>;
  /** UpdatePlatformSetting Mutation to update a platform setting's value. */
  updatePlatformSetting?: Maybe<UpdatePlatformSetting>;
  updateProject?: Maybe<UpdateProject>;
  /** UpdatePromptTemplate Mutation to update an Prompt Template's name or prompt text */
  updatePromptTemplate?: Maybe<UpdatePromptTemplate>;
  updateSceneText?: Maybe<UpdateSceneText>;
  updateSceneVersionLabel?: Maybe<UpdateSceneVersionLabel>;
  /** UpdateScriptDialogFlavor Mutation to update an Script Dialog Flavor's name or prompt text */
  updateScriptDialogFlavor?: Maybe<UpdateScriptDialogFlavor>;
  updateScriptText?: Maybe<UpdateScriptText>;
  updateScriptTextVersionLabel?: Maybe<UpdateScriptTextVersionLabel>;
  updateStoryText?: Maybe<UpdateStoryText>;
  updateStoryVersionLabel?: Maybe<UpdateStoryVersionLabel>;
  /** UpdateStyleGuideline Mutation to update an Style Guideline's name or prompt text */
  updateStyleGuideline?: Maybe<UpdateStyleGuideline>;
  /** UpdateUser Mutation to update a User's email or password  */
  updateUser?: Maybe<UpdateUser>;
  /** UpdateUserPreference Mutation to update a User's preference settings  */
  updateUserPreference?: Maybe<UpdateUserPreference>;
  verifyEmail?: Maybe<VerifyEmailMutation>;
};


export type MutationsApplyTitleSuggestionArgs = {
  projectId: Scalars['ID'];
  suggestionId: Scalars['ID'];
};


export type MutationsArchiveProjectArgs = {
  projectId: Scalars['ID'];
};


export type MutationsCloneProjectArgs = {
  projectId: Scalars['ID'];
};


export type MutationsCreateCharacterProfileArgs = {
  characterOrderAfter?: InputMaybe<Scalars['Int']>;
  name: Scalars['String'];
  projectId: Scalars['ID'];
  textSeed?: InputMaybe<Scalars['String']>;
};


export type MutationsCreateLocationProfileArgs = {
  locationOrderAfter?: InputMaybe<Scalars['Int']>;
  name: Scalars['String'];
  projectId: Scalars['ID'];
  textSeed?: InputMaybe<Scalars['String']>;
};


export type MutationsCreateMagicNoteCriticArgs = {
  active?: InputMaybe<Scalars['Boolean']>;
  beatSheetPrompt?: InputMaybe<Scalars['String']>;
  name: Scalars['String'];
  orderRank?: InputMaybe<Scalars['Int']>;
  sceneTextPrompt?: InputMaybe<Scalars['String']>;
  scriptTextPrompt?: InputMaybe<Scalars['String']>;
  storyTextPrompt?: InputMaybe<Scalars['String']>;
};


export type MutationsCreateProjectArgs = {
  metadata?: InputMaybe<ProjectMetadataInput>;
  textSeed?: InputMaybe<Scalars['String']>;
  title: Scalars['String'];
};


export type MutationsCreateSceneTextArgs = {
  projectId: Scalars['ID'];
  sceneOrderAfter?: InputMaybe<Scalars['Int']>;
  textSeed?: InputMaybe<Scalars['String']>;
  title: Scalars['String'];
};


export type MutationsCreateTitleSuggestionArgs = {
  projectId: Scalars['ID'];
  title: Scalars['String'];
};


export type MutationsDeleteAgentTaskArgs = {
  id: Scalars['ID'];
};


export type MutationsDeleteAllTitleSuggestionsArgs = {
  projectId: Scalars['ID'];
};


export type MutationsDeleteAuthorStyleArgs = {
  id: Scalars['ID'];
};


export type MutationsDeleteCharacterByKeyArgs = {
  characterKey: Scalars['String'];
  projectId: Scalars['ID'];
};


export type MutationsDeleteLocationByKeyArgs = {
  locationKey: Scalars['String'];
  projectId: Scalars['ID'];
};


export type MutationsDeleteMagicNoteCriticArgs = {
  criticId: Scalars['ID'];
};


export type MutationsDeletePromptTemplateArgs = {
  id: Scalars['ID'];
};


export type MutationsDeleteSceneByKeyArgs = {
  projectId: Scalars['ID'];
  sceneKey: Scalars['String'];
};


export type MutationsDeleteScriptDialogFlavorArgs = {
  id: Scalars['ID'];
};


export type MutationsDeleteStyleGuidelineArgs = {
  id: Scalars['ID'];
};


export type MutationsDeleteTitleSuggestionArgs = {
  projectId: Scalars['ID'];
  suggestionId: Scalars['ID'];
};


export type MutationsDeleteUserArgs = {
  id: Scalars['ID'];
};


export type MutationsFinalizeSocialLoginArgs = {
  code: Scalars['String'];
  provider: Scalars['String'];
};


export type MutationsGenerateBeatSheetFromSceneArgs = {
  authorStyleId?: InputMaybe<Scalars['ID']>;
  projectId: Scalars['ID'];
  sceneKey: Scalars['ID'];
  sceneTextId: Scalars['ID'];
  screenplayFormat?: InputMaybe<Scalars['Boolean']>;
  scriptDialogFlavorId?: InputMaybe<Scalars['ID']>;
  styleGuidelineId?: InputMaybe<Scalars['ID']>;
  textId: Scalars['ID'];
};


export type MutationsGenerateBeatSheetWithNotesArgs = {
  authorStyleId?: InputMaybe<Scalars['ID']>;
  projectId: Scalars['ID'];
  sceneKey: Scalars['ID'];
  screenplayFormat?: InputMaybe<Scalars['Boolean']>;
  scriptDialogFlavorId?: InputMaybe<Scalars['ID']>;
  selectTextEnd?: InputMaybe<Scalars['Int']>;
  selectTextStart?: InputMaybe<Scalars['Int']>;
  styleGuidelineId?: InputMaybe<Scalars['ID']>;
  textId: Scalars['ID'];
  textNotes?: InputMaybe<Scalars['String']>;
};


export type MutationsGenerateCharacterFromSeedArgs = {
  projectId: Scalars['ID'];
  textId: Scalars['ID'];
  textSeed?: InputMaybe<Scalars['String']>;
};


export type MutationsGenerateCharacterWithNotesArgs = {
  projectId: Scalars['ID'];
  selectTextEnd?: InputMaybe<Scalars['Int']>;
  selectTextStart?: InputMaybe<Scalars['Int']>;
  textId: Scalars['ID'];
  textNotes?: InputMaybe<Scalars['String']>;
};


export type MutationsGenerateExpansiveNotesArgs = {
  documentId: Scalars['ID'];
  documentType: Scalars['String'];
  projectId: Scalars['ID'];
};


export type MutationsGenerateLocationFromSeedArgs = {
  projectId: Scalars['ID'];
  textId: Scalars['ID'];
  textSeed?: InputMaybe<Scalars['String']>;
};


export type MutationsGenerateLocationWithNotesArgs = {
  projectId: Scalars['ID'];
  selectTextEnd?: InputMaybe<Scalars['Int']>;
  selectTextStart?: InputMaybe<Scalars['Int']>;
  textId: Scalars['ID'];
  textNotes?: InputMaybe<Scalars['String']>;
};


export type MutationsGenerateMagicNotesArgs = {
  criticIds?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  documentId: Scalars['ID'];
  documentType: Scalars['String'];
  projectId: Scalars['ID'];
};


export type MutationsGenerateMakeScenesArgs = {
  projectId: Scalars['ID'];
  sceneCount?: InputMaybe<Scalars['Int']>;
  storyTextId: Scalars['ID'];
};


export type MutationsGenerateSceneFromSeedArgs = {
  projectId: Scalars['ID'];
  textId: Scalars['ID'];
  textSeed?: InputMaybe<Scalars['String']>;
};


export type MutationsGenerateSceneWithNotesArgs = {
  projectId: Scalars['ID'];
  selectTextEnd?: InputMaybe<Scalars['Int']>;
  selectTextStart?: InputMaybe<Scalars['Int']>;
  textId: Scalars['ID'];
  textNotes?: InputMaybe<Scalars['String']>;
};


export type MutationsGenerateScriptAndBeatSheetArgs = {
  authorStyleId?: InputMaybe<Scalars['ID']>;
  projectId: Scalars['ID'];
  sceneKey: Scalars['ID'];
  sceneTextId: Scalars['ID'];
  screenplayFormat?: InputMaybe<Scalars['Boolean']>;
  scriptDialogFlavorId?: InputMaybe<Scalars['ID']>;
  styleGuidelineId?: InputMaybe<Scalars['ID']>;
};


export type MutationsGenerateScriptTextFromSceneArgs = {
  authorStyleId?: InputMaybe<Scalars['ID']>;
  includeBeatSheet?: InputMaybe<Scalars['Boolean']>;
  projectId: Scalars['ID'];
  sceneKey: Scalars['ID'];
  sceneTextId: Scalars['ID'];
  screenplayFormat?: InputMaybe<Scalars['Boolean']>;
  scriptDialogFlavorId?: InputMaybe<Scalars['ID']>;
  styleGuidelineId?: InputMaybe<Scalars['ID']>;
  textId: Scalars['ID'];
};


export type MutationsGenerateScriptTextWithNotesArgs = {
  authorStyleId?: InputMaybe<Scalars['ID']>;
  includeBeatSheet?: InputMaybe<Scalars['Boolean']>;
  projectId: Scalars['ID'];
  sceneKey: Scalars['ID'];
  screenplayFormat?: InputMaybe<Scalars['Boolean']>;
  scriptDialogFlavorId?: InputMaybe<Scalars['ID']>;
  selectTextEnd?: InputMaybe<Scalars['Int']>;
  selectTextStart?: InputMaybe<Scalars['Int']>;
  styleGuidelineId?: InputMaybe<Scalars['ID']>;
  textId: Scalars['ID'];
  textNotes?: InputMaybe<Scalars['String']>;
};


export type MutationsGenerateStoryFromSeedArgs = {
  projectId: Scalars['ID'];
  textId: Scalars['ID'];
  textSeed?: InputMaybe<Scalars['String']>;
};


export type MutationsGenerateStoryWithNotesArgs = {
  projectId: Scalars['ID'];
  selectTextEnd?: InputMaybe<Scalars['Int']>;
  selectTextStart?: InputMaybe<Scalars['Int']>;
  textId: Scalars['ID'];
  textNotes?: InputMaybe<Scalars['String']>;
};


export type MutationsGenerateTitleSuggestionArgs = {
  projectId: Scalars['ID'];
  storyTextId?: InputMaybe<Scalars['ID']>;
};


export type MutationsLoginArgs = {
  email: Scalars['String'];
  password: Scalars['String'];
};


export type MutationsPasswordResetArgs = {
  email: Scalars['String'];
  newPassword: Scalars['String'];
  resetCode: Scalars['String'];
};


export type MutationsPasswordResetRequestArgs = {
  email: Scalars['String'];
};


export type MutationsRebaseBeatSheetArgs = {
  beatSheetId?: InputMaybe<Scalars['ID']>;
  projectId: Scalars['ID'];
  sceneKey: Scalars['ID'];
  versionNumber?: InputMaybe<Scalars['Int']>;
};


export type MutationsRebaseCharacterProfileArgs = {
  characterKey?: InputMaybe<Scalars['String']>;
  characterProfileId?: InputMaybe<Scalars['ID']>;
  projectId: Scalars['ID'];
  versionNumber?: InputMaybe<Scalars['Int']>;
};


export type MutationsRebaseLocationProfileArgs = {
  locationKey?: InputMaybe<Scalars['String']>;
  locationProfileId?: InputMaybe<Scalars['ID']>;
  projectId: Scalars['ID'];
  versionNumber?: InputMaybe<Scalars['Int']>;
};


export type MutationsRebaseSceneTextArgs = {
  projectId: Scalars['ID'];
  sceneKey?: InputMaybe<Scalars['String']>;
  sceneTextId?: InputMaybe<Scalars['ID']>;
  versionNumber?: InputMaybe<Scalars['Int']>;
};


export type MutationsRebaseScriptTextArgs = {
  projectId: Scalars['ID'];
  sceneKey: Scalars['ID'];
  scriptTextId?: InputMaybe<Scalars['ID']>;
  versionNumber?: InputMaybe<Scalars['Int']>;
};


export type MutationsRebaseStoryTextArgs = {
  projectId: Scalars['ID'];
  storyTextId?: InputMaybe<Scalars['ID']>;
  versionNumber?: InputMaybe<Scalars['Int']>;
};


export type MutationsRegisterAuthorStyleArgs = {
  archived?: InputMaybe<Scalars['Boolean']>;
  isGlobal?: InputMaybe<Scalars['Boolean']>;
  name: Scalars['String'];
  promptText: Scalars['String'];
};


export type MutationsRegisterPromptTemplateArgs = {
  name: Scalars['String'];
  promptText: Scalars['String'];
  referenceKey: Scalars['String'];
};


export type MutationsRegisterScriptDialogFlavorArgs = {
  archived?: InputMaybe<Scalars['Boolean']>;
  isGlobal?: InputMaybe<Scalars['Boolean']>;
  name: Scalars['String'];
  promptText: Scalars['String'];
};


export type MutationsRegisterStyleGuidelineArgs = {
  archived?: InputMaybe<Scalars['Boolean']>;
  isGlobal?: InputMaybe<Scalars['Boolean']>;
  name: Scalars['String'];
  promptText: Scalars['String'];
};


export type MutationsRegisterUserArgs = {
  email: Scalars['String'];
  firstName?: InputMaybe<Scalars['String']>;
  lastName?: InputMaybe<Scalars['String']>;
  password: Scalars['String'];
};


export type MutationsReorderCharacterArgs = {
  newCharacterOrder: Scalars['Int'];
  projectId: Scalars['ID'];
  textId: Scalars['ID'];
};


export type MutationsReorderLocationArgs = {
  newLocationOrder: Scalars['Int'];
  projectId: Scalars['ID'];
  textId: Scalars['ID'];
};


export type MutationsReorderSceneArgs = {
  newSceneOrder: Scalars['Int'];
  projectId: Scalars['ID'];
  textId: Scalars['ID'];
};


export type MutationsResetAgentTaskArgs = {
  id: Scalars['ID'];
};


export type MutationsRestoreProjectArgs = {
  projectId: Scalars['ID'];
};


export type MutationsSocialLoginArgs = {
  provider: Scalars['String'];
};


export type MutationsUpdateAgentTaskArgs = {
  agentId?: InputMaybe<Scalars['String']>;
  agentResults?: InputMaybe<Scalars['String']>;
  errors?: InputMaybe<Scalars['String']>;
  id: Scalars['ID'];
  inputTokensUsed?: InputMaybe<Scalars['Int']>;
  outputTokensUsed?: InputMaybe<Scalars['Int']>;
  processTime?: InputMaybe<Scalars['Int']>;
  status?: InputMaybe<Scalars['String']>;
  statusMessage?: InputMaybe<Scalars['String']>;
};


export type MutationsUpdateAuthorStyleArgs = {
  archived?: InputMaybe<Scalars['Boolean']>;
  id: Scalars['ID'];
  isGlobal?: InputMaybe<Scalars['Boolean']>;
  name?: InputMaybe<Scalars['String']>;
  promptText?: InputMaybe<Scalars['String']>;
};


export type MutationsUpdateBeatSheetArgs = {
  projectId: Scalars['ID'];
  sceneTextId: Scalars['ID'];
  textContent?: InputMaybe<Scalars['String']>;
  textId: Scalars['ID'];
  textNotes?: InputMaybe<Scalars['String']>;
};


export type MutationsUpdateBeatSheetVersionLabelArgs = {
  beatSheetId?: InputMaybe<Scalars['ID']>;
  projectId: Scalars['ID'];
  sceneKey: Scalars['ID'];
  versionLabel: Scalars['String'];
  versionNumber?: InputMaybe<Scalars['Int']>;
};


export type MutationsUpdateCharacterProfileArgs = {
  name?: InputMaybe<Scalars['String']>;
  projectId: Scalars['ID'];
  textContent?: InputMaybe<Scalars['String']>;
  textId: Scalars['ID'];
  textNotes?: InputMaybe<Scalars['String']>;
  textSeed?: InputMaybe<Scalars['String']>;
};


export type MutationsUpdateCharacterVersionLabelArgs = {
  characterKey?: InputMaybe<Scalars['String']>;
  characterProfileId?: InputMaybe<Scalars['ID']>;
  projectId: Scalars['ID'];
  versionLabel: Scalars['String'];
  versionNumber?: InputMaybe<Scalars['Int']>;
};


export type MutationsUpdateLocationProfileArgs = {
  name?: InputMaybe<Scalars['String']>;
  projectId: Scalars['ID'];
  textContent?: InputMaybe<Scalars['String']>;
  textId: Scalars['ID'];
  textNotes?: InputMaybe<Scalars['String']>;
  textSeed?: InputMaybe<Scalars['String']>;
};


export type MutationsUpdateLocationVersionLabelArgs = {
  locationKey?: InputMaybe<Scalars['String']>;
  locationProfileId?: InputMaybe<Scalars['ID']>;
  projectId: Scalars['ID'];
  versionLabel: Scalars['String'];
  versionNumber?: InputMaybe<Scalars['Int']>;
};


export type MutationsUpdateMagicNoteCriticArgs = {
  active?: InputMaybe<Scalars['Boolean']>;
  beatSheetPrompt?: InputMaybe<Scalars['String']>;
  criticId: Scalars['ID'];
  name?: InputMaybe<Scalars['String']>;
  orderRank?: InputMaybe<Scalars['Int']>;
  sceneTextPrompt?: InputMaybe<Scalars['String']>;
  scriptTextPrompt?: InputMaybe<Scalars['String']>;
  storyTextPrompt?: InputMaybe<Scalars['String']>;
};


export type MutationsUpdateMeArgs = {
  email?: InputMaybe<Scalars['String']>;
  firstName?: InputMaybe<Scalars['String']>;
  lastName?: InputMaybe<Scalars['String']>;
  password?: InputMaybe<Scalars['String']>;
};


export type MutationsUpdateMyUserPreferenceArgs = {
  defaultLlm?: InputMaybe<Scalars['String']>;
};


export type MutationsUpdatePlatformSettingArgs = {
  key: Scalars['String'];
  value: Scalars['String'];
};


export type MutationsUpdateProjectArgs = {
  metadata?: InputMaybe<ProjectMetadataInput>;
  projectId: Scalars['ID'];
  title?: InputMaybe<Scalars['String']>;
};


export type MutationsUpdatePromptTemplateArgs = {
  id: Scalars['ID'];
  name?: InputMaybe<Scalars['String']>;
  promptText?: InputMaybe<Scalars['String']>;
  referenceKey: Scalars['String'];
};


export type MutationsUpdateSceneTextArgs = {
  projectId: Scalars['ID'];
  textContent?: InputMaybe<Scalars['String']>;
  textId: Scalars['ID'];
  textNotes?: InputMaybe<Scalars['String']>;
  textSeed?: InputMaybe<Scalars['String']>;
  title?: InputMaybe<Scalars['String']>;
};


export type MutationsUpdateSceneVersionLabelArgs = {
  projectId: Scalars['ID'];
  sceneKey?: InputMaybe<Scalars['String']>;
  sceneTextId?: InputMaybe<Scalars['ID']>;
  versionLabel: Scalars['String'];
  versionNumber?: InputMaybe<Scalars['Int']>;
};


export type MutationsUpdateScriptDialogFlavorArgs = {
  archived?: InputMaybe<Scalars['Boolean']>;
  id: Scalars['ID'];
  isGlobal?: InputMaybe<Scalars['Boolean']>;
  name?: InputMaybe<Scalars['String']>;
  promptText?: InputMaybe<Scalars['String']>;
};


export type MutationsUpdateScriptTextArgs = {
  projectId: Scalars['ID'];
  sceneTextId: Scalars['ID'];
  textContent?: InputMaybe<Scalars['String']>;
  textId: Scalars['ID'];
  textNotes?: InputMaybe<Scalars['String']>;
};


export type MutationsUpdateScriptTextVersionLabelArgs = {
  projectId: Scalars['ID'];
  sceneKey: Scalars['ID'];
  scriptTextId?: InputMaybe<Scalars['ID']>;
  versionLabel: Scalars['String'];
  versionNumber?: InputMaybe<Scalars['Int']>;
};


export type MutationsUpdateStoryTextArgs = {
  projectId: Scalars['ID'];
  textContent?: InputMaybe<Scalars['String']>;
  textId: Scalars['ID'];
  textNotes?: InputMaybe<Scalars['String']>;
  textSeed?: InputMaybe<Scalars['String']>;
};


export type MutationsUpdateStoryVersionLabelArgs = {
  projectId: Scalars['ID'];
  storyTextId?: InputMaybe<Scalars['ID']>;
  versionLabel: Scalars['String'];
  versionNumber?: InputMaybe<Scalars['Int']>;
};


export type MutationsUpdateStyleGuidelineArgs = {
  archived?: InputMaybe<Scalars['Boolean']>;
  id: Scalars['ID'];
  isGlobal?: InputMaybe<Scalars['Boolean']>;
  name?: InputMaybe<Scalars['String']>;
  promptText?: InputMaybe<Scalars['String']>;
};


export type MutationsUpdateUserArgs = {
  email?: InputMaybe<Scalars['String']>;
  firstName?: InputMaybe<Scalars['String']>;
  id: Scalars['ID'];
  lastName?: InputMaybe<Scalars['String']>;
  password?: InputMaybe<Scalars['String']>;
};


export type MutationsUpdateUserPreferenceArgs = {
  defaultLlm?: InputMaybe<Scalars['String']>;
  id: Scalars['ID'];
};


export type MutationsVerifyEmailArgs = {
  code: Scalars['String'];
};

export type PagedAgentTasks = {
  __typename: 'PagedAgentTasks';
  agentTasks?: Maybe<Array<AgentTask>>;
  pages: Scalars['Int'];
};

export type PasswordResetMutation = {
  __typename: 'PasswordResetMutation';
  success?: Maybe<Scalars['Boolean']>;
};

export type PasswordResetRequestMutation = {
  __typename: 'PasswordResetRequestMutation';
  success?: Maybe<Scalars['Boolean']>;
};

/** PlatformSetting GraphQL Object Type for querying platform settings. */
export type PlatformSetting = {
  __typename: 'PlatformSetting';
  createdAt?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['String']>;
  key?: Maybe<Scalars['String']>;
  modifiedAt?: Maybe<Scalars['String']>;
  value?: Maybe<Scalars['DynamicValue']>;
};

/**
 * PlatformStats GraphQL Object Type
 *
 * This object type is used to query platform-wide statistics,
 * providing an overview of various statistics across the platform.
 */
export type PlatformStats = {
  __typename: 'PlatformStats';
  beatSheet?: Maybe<Scalars['Int']>;
  characterProfile?: Maybe<Scalars['Int']>;
  locationProfile?: Maybe<Scalars['Int']>;
  project?: Maybe<Scalars['Int']>;
  sceneText?: Maybe<Scalars['Int']>;
  scriptText?: Maybe<Scalars['Int']>;
  storyText?: Maybe<Scalars['Int']>;
  suggestedStoryTitle?: Maybe<Scalars['Int']>;
};

export type Project = {
  __typename: 'Project';
  archived?: Maybe<Scalars['Boolean']>;
  createdAt?: Maybe<Scalars['DateTime']>;
  id: Scalars['ID'];
  latestStoryTextId?: Maybe<Scalars['String']>;
  members?: Maybe<Scalars['GenericScalar']>;
  metadata?: Maybe<Scalars['GenericScalar']>;
  title: Scalars['String'];
  updatedAt?: Maybe<Scalars['DateTime']>;
};

export type ProjectMetadataInput = {
  ageRating?: InputMaybe<Scalars['String']>;
  applyProfileWhenGenerating?: InputMaybe<Scalars['GenericScalar']>;
  audiences?: InputMaybe<Scalars['String']>;
  budget?: InputMaybe<Scalars['String']>;
  genre?: InputMaybe<Scalars['String']>;
  guidance?: InputMaybe<Scalars['String']>;
  targetLength?: InputMaybe<Scalars['String']>;
};

/** PromptTemplate GraphQL Object  */
export type PromptTemplate = {
  __typename: 'PromptTemplate';
  assignedSettings?: Maybe<Array<Maybe<Scalars['String']>>>;
  createdAt?: Maybe<Scalars['String']>;
  creatorEmail?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['ID']>;
  modifiedAt?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  promptText?: Maybe<Scalars['String']>;
  referenceKey?: Maybe<Scalars['String']>;
  userId?: Maybe<Scalars['ID']>;
};

export type PromptTemplateStatistics = {
  __typename: 'PromptTemplateStatistics';
  totalPromptTemplatesCount: Scalars['Int'];
};

export type Query = {
  __typename: 'Query';
  agentTaskById?: Maybe<AgentTask>;
  agentTaskByIdForProject?: Maybe<AgentTask>;
  allAuthorStyles?: Maybe<AllAuthorStyles>;
  allPromptTemplates?: Maybe<AllPromptTemplates>;
  allScriptDialogFlavors?: Maybe<AllScriptDialogFlavors>;
  allStyleGuidelines?: Maybe<AllStyleGuidelines>;
  allUsers?: Maybe<UsersWithTotalPages>;
  authorStyleById?: Maybe<AuthorStyle>;
  collateProject?: Maybe<CollateProject>;
  defaultLlmOptions?: Maybe<DefaultLlmOptions>;
  getBeatSheet?: Maybe<BeatSheet>;
  getCharacterProfile?: Maybe<CharacterProfile>;
  getLocationProfile?: Maybe<LocationProfile>;
  getMagicNoteCritic?: Maybe<MagicNoteCritic>;
  getSceneText?: Maybe<SceneText>;
  getScriptText?: Maybe<ScriptText>;
  getStoryText?: Maybe<StoryText>;
  getTitleSuggestionById?: Maybe<SuggestedStoryTitle>;
  healthCheck?: Maybe<HealthCheck>;
  listAgentTasks?: Maybe<AgentTasksList>;
  listAgentTasksByProject?: Maybe<PagedAgentTasks>;
  listBeatSheetVersions?: Maybe<Array<Maybe<BeatSheet>>>;
  listCharacterVersions?: Maybe<Array<Maybe<CharacterProfile>>>;
  listLocationVersions?: Maybe<Array<Maybe<LocationProfile>>>;
  listMagicNoteCritics?: Maybe<MagicNotesCriticsPagedWithStatistics>;
  listMagicNoteCriticsByType?: Maybe<Array<Maybe<MagicNoteCritic>>>;
  listPlatformSettings?: Maybe<Array<Maybe<PlatformSetting>>>;
  listProjectCharacters?: Maybe<Array<Maybe<CharacterProfile>>>;
  listProjectLocations?: Maybe<Array<Maybe<LocationProfile>>>;
  listProjectScenes?: Maybe<Array<Maybe<SceneText>>>;
  listSceneVersions?: Maybe<Array<Maybe<SceneText>>>;
  listScriptTextVersions?: Maybe<Array<Maybe<ScriptText>>>;
  listStoryVersions?: Maybe<Array<Maybe<StoryText>>>;
  listTitleSuggestions?: Maybe<Array<Maybe<SuggestedStoryTitle>>>;
  me?: Maybe<User>;
  myUserPreference?: Maybe<UserPreference>;
  platformSetting?: Maybe<PlatformSetting>;
  platformStatistics?: Maybe<PlatformStats>;
  projectById?: Maybe<Project>;
  projects?: Maybe<Array<Maybe<Project>>>;
  promptTemplateById?: Maybe<PromptTemplate>;
  scriptDialogFlavorById?: Maybe<ScriptDialogFlavor>;
  styleGuidelineById?: Maybe<StyleGuideline>;
  userByEmail?: Maybe<User>;
  userById?: Maybe<User>;
  userPreferenceByUserId?: Maybe<UserPreference>;
};


export type QueryAgentTaskByIdArgs = {
  id: Scalars['ID'];
};


export type QueryAgentTaskByIdForProjectArgs = {
  id: Scalars['ID'];
  projectId: Scalars['String'];
};


export type QueryAllAuthorStylesArgs = {
  emailSearchTerm?: InputMaybe<Scalars['String']>;
  globalOnly?: InputMaybe<Scalars['Boolean']>;
  idSearchTerm?: InputMaybe<Scalars['String']>;
  includeArchived?: InputMaybe<Scalars['Boolean']>;
  limit?: InputMaybe<Scalars['Int']>;
  nameSearchTerm?: InputMaybe<Scalars['String']>;
  page?: InputMaybe<Scalars['Int']>;
};


export type QueryAllPromptTemplatesArgs = {
  limit?: InputMaybe<Scalars['Int']>;
  page?: InputMaybe<Scalars['Int']>;
  searchTerm?: InputMaybe<Scalars['String']>;
};


export type QueryAllScriptDialogFlavorsArgs = {
  emailSearchTerm?: InputMaybe<Scalars['String']>;
  globalOnly?: InputMaybe<Scalars['Boolean']>;
  idSearchTerm?: InputMaybe<Scalars['String']>;
  includeArchived?: InputMaybe<Scalars['Boolean']>;
  limit?: InputMaybe<Scalars['Int']>;
  nameSearchTerm?: InputMaybe<Scalars['String']>;
  page?: InputMaybe<Scalars['Int']>;
};


export type QueryAllStyleGuidelinesArgs = {
  emailSearchTerm?: InputMaybe<Scalars['String']>;
  globalOnly?: InputMaybe<Scalars['Boolean']>;
  idSearchTerm?: InputMaybe<Scalars['String']>;
  includeArchived?: InputMaybe<Scalars['Boolean']>;
  limit?: InputMaybe<Scalars['Int']>;
  nameSearchTerm?: InputMaybe<Scalars['String']>;
  page?: InputMaybe<Scalars['Int']>;
};


export type QueryAllUsersArgs = {
  email?: InputMaybe<Scalars['String']>;
  fromDate?: InputMaybe<Scalars['DateTime']>;
  limit?: InputMaybe<Scalars['Int']>;
  page?: InputMaybe<Scalars['Int']>;
  toDate?: InputMaybe<Scalars['DateTime']>;
};


export type QueryAuthorStyleByIdArgs = {
  globalOnly?: InputMaybe<Scalars['Boolean']>;
  id: Scalars['ID'];
  includeArchived?: InputMaybe<Scalars['Boolean']>;
};


export type QueryCollateProjectArgs = {
  detailed?: InputMaybe<Scalars['Boolean']>;
  includeSceneHint?: InputMaybe<Scalars['Boolean']>;
  includeSceneNumber?: InputMaybe<Scalars['Boolean']>;
  includeSceneScript?: InputMaybe<Scalars['Boolean']>;
  includeSceneText?: InputMaybe<Scalars['Boolean']>;
  includeSceneTitle?: InputMaybe<Scalars['Boolean']>;
  includeStoryText?: InputMaybe<Scalars['Boolean']>;
  includeStoryTitle?: InputMaybe<Scalars['Boolean']>;
  projectId: Scalars['ID'];
};


export type QueryGetBeatSheetArgs = {
  projectId?: InputMaybe<Scalars['ID']>;
  sceneKey: Scalars['UUID'];
  textId: Scalars['ID'];
  versionNumber?: InputMaybe<Scalars['Int']>;
};


export type QueryGetCharacterProfileArgs = {
  characterKey?: InputMaybe<Scalars['String']>;
  projectId: Scalars['ID'];
  textId?: InputMaybe<Scalars['ID']>;
  versionNumber?: InputMaybe<Scalars['Int']>;
};


export type QueryGetLocationProfileArgs = {
  locationKey?: InputMaybe<Scalars['String']>;
  projectId: Scalars['ID'];
  textId?: InputMaybe<Scalars['ID']>;
  versionNumber?: InputMaybe<Scalars['Int']>;
};


export type QueryGetMagicNoteCriticArgs = {
  criticId: Scalars['ID'];
};


export type QueryGetSceneTextArgs = {
  projectId: Scalars['ID'];
  sceneKey?: InputMaybe<Scalars['String']>;
  textId?: InputMaybe<Scalars['ID']>;
  versionNumber?: InputMaybe<Scalars['Int']>;
};


export type QueryGetScriptTextArgs = {
  formatted?: InputMaybe<Scalars['Boolean']>;
  projectId: Scalars['ID'];
  sceneKey?: InputMaybe<Scalars['UUID']>;
  textId?: InputMaybe<Scalars['ID']>;
  versionNumber?: InputMaybe<Scalars['Int']>;
};


export type QueryGetStoryTextArgs = {
  projectId?: InputMaybe<Scalars['ID']>;
  textId?: InputMaybe<Scalars['ID']>;
  versionNumber?: InputMaybe<Scalars['Int']>;
};


export type QueryGetTitleSuggestionByIdArgs = {
  projectId: Scalars['ID'];
  suggestionId: Scalars['ID'];
};


export type QueryListAgentTasksArgs = {
  documentId?: InputMaybe<Scalars['String']>;
  documentType?: InputMaybe<Scalars['String']>;
  limit?: InputMaybe<Scalars['Int']>;
  page?: InputMaybe<Scalars['Int']>;
  projectId?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<Scalars['String']>;
  status?: InputMaybe<Scalars['String']>;
};


export type QueryListAgentTasksByProjectArgs = {
  documentId?: InputMaybe<Scalars['String']>;
  documentType?: InputMaybe<Scalars['String']>;
  limit?: InputMaybe<Scalars['Int']>;
  page?: InputMaybe<Scalars['Int']>;
  projectId: Scalars['String'];
  sort?: InputMaybe<Scalars['String']>;
  status?: InputMaybe<Scalars['String']>;
};


export type QueryListBeatSheetVersionsArgs = {
  projectId: Scalars['ID'];
  sceneKey: Scalars['ID'];
};


export type QueryListCharacterVersionsArgs = {
  characterKey: Scalars['String'];
  projectId: Scalars['ID'];
};


export type QueryListLocationVersionsArgs = {
  locationKey: Scalars['String'];
  projectId: Scalars['ID'];
};


export type QueryListMagicNoteCriticsArgs = {
  activeOnly?: InputMaybe<Scalars['Boolean']>;
  limit?: InputMaybe<Scalars['Int']>;
  name?: InputMaybe<Scalars['String']>;
  page?: InputMaybe<Scalars['Int']>;
};


export type QueryListMagicNoteCriticsByTypeArgs = {
  documentType: Scalars['String'];
};


export type QueryListProjectCharactersArgs = {
  projectId: Scalars['ID'];
};


export type QueryListProjectLocationsArgs = {
  projectId: Scalars['ID'];
};


export type QueryListProjectScenesArgs = {
  projectId: Scalars['ID'];
};


export type QueryListSceneVersionsArgs = {
  projectId: Scalars['ID'];
  sceneKey: Scalars['String'];
};


export type QueryListScriptTextVersionsArgs = {
  projectId: Scalars['ID'];
  sceneKey: Scalars['ID'];
};


export type QueryListStoryVersionsArgs = {
  projectId: Scalars['ID'];
};


export type QueryListTitleSuggestionsArgs = {
  projectId: Scalars['ID'];
};


export type QueryPlatformSettingArgs = {
  key: Scalars['String'];
};


export type QueryPlatformStatisticsArgs = {
  endDate?: InputMaybe<Scalars['String']>;
  startDate?: InputMaybe<Scalars['String']>;
};


export type QueryProjectByIdArgs = {
  id: Scalars['ID'];
};


export type QueryProjectsArgs = {
  showArchived?: InputMaybe<Scalars['Boolean']>;
};


export type QueryPromptTemplateByIdArgs = {
  id: Scalars['ID'];
};


export type QueryScriptDialogFlavorByIdArgs = {
  id: Scalars['ID'];
  includeArchived?: InputMaybe<Scalars['Boolean']>;
  includeGlobal?: InputMaybe<Scalars['Boolean']>;
};


export type QueryStyleGuidelineByIdArgs = {
  id: Scalars['ID'];
  includeArchived?: InputMaybe<Scalars['Boolean']>;
  includeGlobal?: InputMaybe<Scalars['Boolean']>;
};


export type QueryUserByEmailArgs = {
  email: Scalars['String'];
};


export type QueryUserByIdArgs = {
  id: Scalars['ID'];
};


export type QueryUserPreferenceByUserIdArgs = {
  id: Scalars['ID'];
};

export type RebaseBeatSheet = {
  __typename: 'RebaseBeatSheet';
  success?: Maybe<Scalars['Boolean']>;
};

export type RebaseCharacterProfile = {
  __typename: 'RebaseCharacterProfile';
  success?: Maybe<Scalars['Boolean']>;
};

export type RebaseLocationProfile = {
  __typename: 'RebaseLocationProfile';
  success?: Maybe<Scalars['Boolean']>;
};

export type RebaseSceneText = {
  __typename: 'RebaseSceneText';
  success?: Maybe<Scalars['Boolean']>;
};

export type RebaseScriptText = {
  __typename: 'RebaseScriptText';
  success?: Maybe<Scalars['Boolean']>;
};

export type RebaseStoryText = {
  __typename: 'RebaseStoryText';
  success?: Maybe<Scalars['Boolean']>;
};

/** RegisterAuthorStyle Mutation to create a new AuthorStyle */
export type RegisterAuthorStyle = {
  __typename: 'RegisterAuthorStyle';
  authorStyle?: Maybe<AuthorStyle>;
};

/** RegisterPromptTemplate Mutation to create a new PromptTemplate */
export type RegisterPromptTemplate = {
  __typename: 'RegisterPromptTemplate';
  promptTemplate?: Maybe<PromptTemplate>;
};

/** RegisterScriptDialogFlavor Mutation to create a new ScriptDialogFlavor */
export type RegisterScriptDialogFlavor = {
  __typename: 'RegisterScriptDialogFlavor';
  scriptDialogFlavor?: Maybe<ScriptDialogFlavor>;
};

/** RegisterStyleGuideline Mutation to create a new StyleGuideline */
export type RegisterStyleGuideline = {
  __typename: 'RegisterStyleGuideline';
  styleGuideline?: Maybe<StyleGuideline>;
};

/** RegisterUser Mutation to create a new User  */
export type RegisterUser = {
  __typename: 'RegisterUser';
  accessToken?: Maybe<Scalars['String']>;
  user?: Maybe<User>;
};

export type ReorderCharacter = {
  __typename: 'ReorderCharacter';
  success?: Maybe<Scalars['Boolean']>;
};

export type ReorderLocation = {
  __typename: 'ReorderLocation';
  success?: Maybe<Scalars['Boolean']>;
};

export type ReorderScene = {
  __typename: 'ReorderScene';
  success?: Maybe<Scalars['Boolean']>;
};

export type ResetAgentTask = {
  __typename: 'ResetAgentTask';
  success: Scalars['Boolean'];
};

export type RestoreProject = {
  __typename: 'RestoreProject';
  success?: Maybe<Scalars['Boolean']>;
};

export type SceneText = {
  __typename: 'SceneText';
  characterCount?: Maybe<Scalars['Int']>;
  createdAt?: Maybe<Scalars['DateTime']>;
  createdBy?: Maybe<Scalars['ID']>;
  id: Scalars['ID'];
  latestBeatSheetId?: Maybe<Scalars['String']>;
  latestScriptTextId?: Maybe<Scalars['String']>;
  llmModel?: Maybe<Scalars['String']>;
  projectId: Scalars['ID'];
  sceneKey: Scalars['String'];
  sceneOrder?: Maybe<Scalars['Int']>;
  sourceVersionNumber?: Maybe<Scalars['Int']>;
  textContent?: Maybe<Scalars['String']>;
  textNotes?: Maybe<Scalars['String']>;
  textSeed?: Maybe<Scalars['String']>;
  title: Scalars['String'];
  versionLabel?: Maybe<Scalars['String']>;
  versionNumber: Scalars['Int'];
  versionType: Scalars['String'];
};

/** ScriptDialogFlavor GraphQL Object  */
export type ScriptDialogFlavor = {
  __typename: 'ScriptDialogFlavor';
  archived: Scalars['Boolean'];
  createdAt?: Maybe<Scalars['DateTime']>;
  creatorEmail: Scalars['String'];
  id: Scalars['ID'];
  isGlobal: Scalars['Boolean'];
  modifiedAt?: Maybe<Scalars['DateTime']>;
  name: Scalars['String'];
  promptText?: Maybe<Scalars['String']>;
  userId: Scalars['ID'];
};

export type ScriptText = {
  __typename: 'ScriptText';
  characterCount?: Maybe<Scalars['Int']>;
  createdAt?: Maybe<Scalars['DateTime']>;
  createdBy?: Maybe<Scalars['ID']>;
  id: Scalars['ID'];
  llmModel?: Maybe<Scalars['String']>;
  sceneKey: Scalars['ID'];
  sceneTextId?: Maybe<Scalars['ID']>;
  sourceVersionNumber?: Maybe<Scalars['Int']>;
  textContent?: Maybe<Scalars['String']>;
  textContentFormatted?: Maybe<Scalars['String']>;
  textNotes?: Maybe<Scalars['String']>;
  versionLabel?: Maybe<Scalars['String']>;
  versionNumber: Scalars['Int'];
  versionType: Scalars['String'];
};

export type SendEmailVerificationMutation = {
  __typename: 'SendEmailVerificationMutation';
  success?: Maybe<Scalars['Boolean']>;
};

export type SocialLoginMutation = {
  __typename: 'SocialLoginMutation';
  authorizationUrl?: Maybe<Scalars['String']>;
};

export type StoryText = {
  __typename: 'StoryText';
  characterCount?: Maybe<Scalars['Int']>;
  createdAt?: Maybe<Scalars['DateTime']>;
  createdBy?: Maybe<Scalars['ID']>;
  id: Scalars['ID'];
  llmModel?: Maybe<Scalars['String']>;
  projectId: Scalars['ID'];
  sourceVersionNumber?: Maybe<Scalars['Int']>;
  textContent?: Maybe<Scalars['String']>;
  textNotes?: Maybe<Scalars['String']>;
  textSeed?: Maybe<Scalars['String']>;
  versionLabel?: Maybe<Scalars['String']>;
  versionNumber: Scalars['Int'];
  versionType: Scalars['String'];
};

/** StyleGuideline GraphQL Object  */
export type StyleGuideline = {
  __typename: 'StyleGuideline';
  archived: Scalars['Boolean'];
  createdAt?: Maybe<Scalars['DateTime']>;
  creatorEmail: Scalars['String'];
  id: Scalars['ID'];
  isGlobal: Scalars['Boolean'];
  modifiedAt?: Maybe<Scalars['DateTime']>;
  name: Scalars['String'];
  promptText?: Maybe<Scalars['String']>;
  userId: Scalars['ID'];
};

export type SuggestedStoryTitle = {
  __typename: 'SuggestedStoryTitle';
  createdAt?: Maybe<Scalars['DateTime']>;
  createdBy?: Maybe<Scalars['ID']>;
  id: Scalars['ID'];
  projectId: Scalars['ID'];
  title: Scalars['String'];
};

export type UpdateAgentTask = {
  __typename: 'UpdateAgentTask';
  agentTask?: Maybe<AgentTask>;
};

/** UpdateAuthorStyle Mutation to update an Author Style's name or prompt text */
export type UpdateAuthorStyle = {
  __typename: 'UpdateAuthorStyle';
  authorStyle?: Maybe<AuthorStyle>;
};

export type UpdateBeatSheet = {
  __typename: 'UpdateBeatSheet';
  beatSheet?: Maybe<BeatSheet>;
};

export type UpdateBeatSheetVersionLabel = {
  __typename: 'UpdateBeatSheetVersionLabel';
  success?: Maybe<Scalars['Boolean']>;
};

export type UpdateCharacterProfile = {
  __typename: 'UpdateCharacterProfile';
  characterProfile?: Maybe<CharacterProfile>;
};

export type UpdateCharacterVersionLabel = {
  __typename: 'UpdateCharacterVersionLabel';
  success?: Maybe<Scalars['Boolean']>;
};

export type UpdateLocationProfile = {
  __typename: 'UpdateLocationProfile';
  locationProfile?: Maybe<LocationProfile>;
};

export type UpdateLocationVersionLabel = {
  __typename: 'UpdateLocationVersionLabel';
  success?: Maybe<Scalars['Boolean']>;
};

export type UpdateMagicNoteCritic = {
  __typename: 'UpdateMagicNoteCritic';
  magicNoteCritic?: Maybe<MagicNoteCritic>;
};

/** UpdateMe Mutation to update the currently logged in User's account settings  */
export type UpdateMe = {
  __typename: 'UpdateMe';
  user?: Maybe<User>;
};

/** UpdateMyUserPreference Mutation to update the currently logged in User's preference settings  */
export type UpdateMyUserPreference = {
  __typename: 'UpdateMyUserPreference';
  userPreference?: Maybe<UserPreference>;
};

/** UpdatePlatformSetting Mutation to update a platform setting's value. */
export type UpdatePlatformSetting = {
  __typename: 'UpdatePlatformSetting';
  success?: Maybe<Scalars['Boolean']>;
};

export type UpdateProject = {
  __typename: 'UpdateProject';
  project?: Maybe<Project>;
};

/** UpdatePromptTemplate Mutation to update an Prompt Template's name or prompt text */
export type UpdatePromptTemplate = {
  __typename: 'UpdatePromptTemplate';
  promptTemplate?: Maybe<PromptTemplate>;
};

export type UpdateSceneText = {
  __typename: 'UpdateSceneText';
  sceneText?: Maybe<SceneText>;
};

export type UpdateSceneVersionLabel = {
  __typename: 'UpdateSceneVersionLabel';
  success?: Maybe<Scalars['Boolean']>;
};

/** UpdateScriptDialogFlavor Mutation to update an Script Dialog Flavor's name or prompt text */
export type UpdateScriptDialogFlavor = {
  __typename: 'UpdateScriptDialogFlavor';
  scriptDialogFlavor?: Maybe<ScriptDialogFlavor>;
};

export type UpdateScriptText = {
  __typename: 'UpdateScriptText';
  scriptText?: Maybe<ScriptText>;
};

export type UpdateScriptTextVersionLabel = {
  __typename: 'UpdateScriptTextVersionLabel';
  success?: Maybe<Scalars['Boolean']>;
};

export type UpdateStoryText = {
  __typename: 'UpdateStoryText';
  storyText?: Maybe<StoryText>;
};

export type UpdateStoryVersionLabel = {
  __typename: 'UpdateStoryVersionLabel';
  success?: Maybe<Scalars['Boolean']>;
};

/** UpdateStyleGuideline Mutation to update an Style Guideline's name or prompt text */
export type UpdateStyleGuideline = {
  __typename: 'UpdateStyleGuideline';
  styleGuideline?: Maybe<StyleGuideline>;
};

/** UpdateUser Mutation to update a User's email or password  */
export type UpdateUser = {
  __typename: 'UpdateUser';
  user?: Maybe<User>;
};

/** UpdateUserPreference Mutation to update a User's preference settings  */
export type UpdateUserPreference = {
  __typename: 'UpdateUserPreference';
  userPreference?: Maybe<UserPreference>;
};

/** User GraphQL Object  */
export type User = {
  __typename: 'User';
  adminLevel?: Maybe<Scalars['Int']>;
  createdAt?: Maybe<Scalars['DateTime']>;
  email: Scalars['String'];
  emailVerified?: Maybe<Scalars['Boolean']>;
  firstName?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  lastName?: Maybe<Scalars['String']>;
  modifiedAt?: Maybe<Scalars['DateTime']>;
  verifiedAt?: Maybe<Scalars['DateTime']>;
};

/** UserPreference GraphQL Object  */
export type UserPreference = {
  __typename: 'UserPreference';
  defaultLlm?: Maybe<Scalars['String']>;
};

export type UserStatistics = {
  __typename: 'UserStatistics';
  totalUsersCount: Scalars['Int'];
  verifiedUsersCount: Scalars['Int'];
};

export type UsersWithTotalPages = {
  __typename: 'UsersWithTotalPages';
  pages: Scalars['Int'];
  statistics: UserStatistics;
  users: Array<User>;
};

export type VerifyEmailMutation = {
  __typename: 'VerifyEmailMutation';
  success?: Maybe<Scalars['Boolean']>;
};
