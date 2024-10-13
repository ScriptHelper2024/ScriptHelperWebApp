from textwrap import dedent
from datetime import datetime
from dotenv import load_dotenv
from main.modules.User.UserModel import UserModel
from main.modules.User.UserService import UserService
from main.modules.Project.ProjectModel import ProjectModel
from main.modules.Project.ProjectService import ProjectService
from main.modules.PromptTemplate.PromptTemplateService import PromptTemplateService
from main.modules.StoryText.StoryTextModel import StoryTextModel
from main.modules.SceneText.SceneTextService import SceneTextService
from main.modules.SceneText.SceneTextModel import SceneTextModel
from main.modules.ScriptText.ScriptTextModel import ScriptTextModel
from main.modules.AuthorStyle.AuthorStyleService import AuthorStyleService
from main.modules.StyleGuideline.StyleGuidelineService import StyleGuidelineService
from main.modules.ScriptDialogFlavor.ScriptDialogFlavorService import ScriptDialogFlavorService
from main.modules.MagicNote.MagicNoteService import MagicNoteService
from main.config.platform import init_platform_settings
from main.modules.Admin.AdminService import AdminService
from main.modules.Admin.PlatformSettingModel import PlatformSettingModel

load_dotenv()


class SeedDatabase:
    command_name = 'seedDatabase'

    def run(self, args):
        print('Seeding database...')

        #init / sync our platform settings
        init_platform_settings()

        #create initial users
        admin = self.seedUser('admin@example.com', True)
        self.seedUser('user@example.com', False)

        # create global entries as admin
        self.createPromptTemplates(admin)
        self.createAuthorStyles(admin)
        self.createStyleGuidelines(admin)
        self.createScriptDialogFlavors(admin)
        self.createMagicNoteCritics(admin)

        print('..done')
        return

    def createScriptDialogFlavors(self, user: UserModel):
        # create a global list of script dialog flavors if they don't already exist

        flavors = [
            ['Cool and Laconic', "a cool and laconic style which is characterized by its brevity, detachment, and understated wit. The dialogue should be stripped down to essentials, with characters expressing themselves in short, direct sentences, avoiding verbosity. There's an air of effortless confidence, with words chosen for maximum impact in minimal syllables."],
            ['Emotional', "a style where characters are highly emotional, which is characterized by raw intensity, vulnerability, and often, unpredictability. The dialogue delves deep into the characters' emotional states, whether it be overwhelming grief, fiery anger, intense joy, profound love, or other strong emotional states. Exchanges are marked by an outpouring of feelings, often with fragmented sentences, exclamations, and pauses that reflect the tumult of emotions."],
            ['Romantic', "a style suitable for scenes where characters are engaged in or considering a romantic relationship. That style is characterized by its tenderness, nuance, and subtext. The dialogue often includes subtle hints of attraction, longing, or uncertainty. There's an emphasis on what's left unsaid, with pauses, lingering looks, or loaded phrases suggesting deeper feelings beneath the surface."],
            ['Comedic', "a comedic style that is characterized by its wit, playful exaggeration, and often, unexpected twists. Dialogue in the scene often uses humor devices like puns, wordplay, comedic timing, and situational irony. Characters may misunderstand one another, use literal interpretations in absurd ways, or deliver lines with a deadpan demeanor, all in the service of eliciting laughter."],
            ['Serious Discussion', "a style suitable for a serious discussion which is characterized by its directness and depth. The dialogue treats its subject as consequential, and characters express their viewpoints with a sense of gravity. Interruptions are minimal, and there's an emphasis on listening, ensuring each participant's perspective is understood."],
            ['Action Oriented', "a style suitable for action-oriented scenes which is characterized by its brevity, urgency, and immediacy. Dialogue in such scenes often gets straight to the point, with short and sharp exchanges that maintain the scene's pacing and intensity. Extraneous details are trimmed away, ensuring the dialogue drives the action forward or accentuates the stakes involved."],
            ['Bantering', "a bantering style which is characterized by its playful, teasing, and often light-hearted exchanges between characters. It's filled with quick retorts, clever comebacks, and humorous observations. The dialogue often flows rapidly, with characters playfully one-upping each other or engaging in friendly verbal sparring."],
            ['Confrontational', "a style suitable for confrontational scenes, characterized by tension, directness, and emotional weight. Dialogue in such scenes often reveals underlying conflicts, grudges, or differences in opinion. Exchanges are charged with emotion, may include accusations, defensiveness, aggression, or expressions of hurt, and there's a clear back-and-forth dynamic between the characters."]
        ]

        script_dialog_flavors = ScriptDialogFlavorService.find_all(
            include_archived = False,
            global_only = False,
            page=1,
            limit=0,
            user_context=user
        )

        # find divergence of desired flavors against existing script dialog flavors
        flavors = [flavor for flavor in flavors if not any(obj.name == flavor[0] and obj.user.id == user.id for obj in script_dialog_flavors[0])]

        # create each flavor that does not already exist
        for flavor in flavors:
            ScriptDialogFlavorService.register_script_dialog_flavor(
                name = flavor[0],
                prompt_text = flavor[1],
                archived = False,
                is_global = True,
                user_context = user)

        print('Script Dialog Flavors seeded')

        return

    def createStyleGuidelines(self, user: UserModel):

        styles = [
            ['McKee Story Style',
             '''Movie Scripts consist mostly of dialogue and decriptions.  In writing this script, please follow these rules:

dialogue:

Movie dialogue must say the maximum in the fewest possible words. Second, it must have direction. Each exchange of dialogue must turn the beats of the scene in one direction or another across the changing behaviors, without repetition.

Movie dialogue must sound like human talk, using an informal and natural vocabulary, complete with contractions, slang, and even, if necessary, profanity.

Movie dialogue should consist of short, simply constructed sentences; generally, a movement from noun to verb to object or from noun to verb to complement in that order.

Movie dialogue doesn't require complete or grammatical sentences.  We often drop the opening article or pronoun. We often speak in phrases.

Movie dialogue is generally constructed from rapid exchanges of short speeches.

In Movie dialogue rarely use long speeches.  When you do use a long speech break the dialogue with listeners' action or reaction descriptions.


Descriptions:

All description should be in the present tense.  Even in flash backs or flash forwards we are jumping to a new now.

In descriptions avoid generic nouns and verbs with adjectives and adverbs attached and seek the name of the thing: For example instead of  “The carpenter uses a big nail,” use “The carpenter hammers a spike.”

In descriptions minimize the use of inflections of the verb "to be" such as "is", "was", "are", "were", etc.

In descriptions avoid the use of similes and metaphors.

In descriptions do not use "we see" and "we hear."

Do not provide camera or editting direction such as "CUT", "FADE IN", "FADE OUT", "TO BLACK" .'''],
            ['Ironic Comedy',
             '''Language and dialogue: Keep the dialogue sharp, funny, and filled with irony. The characters should engage in rapid, witty exchanges. Employ elements of surprise and unexpected humor in the dialogue to enhance the comedic effect.

Character Interaction: Each character should distinctly contribute to the comedic tone of the scene. Showcase their unique quirks or personality traits in their reactions and interactions with each other.

Setting Details: Describe the setting in a way that contributes to the comedy. Small, unique details about the environment can add an extra layer of humor to the scene.

Pacing and Timing: The scene should move quickly, with comedy arising from the pace of the dialogue and actions. Pay attention to comedic timing when placing punchlines or humorous reactions.

Stage Directions: Stage directions should not only dictate the actions but also suggest the timing and delivery of the comedic elements. They can also highlight physical comedy or visual humor.

Be Ironic: This can come from situational irony (where actions have an effect that is opposite from what was intended), dramatic irony (where the audience knows something that the characters do not), or verbal irony (where what is said is the opposite of what is meant).

Conflict and Humor: Use conflict to drive humor in the scene. This could be a misunderstanding, a clash of personalities, or an awkward situation that the characters need to navigate.

Subversion of Expectations: Incorporate elements of surprise to create humor by subverting audience expectations. This could be a character reacting unusually to a common situation or the situation unfolding contrary to what the characters anticipate.

Character Moment: Ensure that the scene contributes to the characters' arcs in the larger story. Even comedic scenes should reveal something about the characters or move their story forward.'''],
            ['19th Century Theatrical',
             '''Language and Dialogue: The dialogue should be written in a formal, elegant, and sometimes grandiloquent manner. Characters should express themselves in complex sentences, filled with poetic metaphors, rich vocabulary, and refined witticisms.

Character Descriptions: Characters should be vividly detailed and larger-than-life with extra attention given to how chracters are dressed.

Setting Descriptions: The setting descriptions should be lush and highly detailed.

Dramatic Tension and Pacing: The narrative should be punctuated with melodramatic conflicts and revelations, typical of 19th-century theater. Pacing should vary, with moments of heightened drama and tension contrasted with quieter, more introspective scenes.

Stage Directions: Stage directions should be elaborate, indicating not only the characters' actions but also their emotional state, tone of voice, and implied motivations.''']
        ]

        style_guidelines = StyleGuidelineService.find_all(
            include_archived = False,
            global_only = False,
            page=1,
            limit=0,
            user_context=user
        )

        # find divergence of desired style guidelines against style guidelines
        styles = [style for style in styles if not any(obj.name == style[0] and obj.user.id == user.id for obj in style_guidelines[0])]

        # create each style guideline that does not already exist
        for style in styles:
            StyleGuidelineService.register_style_guideline(
                name = style[0],
                prompt_text = style[1],
                archived = False,
                is_global = True,
                user_context=user
            )

        print('Style guides seeded')

    def createAuthorStyles(self, user: UserModel):
        # create a global list of author styles if they don't already exist

        authors = ["JJ Abrams", "Judd Apatow", "James Cameron", "Coen Brothers",
                   "Francis Ford Coppola", "Nora Ephron", "Greta Gerwig", "Stanley Kubrick",
                   "Spike Lee", "Nancy Meyers", "Christopher Nolan", "Jordan Peele", "Kevin Smith",
                   "Quentin Tarantino", "Robert Towne", "Lina Wertmüller", "Billy Wilder"]

        author_styles = AuthorStyleService.find_all(
            include_archived = False,
            global_only = False,
            page=1,
            limit=0,
            user_context=user
        )

        # find divergence of desired authors against existing author styles
        authors = [name for name in authors if not any(obj.name == name and obj.user.id == user.id for obj in author_styles[0])]

        # create each author that does not already exist
        for author in authors:
            AuthorStyleService.register_author_style(
                name = author,
                prompt_text = author,
                archived = False,
                is_global = True,
                user_context = user)

        print('Author styles seeded')

    def seedUser(self, email, admin):
        user = self.getOrCreateUser(email, admin)
        print('User seeded')
        project = self.seedProject(
            user=user,
            title=user.email + " - Default Project [Database Seeder Task]",
            text_seed="Sample Project for " + email
        )
        self.seedScenes(project, user)

        return user

    # finds or creates a user by email address
    def getOrCreateUser(self, email: str, admin: bool):

        try:
            user = UserService.find_by_email(email)
        except ValueError as e:
            if str(e) != 'User not found':
                raise Exception
            try:
                UserService.register_user(email=email, password='password')
            except Exception as e:
                if not str(e).startswith('Working outside of application context.'):
                    raise e
                user = UserService.find_by_email(email)

        user.email_verified=True
        user.verified_at=datetime.now()

        # conditionally set user as admin
        if admin and user.admin_level != 1:
            user.admin_level = 1
            user.save()

        return user

    def seedProject(self, user: UserModel, title: str, text_seed):
        project_list = ProjectService.list_projects(user)

        project = next((x for x in project_list if x.title == title), None)

        if project is None:
            p = ProjectService.create_project(
                user=user,
                title=title,
                metadata=None,
                text_seed=text_seed
            )
            story_text = StoryTextModel.objects(project_id=p.id).first()
            story_text.text_content = f"[StoryText for project {p.id}]"
            story_text.save()
            project = p

        print('Project seeded')

        return project

    def seedScenes(self, project: ProjectModel, user: UserModel):
        scene_list = SceneTextModel.objects(project_id=project.id)
        for scene in scene_list:
            ScriptTextModel.objects(scene_text_id=scene.id).delete()
        scene_list.delete()

        for i in range(1, 4):
            scene = SceneTextService.create_scene_text(
                    project_id=project.id,
                    user=user,
                    title=f"Scene Text {i} - Project: {project.id}")
            scene.text_content=f"[SceneText {i} - Scene: {scene.scene_key}]"
            scene.save()
            script = ScriptTextModel.objects(scene_text_id=scene.id).first()
            script.text_content=f"[ScriptText {i} - Scene: {scene.scene_key}]"
            script.save()

        print('Scenes seeded')

    def createMagicNoteCritics(self, user: UserModel):
        #register the default magic note critic entries

        #Magic Note Critic: Movie Seed Coverage
        MagicNoteService.create_magic_note_critic(user, name="Seed Coverage", active=True, order_rank=0,
                                     story_text_prompt=dedent("""\
                                        Movie Seed Coverage: The Movie Text needs to include every event and character from the Movie Seed. IF there are elements in the Movie Seed that are missing from the Movie Text, provide a numbered list of them. If NO elements in the Movie Seed are missing from the Movie Text, simply say "Movie Seed coverage is OK." and do not provide any further notes on this topic. Please double-check that elements are actually missing before including them in the list. """),
                                     scene_text_prompt=dedent("""\
                                        Scene Seed Coverage: The Scene Narrative should encapsulate every event and character from the Scene Seed. If any elements from the Scene Seed are absent in the Scene Narrative, detail them in a numbered list. If the Scene Narrative fully captures the Scene Seed, just say: 'Scene Seed coverage is OK.' Double-check before listing any missing elements.\r\n\r\n
                                        """),
                                     beat_sheet_prompt=None,
                                     script_text_prompt=dedent("""\
                                        Coverage of Scene Text: The Scene Script needs to include every event and character from the Scene Narrative. IF there are elements in the Scene Narrative that are missing from the Scene Script, provide a numbered list of them. If NO elements in the Scene Narrative are missing from the Scene Script, simply say 'Scene Narrative coverage is OK.'\r\n\r\n
                                        """),
                                     update_existing=True
                                    )

        #Magic Note Critic: Overhall Coherence
        MagicNoteService.create_magic_note_critic(user, name="Overhall Coherence", active=True, order_rank=0,
                                     story_text_prompt=dedent("""\
                                        Coherence: When reading the Movie Text, one should never be jolted out of immersion by plot points or character behaviors that don't align with the narrative. Assess the Movie Text for any sequences that seem out of place or actions that feel inauthentic for a character. Provide suggestions, with specific examples, to smooth out these inconsistencies, ensuring the story flows seamlessly. Every event or choice should have a logical cause or motivation, even if it's revealed later.\r\n\r\n
                                        """),
                                     scene_text_prompt=None,
                                     beat_sheet_prompt=None,
                                     script_text_prompt=None,
                                     update_existing=True
                                    )

        #Magic Note Critic: Increase Intensity
        MagicNoteService.create_magic_note_critic(user, name="Increase Intensity", active=True, order_rank=0,
                                     story_text_prompt=None,
                                     scene_text_prompt=dedent("""\
                                        Intensity: The Scene, once filmed, should evoke strong emotions in its audience. Examine the action for places where the audience's emotional response can be heightened. Offer suggestions, with specific examples, for amplifying the intensity.\r\n\r\n
                                        """),
                                     beat_sheet_prompt=None,
                                     script_text_prompt=None,
                                     update_existing=True
                                    )

        #Magic Note Critic: Increase Character Interactions
        MagicNoteService.create_magic_note_critic(user, name="Increase Character Interactions", active=True, order_rank=0,
                                     story_text_prompt=None,
                                     scene_text_prompt=dedent("""\
                                        Character Interactions: The interactions between characters in the Scene Narrative should be dynamic, revealing, and surprising. Offer suggestions, with specific examples, for enriching the quantity and depth of interactions.\r\n\r\n
                                        """),
                                     beat_sheet_prompt=None,
                                     script_text_prompt=None,
                                     update_existing=True
                                    )


        #Magic Note Critic: Dramatic Arc and Impact
        MagicNoteService.create_magic_note_critic(user, name="Dramatic Arc and Impact", active=True, order_rank=0,
                                     story_text_prompt=dedent("""\
                                        Dramatic Arc: The Movie Text should have a compelling dramatic arc that guides the audience through an engaging journey. Assess whether and how well the story follows the vital phases of storytelling: exposition, rising action, climax, and resolution. Offer suggestions, with specific examples, for enhancing the dramatic tension. Large-scale revisions are as welcome as minor ones.\r\n\r\n
                                        """),
                                     scene_text_prompt=None,
                                     beat_sheet_prompt=None,
                                     script_text_prompt=None,
                                     update_existing=True
                                    )

        #Magic Note Critic: Plot Structure
        MagicNoteService.create_magic_note_critic(user, name="Plot Structure", active=True, order_rank=0,
                                     story_text_prompt=dedent("""\
                                        Plot Structure: : Each event in the Movie Text should be a cause or effect, leading to the next, building a chain of interconnected events. Significant events should proceed logically, forming a clear causal chain that's both interesting and, at times, surprising. Offer suggestions, with specific examples, for restructuring or refining the plot.\r\n\r\n
                                        """),
                                     scene_text_prompt=None,
                                     beat_sheet_prompt=None,
                                     script_text_prompt=None,
                                     update_existing=True
                                    )

        #Magic Note Critic: Plot Elaboration
        MagicNoteService.create_magic_note_critic(user, name="Plot Elaboration", active=True, order_rank=0,
                                     story_text_prompt=dedent("""\
                                        Plot Elaboration: The Movie Text should have a plot that is sufficiently elaborated to serve as the basis for a feature-length film. Estimate how many minutes the current plot would take to unfold and whether this is within the usual range for a feature film. If you believe more plot is needed, suggest some additional events, interludes, or reversals in the plot. Be imaginative while maintaining the overall dramatic arc of the original.\r\n\r\n
                                        """),
                                     scene_text_prompt=dedent("""\
                                        Plot Elaboration: The Scene Narrative should contain sufficient plot elements to allow for meaningful change, and should lead seamlessly to a natural beat or setting change. Estimate the duration the scene would take to play out on-screen. If the scene seems too brief or lacking in pivotal events, suggest additional plot elements, actions, or reversals to enrich its content.\r\n\r\n
                                        """),
                                     beat_sheet_prompt=None,
                                     script_text_prompt=None,
                                     update_existing=True
                                    )


        #Magic Note Critic: Enhance Action
        MagicNoteService.create_magic_note_critic(user, name="Enhance Action", active=True, order_rank=0,
                                     story_text_prompt=None,
                                     scene_text_prompt=dedent("""\
                                        More Action: The Scene Narrative should be driven by a sequence of meaningful actions. Propose specific examples of ways to inject more character actions or dynamic movements, ensuring they feel organic and do not disrupt the established plot.\r\n\r\n                                     """),
                                     beat_sheet_prompt=None,
                                     script_text_prompt=dedent("""\
                                        Increase Action: Assess the Scene Script for its action descriptions. These should be clear and engaging and should contribute to the pacing and excitement of the scene. Provide suggestions, with examples, to increase the amount or improve the quality of actions.\r\n\r\n
                                        """),
                                     update_existing=True
                                    )

        #Magic Note Critic: Richen Character Descriptions
        MagicNoteService.create_magic_note_critic(user, name="More Character Description", active=True, order_rank=0,
                                     story_text_prompt=dedent("""\
                                        Character Description: The characters in the Movie Text should be richly realized and described (appearance, motivations, backstory when relevant, etc). Provide suggestions, with specific examples, for improving character descriptions. Be imaginative while maintaining plot coherence and the dramatic arc.\r\n\r\n
                                        """),
                                     scene_text_prompt=dedent("""\
                                        Character Descriptions: Characters come alive through detailed descriptions. Highlight areas in the Scene Narrative where characters can be portrayed more vividly, whether through physical attributes, mannerisms, or attire. Offer suggestions, with specific examples, for making characters more memorable.\r\n\r\n
                                        """),
                                     beat_sheet_prompt=None,
                                     script_text_prompt=None,
                                     update_existing=True
                                    )

        #Magic Note Critic: Character Development/Change
        MagicNoteService.create_magic_note_critic(user, name="Increase Character Development", active=True, order_rank=0,
                                     story_text_prompt=dedent("""\
                                        Character Development: The story in the Movie Text should force its characters to make decisions that reveal their true nature, and/or that lead to lasting change. Provide suggestions, with specific examples, for how to improve character development.\r\n\r\n
                                        """),
                                     scene_text_prompt=dedent("""\
                                        Character Development: The story in the Scene Text should force its characters to make decisions that reveal their true nature, and/or that lead to lasting change. Provide suggestions, with specific examples, for how to improve character development.\r\n\r\n
                                        """),
                                     beat_sheet_prompt=None,
                                     script_text_prompt=dedent("""\
                                        Character Development: The story in the Scene Script should force its characters to make decisions, however small, that reveal their true nature and/or lead to change. Provide suggestions, with specific examples, for how to improve character development.\r\n\r\n
                                        """),
                                     update_existing=True
                                    )

        #Magic Note Critic: More Detail Location Descriptions
        MagicNoteService.create_magic_note_critic(user, name="More Location Description", active=True, order_rank=0,
                                     story_text_prompt=dedent("""\
                                        Location Description: The Movie Text should provide rich descriptions of locations. Each setting description should paint a clear visual picture while conveying a sense of atmosphere and independent reality. Assess if there are any locations in the Movie Text that could benefit from more detailed descriptions and provide suggestions, with specific examples, for improving them.\r\n\r\n
                                        """),
                                     scene_text_prompt=dedent("""\
                                        Location: The setting of the Scene Narrative should convey a sense of atmosphere and independent reality. Evaluate the current choice and depiction of setting. Offer suggestions, with specific examples, for improving the setting.\r\n\r\n
                                        """),
                                     beat_sheet_prompt=None,
                                     script_text_prompt=None,
                                     update_existing=True
                                    )

        #Magic Note Critic: Increase Dramatic Tension
        MagicNoteService.create_magic_note_critic(user, name="Increase Dramatic Tension", active=True, order_rank=0,
                                     story_text_prompt=dedent("""\
                                        Dramatic Tension: Dramatic tension keeps an audience engaged. The Movie Text should effectively build anticipation, suspense, and uncertainty in pivotal scenes. Identify moments where the stakes can be raised or where outcomes are uncertain. Offer suggestions, with specific examples, on how to introduce conflicts, obstacles, or dilemmas that amplify suspense.\r\n\r\n
                                        """),
                                     scene_text_prompt=dedent("""\
                                        Dramatic Tension: Dramatic tension keeps an audience engaged. The Scene Narrative should effectively build anticipation, suspense, and uncertainty in pivotal moments. Identify moments where the stakes can be raised or where outcomes are uncertain. Offer suggestions, with specific examples, on how to introduce conflicts, obstacles, or dilemmas that amplify suspense.\r\n\r\n
                                        """),
                                     beat_sheet_prompt=None,
                                     script_text_prompt=None,
                                     update_existing=True
                                    )

        #Magic Note Critic: Increase Interpersonal Tension
        MagicNoteService.create_magic_note_critic(user, name="Increase Interpersonal Tension", active=True, order_rank=0,
                                     story_text_prompt=dedent("""\
                                        Interpersonal Tension: The Movie Text should showcase the friction between characters resulting from differing desires, values, or histories. Pinpoint interpersonal dynamics that feel flat or harmonious and suggest ways to introduce or escalate conflicts. (These conflicts can be antagonistic, but don't need to be; they can also be subtle disagreements, unmet expectations, or miscommunications.) Detail how characters might challenge or push against each other in ways that feel organic to their   personalities and context.\r\n\r\n
                                        """),
                                     scene_text_prompt=dedent("""\
                                        The Scene Narrative should showcase the friction between characters resulting from differing desires, values, or histories. Pinpoint interpersonal dynamics that feel flat or harmonious and suggest ways to introduce or escalate conflicts. (These conflicts can be antagonistic, but don't need to be; they can also be subtle disagreements, unmet expectations, or miscommunications.) Detail how characters might challenge or push against each other in ways that feel organic to their personalities and   context.\r\n\r\n
                                        """),
                                     beat_sheet_prompt=None,
                                     script_text_prompt=None,
                                     update_existing=True
                                    )

        #Magic Note Critic: The Beginning
        MagicNoteService.create_magic_note_critic(user, name="The Beginning", active=True, order_rank=0,
                                     story_text_prompt=dedent("""\
                                        Beginning: The beginning of the Movie Text should set the tone, introduce the world and characters, and hook the audience. Reflect on whether the current beginning effectively grabs attention and sets the stage. Are the main characters introduced compellingly? Is the setting clear and evocative? Can the audience quickly understand the stakes of the story and its core concerns? Offer suggestions on how to improve the beginning. (Sometimes reshuffling events, starting in medias res, or introducing a mystery can make an impact.)\r\n\r\n
                                        """),
                                     scene_text_prompt=dedent("""\
                                        A scene's start sets its tone. Reflect on the Scene Narrative's opening: does it effectively pull the viewer in? Could it start later to avoid filler? Is it visually arresting? Offer suggestions, with specific examples, for refining the scene's introduction, ensuring it effectively establishes context and intrigue.\r\n\r\n
                                        """),
                                     beat_sheet_prompt=None,
                                     script_text_prompt=None,
                                     update_existing=True
                                    )

        #Magic Note Critic: The Ending
        MagicNoteService.create_magic_note_critic(user, name="The Ending", active=True, order_rank=0,
                                     story_text_prompt=dedent("""\
                                        Ending: The ending of the Movie Text should provide resolution, leaving the audience satisfied, moved, or contemplative. It's the culmination of all preceding events and should resonate emotionally while tying up narrative threads. Consider if the current conclusion feels earned, if it’s consistent with the story's trajectory, and if it leaves a lasting impression. Provide suggestions on how to improve the ending.\r\n\r\n
                                        """),
                                     scene_text_prompt=dedent("""\
                                        Ending: The Scene Text's ending should complete the dramatic objective of this scene while generating curiosity about the next (unless of course this is the final scene). Offer suggestions, with specific examples, for enhancing the scene's conclusion.\r\n\r\n
                                        """),
                                     beat_sheet_prompt=None,
                                     script_text_prompt=None,
                                     update_existing=True
                                    )

        #Magic Note Critic: Dialogue: Refine
        MagicNoteService.create_magic_note_critic(user, name="Dialogue: Refine", active=True, order_rank=0,
                                     story_text_prompt=None,
                                     scene_text_prompt=None,
                                     beat_sheet_prompt=None,
                                     script_text_prompt=dedent("""\
                                        Dialogue: Refine: Assess the Scene Script for the overall quality of dialogue. Every line should feel authentic and plausible, and contribute to character development or move the plot forward. Provide suggestions, with specific examples, for refining the dialogue.\r\n\r\n
                                        """),
                                     update_existing=True
                                    )

        #Magic Note Critic: Dialogue: Increase Amount
        MagicNoteService.create_magic_note_critic(user, name="Dialogue: Increase Amount", active=True, order_rank=0,
                                     story_text_prompt=None,
                                     scene_text_prompt=None,
                                     beat_sheet_prompt=None,
                                     script_text_prompt=dedent("""\
                                        Dialogue: Increase Amount: This Scene Script does not contain a sufficient amount of dialogue, and/or dialogue is summarized instead of written out in full. Provide suggestions, with specific examples (including actual lines where appropriate), for more or expanded dialogue.\r\n\r\n
                                        """),
                                     update_existing=True
                                    )

        #Magic Note Critic: Pacing and Rhythm
        MagicNoteService.create_magic_note_critic(user, name="Pacing and Rhythm", active=True, order_rank=0,
                                     story_text_prompt=None,
                                     scene_text_prompt=None,
                                     beat_sheet_prompt=None,
                                     script_text_prompt=dedent("""\
                                        Pacing and Rhythm: Each event in the Scene Script should be a cause or effect, leading to the next, building a chain of interconnected events. Offer suggestions, with specific examples, for restructuring or refining the plot to improve its pacing and rhythm.\r\n\r\n
                                        """),
                                     update_existing=True
                                    )

        #Magic Note Critic: Emotional Resonance
        MagicNoteService.create_magic_note_critic(user, name="Emotional Resonance", active=True, order_rank=0,
                                     story_text_prompt=None,
                                     scene_text_prompt=None,
                                     beat_sheet_prompt=None,
                                     script_text_prompt=dedent("""\
                                        Emotional Resonance: The Scene Script should resonate emotionally with the audience. It should force its characters to make decisions that reveal their true emotional states or lead to emotional changes. Provide suggestions, with specific examples, on how to improve emotional resonance in the script.\r\n\r\n
                                        """),
                                     update_existing=True
                                    )

        #Magic Note Critic: Increase Conflict
        MagicNoteService.create_magic_note_critic(user, name="Increase Conflict", active=True, order_rank=0,
                                     story_text_prompt=None,
                                     scene_text_prompt=None,
                                     beat_sheet_prompt=None,
                                     script_text_prompt=dedent("""\
                                        Increase Conflict: The Scene Script should effectively build anticipation, suspense, and uncertainty in pivotal scenes. Identify moments where the stakes can be raised or where outcomes are uncertain. Offer suggestions, with specific examples, on how to introduce conflicts, obstacles, or dilemmas that amplify suspense.\r\n\r\n
                                        """),
                                     update_existing=True
                                    )

        #Magic Note Critic: Setting and Atmosphere
        MagicNoteService.create_magic_note_critic(user, name="Setting and Atmosphere", active=True, order_rank=0,
                                     story_text_prompt=None,
                                     scene_text_prompt=None,
                                     beat_sheet_prompt=None,
                                     script_text_prompt=dedent("""\
                                        Setting and Atmosphere: The Scene Script should provide rich descriptions of settings and atmospheres. Each setting description should paint a clear visual picture while conveying a sense of atmosphere and independent reality. Assess if there are any locations in the Scene Script that could benefit from more detailed descriptions and provide suggestions, with specific examples, for improving them.\r\n\r\n
                                        """),
                                     update_existing=True
                                    )

        #Magic Note Critic: Increase Scene Length
        MagicNoteService.create_magic_note_critic(user, name="Increase Scene Length", active=True, order_rank=0,
                                     story_text_prompt=None,
                                     scene_text_prompt=None,
                                     beat_sheet_prompt=None,
                                     script_text_prompt=dedent("""\
                                        Increase Scene Length: This Scene Script is not sufficiently elaborated to serve its purpose in the screenplay. Suggest additional events, interludes, or reversals in the plot. Be imaginative and specific while maintaining the dramatic arc of the original.\r\n\r\n
                                        """),
                                     update_existing=True
                                    )

        #Magic Note Critic: De-Purple Prose
        MagicNoteService.create_magic_note_critic(user, name="De-Purple Prose", active=True, order_rank=0,
                                     story_text_prompt=None,
                                     scene_text_prompt=None,
                                     beat_sheet_prompt=None,
                                     script_text_prompt=dedent("""\
                                        De-Purple Prose: Examine the Scene Script for any overuse of descriptive language that doesn't serve the story, commonly referred to as 'purple prose'. Provide specific rewrites and suggested cuts to reduce purpleness while maintaining the strengths of the narrative.\r\n\r\n
                                        """),
                                     update_existing=True
                                    )

        #Magic Note Critic: Increase Vividness
        MagicNoteService.create_magic_note_critic(user, name="Increase Vividness", active=True, order_rank=0,
                                     story_text_prompt=None,
                                     scene_text_prompt=None,
                                     beat_sheet_prompt=None,
                                     script_text_prompt=dedent("""\
                                        Increase Vividness: The Scene Script should be vivid in all its aspects. Provide detailed feedback, with examples, on ways to make descriptions, actions, and dialogue more vivid and engaging.\r\n\r\n
                                        """),
                                     update_existing=True
                                    )


        print('Magic note critics seeded')

        return


    def createPromptTemplates(self, user):
        #ANGLE BRACKET PROMPT
        angle_bracket_prompt_text = dedent("""\
            In your output use first names only for the characters. For every occurrence of a character name in the output,
            enclose the character name within angle brackets <>, for example <Sally>. You must enclose all character names
            in angle brackets <>. Gods, monsters, space aliens and other beings are all considered characters if they have a
            name and therefore their names should be enclosed in angle brackets <>. When using the possessive form of a
            character name, place the apostrophe outside of the angle brackets. Example: <Sally>'s.
        """)

        PromptTemplateService.register_prompt_template(
            name="angle_bracket_prompt",
            reference_key="angle_bracket_prompt",
            prompt_text=angle_bracket_prompt_text,
            user_context=user,
            update_existing=True
        )

        #PROJECT STORY PROFILE PROMPT
        project_profile_prompt = dedent("""\
            [% if (project.metadata.genre|default('', true))|length > 0 %]
                The genre of the movie is <<project.metadata.genre>>.
            [% endif %]
            [% if (project.metadata.audiences|default('', true))|length > 0 %]
                The audience for the movie is <<project.metadata.audiences>>.
            [% endif %]
            [% if (project.metadata.age_rating|default('', true))|length > 0 %]
                The Motion Picture Association rating for the movie is <<project.metadata.age_rating>>.
            [% endif %]
            [% if (project.metadata.budget|default('', true))|length > 0 %]
                The budget for this movie is <<project.metadata.budget>>.
            [% endif %]
            [% if (project.metadata.guidance|default('', true))|length > 0 %]
                Guidance about the movie: <<project.metadata.guidance>>.
            [% endif %]
        """)
        PromptTemplateService.register_prompt_template(
            name="project_profile_prompt",
            reference_key="project_profile_prompt",
            prompt_text=project_profile_prompt,
            user_context=user,
            update_existing=True
        )

        #STORY TEXT FROM SEED: SYSTEM ROLE
        story_text_system_role_from_seed = dedent("""\
            You are a talented and creative assistant working with a screenwriter to help write a movie script. <<profile_prompt>>
            We are now working on a narrative description of the movie that will be used later to create a movie script.
            You will be provided with a "Movie Hint". Your job is to write a narrative text based on the Movie Hint but much expanded in length and detail.
            Please use your powerful creative skills to interpolate additional actions, events, descriptions, and details into the narrative description
            so that it is long enough to create a movie script that is about <<length_minutes>> minutes long.
            <<prompt_template(key="angle_bracket_prompt")>>
        """)

        system_role_template = PromptTemplateService.register_prompt_template(
            name="story_text_system_role_from_seed",
            reference_key="story_text_system_role_from_seed",
            prompt_text=story_text_system_role_from_seed,
            user_context=user,
            update_existing=True
        )

        #STORY TEXT FROM SEED: USER PROMPT
        story_text_user_prompt_from_seed = dedent("""\
            Please use the hints to write a detailed description of what the movie is about.
            The targetted length for the movie is about <<movie_length_str>>.  Be creative!
            As needed, create additional characters. Add details. Do not provide a summary or a moral at the end of narrative.
            When the action finishes, that is the end of the narrative.
            You may have to add additional events to the narrative description to make it long enough to create a movie script that is about <<movie_length_str>> long.
            Stylistically, the writing of this description should be simple, direct, and functional. Avoid florid and purple prose, and include only details that are relevant to the plot.
            <<prompt_template(key="angle_bracket_prompt")>>

            Please DO NOT include any disclaimers, e.g. "Here is the rewritten narrative:". Begin with the first sentence of the updated description.
            Here are the hints to use for writing the movie narrative description:

            <<text_seed>>
        """)

        user_prompt_template = PromptTemplateService.register_prompt_template(
            name="story_text_user_prompt_from_seed",
            reference_key="story_text_user_prompt_from_seed",
            prompt_text=story_text_user_prompt_from_seed,
            user_context=user,
            update_existing=True
        )

        #update platform settings
        AdminService.update_platform_setting('prompts.generateStoryFromSeed', {"system_role": str(system_role_template.id), "user_prompt": str(user_prompt_template.id)})

        #STORY TEXT WITH NOTES: SYSTEM ROLE
        story_text_system_role_with_notes = dedent("""\
            You are a talented assistant helping a screenwriter write a movie script. <<profile_prompt>>
            In the user prompt you will be provided with a detailed narrative description of the movie, henceforth called the original "Movie Narrative".
            You will also be provided in the user prompt with "Notes", which are instructions for rewriting the Movie Narrative.
            You will rewrite the Movie Narrative, taking into consideration the Notes. Unless instructed otherwise by the "Notes"
            you will retain all of the details from the original Movie Narrative. It is common for the rewritten version of the Movie Narrative to be longer than the original version unless specified otherwise in the Notes.
            The rewritten Movie Narrative will be used later as a prompt for writing the movie screenplay for a feature-length movie.
            <<prompt_template(key="angle_bracket_prompt")>>
            Unless directed otherwise by the Notes, you will also include all details from the Movie Seed. The Movie Seed:

            <<story_text.text_seed>>
        """)

        system_role_template = PromptTemplateService.register_prompt_template(
            name="story_text_system_role_with_notes",
            reference_key="story_text_system_role_with_notes",
            prompt_text=story_text_system_role_with_notes,
            user_context=user,
            update_existing=True
        )

        #STORY TEXT WITH NOTES: USER PROMPT
        story_text_user_prompt_with_notes = dedent("""\
            You will rewrite the Movie Narrative, taking into consideration the Notes. To the degree possible, and unless instructed otherwise by the "Notes",
            you will retain all the details from the original Movie Narrative. Do not try and restrict the length of your reponse.
            It is common for the new version of the Movie Narrative to be longer than the original version of the Movie Narrative.
            Please DO NOT include any prefacing sentence, e.g. "Here is the rewritten narrative:". Begin with the first sentence of the updated description.

            Here is the original Movie Narrative:

            <<story_text.text_content>>

            Here are the Notes to use for rewriting the Movie Narrative:

            <<text_notes>>

            Please rewrite the Movie Narrative, considering the Notes.
            <<prompt_template(key="angle_bracket_prompt")>>
        """)

        user_prompt_template = PromptTemplateService.register_prompt_template(
            name="story_text_user_prompt_with_notes",
            reference_key="story_text_user_prompt_with_notes",
            prompt_text=story_text_user_prompt_with_notes,
            user_context=user,
            update_existing=True
        )

        #update platform settings
        AdminService.update_platform_setting('prompts.generateStoryWithNotes', {"system_role": str(system_role_template.id), "user_prompt": str(user_prompt_template.id)})


        #STORY TEXT WITH NOTES (SELECTIVE): SYSTEM ROLE
        story_text_system_role_with_notes_selective = dedent("""\
            You are a talented assistant helping a screenwriter write a movie script.
            <<profile_prompt>>
            We are working on the Movie Text, which is a detailed narrative synopsis of the movie.

            Your task is to rewrite a selected part of the Movie Text.
            You will be provided in the user prompt with a selected part of the Movie Text, which we will call the "Selected Text".

            Here is the Movie Text which includes the Selected Text:

            <<story_text.text_content>>
            END MOVIE TEXT

            In the user prompt you will be provided with the Selected Text from the Movie Text.
            You will also be provided with 'Notes', which are instructions for rewriting the Selected Text.
            You will rewrite the Selected Text, taking into consideration the Notes. To the degree possible, unless instructed otherwise by the Notes,
            you will retain all the details from the original version. You will use a writting style similar to that of the Movie Text.
            <<prompt_template(key="angle_bracket_prompt")>>
        """)

        system_role_template = PromptTemplateService.register_prompt_template(
            name="story_text_system_role_with_notes_selective",
            reference_key="story_text_system_role_with_notes_selective",
            prompt_text=story_text_system_role_with_notes_selective,
            user_context=user,
            update_existing=True
        )

        #STORY TEXT WITH NOTES (SELECTIVE): USER PROMPT
        story_text_user_prompt_with_notes_selective = dedent("""\
            You will rewrite the Selected Text, taking into consideration the Notes.
            You will retain all the details from the original version of the Selected Text.
            Here is the Selected Text:

            <<selected_text>>
            END SELECTED Text

            Here are the notes to use for rewriting the Selected Text:

            <<text_notes>>
            END NOTES
            Please rewrite only the Selected Text, considering the Notes.
        """)

        user_prompt_template = PromptTemplateService.register_prompt_template(
            name="story_text_user_prompt_with_notes_selective",
            reference_key="story_text_user_prompt_with_notes_selective",
            prompt_text=story_text_user_prompt_with_notes_selective,
            user_context=user,
            update_existing=True
        )

        #update platform settings
        AdminService.update_platform_setting('prompts.generateStoryWithNotes.selective', {"system_role": str(system_role_template.id), "user_prompt": str(user_prompt_template.id)})

        #SCENE TEXT FROM SEED: SYSTEM ROLE
        scene_text_system_role_from_seed = dedent("""\
            You are a talented and creative assistant working with a screenwriter to help write a movie script.

            <<profile_prompt>>

            Your task will be to take a Scene Hint that is provided in the user prompt and to write a detailed narrative
            description of the movie scene (aka "Scene Text"). Please ensure that your Scene Text does not re-describe
            characters or events that have already been introduced or have occurred in the preceding scenes. Your scene
            should also fit logically into the timeline of the story and maintain chronological consistency with the events
            described in previous scenes. Below is the Movie Text, a synopsis of the entire movie:

            <<movie_text>>

            [% if preceding_scenes|length == 0 %]
                Here are the scenes that come prior to the scene you will be writing:

                [% for scene in preceding_scenes %]
                    Scene <<scene['scene_order']>> Title: <<scene['title']>>

                    Scene <<scene['scene_order']>> Hint: <<scene['text_seed']>>

                [% endfor %]

            [% endif %]

            [% if immediately_preceding_scene %]

                [% set scene_order = immediately_preceding_scene['scene_order'] %]
                [% set title = immediately_preceding_scene.title %]
                [% set hint = immediately_preceding_scene.text_seed %]
                [% set text = immediately_preceding_scene.text_content %]

                [% if text %]
                    Now I will give you the Scene Hint and the Scene Text for the scene immediately preceding the one for
                    which you're about to write the Scene Text:

                    Scene <<scene_order>> Title:
                    <<title>>

                    Scene <<scene_order>> Hint: <<hint>>

                    Scene <<scene_order>> Text: <<text>>
                [% else %]
                    Now I will give you the Scene Hint for the scene immediately preceding the one for which you're about
                    to write the Scene Text:

                    Scene <<scene_order>> Title: <<title>>

                    Scene <<scene_order>> Hint: <<hint>>
                [% endif %]
            [% endif %]

            [% if preceding_scenes|length > 0 %]
                You will refer to the above prior scenes to ensure chronological consistency and to avoid redundancy in
                character descriptions or events.

            [% endif %]

        """)

        system_role_template = PromptTemplateService.register_prompt_template(
            name="scene_text_system_role_from_seed",
            reference_key="scene_text_system_role_from_seed",
            prompt_text=scene_text_system_role_from_seed,
            user_context=user,
            update_existing=True
        )

        #SCENE TEXT FROM SEED: USER PROMPT
        scene_text_prompt_text_from_seed = dedent("""\
            <<prompt_template(key="angle_bracket_prompt")>>

            Do not provide a title for the scene narrative.

            [% if scene_text.scene_order > 1 %]
                Start your scene with a brief introductory phrase that situates it with respect to the preceding scene.
            [% endif %]

            Please write a detailed narrative scene description from this scene hint:

            <<text_seed>>

            Stylistically, the writing of the scene description should be simple and direct. Avoid florid and purple prose,
            and include only details that are relevant to the plot. Write in the present tense and remember that this is a
            description of a film scene.

            - Do not enclose your response in any metadata tags.
            - Do not finish with "END SCENE" or similar. Simply finish with the final action of the scene.
            - Do not describe the scene fading out or its effect on the audience.

            Please write the scene description immediately, with no preamble or introductory sentence.
        """)

        user_prompt_template = PromptTemplateService.register_prompt_template(
            name="scene_text_prompt_text_from_seed",
            reference_key="scene_text_prompt_text_from_seed",
            prompt_text=scene_text_prompt_text_from_seed,
            user_context=user,
            update_existing=True
        )

        #update platform settings
        AdminService.update_platform_setting('prompts.generateSceneFromSeed', {"system_role": str(system_role_template.id), "user_prompt": str(user_prompt_template.id)})


        #SCENE TEXT WITH NOTES: SYSTEM ROLE
        scene_text_system_role_with_notes = dedent("""\
            You are a talented assistant helping a screenwriter write a movie script. <<profile_prompt>> In the user prompt
            you will be provided with a narrative description of a scene from a movie. You will also be provided with 'Notes',
            which are instructions for rewriting the narrative description of the scene. You will rewrite the detailed narrative
            description of the scene, taking into consideration the Notes. To the degree possible, unless instructed otherwise
            by the 'Note', you will retain all the details from the original version.<<prompt_template(key="angle_bracket_prompt")>>
        """)

        system_role_template = PromptTemplateService.register_prompt_template(
            name="scene_text_system_role_with_notes",
            reference_key="scene_text_system_role_with_notes",
            prompt_text=scene_text_system_role_with_notes,
            user_context=user,
            update_existing=True
        )

        #SCENE TEXT WITH NOTES: USER PROMPT
        scene_text_prompt_text_with_notes = dedent("""\
            You will rewrite the detailed narrative description of the scene, taking into consideration the notes.
            To the degree possible, unless instructed otherwise by the 'Note', you will retain all the details from
            the original version.

            Here is the detailed narrative description of the scene:

            <<scene_text.text_content>>

            Here are the notes to use for rewriting the detailed narrative description of the scene:

            <<text_notes>>Please rewrite the detailed narrative description of the scene, considering the Notes.
        """)

        user_prompt_template = PromptTemplateService.register_prompt_template(
            name="scene_text_prompt_text_with_notes",
            reference_key="scene_text_prompt_text_with_notes",
            prompt_text=scene_text_prompt_text_with_notes,
            user_context=user,
            update_existing=True
        )

        #update platform settings
        AdminService.update_platform_setting('prompts.generateSceneWithNotes', {"system_role": str(system_role_template.id), "user_prompt": str(user_prompt_template.id)})


        #SCENE TEXT WITH NOTES (SELECTIVE): SYSTEM ROLE
        scene_text_system_role_with_notes_selective = dedent("""\
            You are a talented assistant helping a screenwriter write a movie script.
            <<profile_prompt>>
            We are working on the Scene Text, which is a narrative text describing one scene from the movie.

            Your task is to rewrite a selected part of the Scene Text.
            You will be provided in the user prompt with a selected part of the Scene Text, which we will call the "Selected Text".
            This is the Scene Text which includes the Selected Text:

            <<scene_text.text_content>>

            In the user prompt you will be provided with the Selected Text from the Scene Text.
            You will also be provided with 'Notes', which are instructions for rewriting the Selected Text.
            You will rewrite the Selected Text, taking into consideration the Notes.  To the degree possible, unless instructed otherwise by the 'Note',
            you will retain all the details from the original version. You will use a writting style similar to that of the Scene Text.

            <<prompt_template(key="angle_bracket_prompt")>>
        """)

        system_role_template = PromptTemplateService.register_prompt_template(
            name="scene_text_system_role_with_notes_selective",
            reference_key="scene_text_system_role_with_notes_selective",
            prompt_text=scene_text_system_role_with_notes_selective,
            user_context=user,
            update_existing=True
        )

        #SCENE TEXT WITH NOTES (SELECTIVE): USER PROMPT
        scene_text_prompt_text_with_notes_selective = dedent("""\
            You will rewrite the Selected Text, taking into consideration the Notes.
            You will retain all the details from the original version of the Selected Text.
            Here is the Selected Text:

            <<selected_text>>

            Here are the notes to use for rewriting the Selected Text:

            <<text_notes>>

            Please rewrite only the Selected Text, considering the Notes.
        """)

        user_prompt_template = PromptTemplateService.register_prompt_template(
            name="scene_text_prompt_text_with_notes_selective",
            reference_key="scene_text_prompt_text_with_notes_selective",
            prompt_text=scene_text_prompt_text_with_notes_selective,
            user_context=user,
            update_existing=True
        )

        #update platform settings
        AdminService.update_platform_setting('prompts.generateSceneWithNotes.selective', {"system_role": str(system_role_template.id), "user_prompt": str(user_prompt_template.id)})

        #MAKE SCENES FROM MOVIE TEXT: SYSTEM ROLE
        scene_text_system_role_make_scenes = dedent("""\
            You are a talented assistant working with a screenwriter to develop a movie script. <<profile_prompt>>
            You will be presented with a synopsis, the Movie Narrative, which you will translate into a series of scenes.

            You will be making <<scene_count>> scenes for this movie.

            Each scene should include a title and a description of the action in that scene. Each scene description must be a full paragraph.
            Do not include scene numbers.

            Your output will consist entirely of a JSON list of lists. In this form:

            [["scene #1 title","scene #1 description"],["scene #2 title","scene #2 description"],["scene #3 title","scene #3 description"]], etc

            Every event described in the Movie Narrative must be included in the scenes.
        """)
        system_role_template = PromptTemplateService.register_prompt_template(
            name="scene_text_system_role_make_scenes",
            reference_key="scene_text_system_role_make_scenes",
            prompt_text=scene_text_system_role_make_scenes,
            user_context=user,
            update_existing=True
        )

        #MAKE SCENES FROM MOVIE TEXT: USER PROMPT
        scene_text_user_prompt_make_scenes = dedent("""\
            You will be making <<scene_count>> scenes for the movie. For each of the <<scene_count>> scenes,
            you'll need to include a Scene Title and a Scene Description. Do not include scene numbers.

            Enclose every instance of a character's name in angle brackets <>. For example, <Robert>.

            Your output will consist entirely of a JSON list of lists. In this form:

            [["scene #1 title","scene #1 description"],["scene #2 title","scene #2 description"],["scene #3 title","scene #3 description"]], etc

            You must output exactly <<scene_count>> scenes.
            If the provided Movie Narrative doesn't supply enough material for <<scene_count>> distinct scenes, you should add events to meet the quota.

            Do not duplicate scenes. Each title and description should be unique.

            Below is the Movie Narrative that you'll use as the basis for creating the scenes:

            <movie_narrative><<story_text.text_content>></movie_narrative>

            Style Rules:

            - Keep the writing of the scene descriptions straightfoward and functional. Avoid decorative language. Each sentence should be short, direct, and in the active voice.
            - Be sure to mention each character that will appear in the scene.
            - Every scene should have a clearly named setting that makes sense and is cinematically engaging.
            - Scenes should never blend together, but should be carefully delineated.
            - Every scene should advance the plot. That means, by the end of the scene, something should have changed in the characters or their relationships.
            - Every scene should have a beginning and an end.
            - The scenes must be created in the order in which they appear in the Movie Narrative.
            - Do not create any scenes for events that occur after the end of the Movie Narrative.
        """)
        user_prompt_template = PromptTemplateService.register_prompt_template(
            name="scene_text_user_prompt_make_scenes",
            reference_key="scene_text_user_prompt_make_scenes",
            prompt_text=scene_text_user_prompt_make_scenes,
            user_context=user,
            update_existing=True
        )

        #update platform settings
        AdminService.update_platform_setting('prompts.generateMakeScenes', {"system_role": str(system_role_template.id), "user_prompt": str(user_prompt_template.id)})

        #SUGGEST STORY TITLE: SYSTEM ROLE
        suggested_title_system_role_make_suggestion = dedent("""\
            We are working on a movie script. The user prompt will be a description of the movie. Please return a title.
        """)
        system_role_template = PromptTemplateService.register_prompt_template(
            name="suggested_title_system_role_make_suggestion",
            reference_key="suggested_title_system_role_make_suggestion",
            prompt_text=suggested_title_system_role_make_suggestion,
            user_context=user,
            update_existing=True
        )

        #SUGGEST STORY TITLE: USER PROMPT
        suggested_title_user_prompt_make_suggestion = dedent("""\
            <<story_text.text_content>>
        """)
        user_prompt_template = PromptTemplateService.register_prompt_template(
            name="suggested_title_user_prompt_make_suggestion",
            reference_key="suggested_title_user_prompt_make_suggestion",
            prompt_text=suggested_title_user_prompt_make_suggestion,
            user_context=user,
            update_existing=True
        )

        #update platform settings
        AdminService.update_platform_setting('prompts.generateTitleSuggestion', {"system_role": str(system_role_template.id), "user_prompt": str(user_prompt_template.id)})

        #BEAT SHEET FROM SCENE: SYSTEM ROLE
        beat_sheet_system_role_from_scene = dedent("""\
            You are a talented assistant helping a screenwriter write a movie script.
            <<profile_prompt>>
            Your task will be to create a scene beat sheet from the scene description in the user prompt.

            A beat sheet breaks a scene down into a series of beats or moments that are essential for moving the plot forward.
            These beats can include character introductions, important actions or decisions, turning points, conflicts, and resolutions.
            The beat sheet is organized in chronological order. Do not include any Acts or Act numbers in the beat sheet.

            For context, here is a synopsis that describes the movie as a whole:

            <<story_text.text_content>>

            END SYNOPSIS

            Your task will be to create a scene beat sheet from the scene description in the user prompt. Do not include a title for the beat sheet or any introductory preambles
            """)
        system_role_template = PromptTemplateService.register_prompt_template(
            name="beat_sheet_system_role_from_scene",
            reference_key="beat_sheet_system_role_from_scene",
            prompt_text=beat_sheet_system_role_from_scene,
            user_context=user,
            update_existing=True
        )

        #BEAT SHEET FROM SCENE: USER PROMPT
        beat_sheet_user_prompt_from_scene = dedent("""\
            Please write a beat sheet for the following scene description:

            <<scene_text.text_content>>

            END SCENE TEXT

            Write the beat sheet without any introductory preambles.

            [% if author_style %]
                Please write the beat sheet in the style of <<author_style.prompt_text>>.
            [% endif %]
        """)
        user_prompt_template = PromptTemplateService.register_prompt_template(
            name="beat_sheet_user_prompt_from_scene",
            reference_key="beat_sheet_user_prompt_from_scene",
            prompt_text=beat_sheet_user_prompt_from_scene,
            user_context=user,
            update_existing=True
        )

        #update platform settings
        AdminService.update_platform_setting('prompts.generateBeatSheetFromScene', {"system_role": str(system_role_template.id), "user_prompt": str(user_prompt_template.id)})

        #BEAT SHEET WITH NOTES: SYSTEM ROLE
        beat_sheet_system_role_with_notes = dedent("""\
            You are a skilled assistant tasked with helping a screenwriter refine a movie's beat sheet.
            Given the scene's current beat sheet and some notes, your job is to integrate these notes to enhance the scene's development.
            Keep the structure of the scene intact while incorporating the necessary adjustments as suggested by the notes.

            Here's the overall story context:

            <<story_text.text_content>>

            END STORY SYNOPSIS

            Here's the scene text for your reference:

            <<scene_text.text_content>>

            END SCENE TEXT

            Your objective is to revise the beat sheet below with the provided notes, which aim to improve the storytelling and plot progression.
        """)
        system_role_template = PromptTemplateService.register_prompt_template(
            name="beat_sheet_system_role_with_notes",
            reference_key="beat_sheet_system_role_with_notes",
            prompt_text=beat_sheet_system_role_from_scene,
            user_context=user,
            update_existing=True
        )

        #BEAT SHEET WITH NOTES: USER PROMPT
        beat_sheet_user_prompt_with_notes = dedent("""\
            You have been provided with the content of a beat sheet for a specific scene and a set of notes for revision.
            Your task is to update the beat sheet to reflect the changes suggested by these notes, aiming to enhance the clarity and impact of the scene.

            Here is the current content of the beat sheet:

            <<beat_sheet.text_content>>

            END BEAT SHEET

            The following notes should be used to guide your revisions:

            <<text_notes>>

            Please carry out the revisions to the beat sheet content as per the notes, ensuring the final result preserves
            the essence of the scene while improving its narrative flow and contribution to the overall story.

            Write the beat sheet without any introductory preambles.

            [% if author_style %]
                Please write the beat sheet in the style of <<author_style.prompt_text>>.
            [% endif %]
        """)
        user_prompt_template = PromptTemplateService.register_prompt_template(
            name="beat_sheet_user_prompt_with_notes",
            reference_key="beat_sheet_user_prompt_with_notes",
            prompt_text=beat_sheet_user_prompt_with_notes,
            user_context=user,
            update_existing=True
        )

        #update platform settings
        AdminService.update_platform_setting('prompts.generateBeatSheetWithNotes', {"system_role": str(system_role_template.id), "user_prompt": str(user_prompt_template.id)})

        #BEAT SHEET WITH NOTES (SELECTIVE): SYSTEM ROLE
        beat_sheet_system_role_with_notes_selective = dedent("""\

        """)
        system_role_template = PromptTemplateService.register_prompt_template(
            name="beat_sheet_system_role_with_notes_selective",
            reference_key="beat_sheet_system_role_with_notes_selective",
            prompt_text=beat_sheet_system_role_with_notes_selective,
            user_context=user,
            update_existing=True
        )

        #BEAT SHEET WITH NOTES (SELECTIVE): USER PROMPT
        beat_sheet_user_prompt_with_notes_selective = dedent("""\

        """)
        user_prompt_template = PromptTemplateService.register_prompt_template(
            name="beat_sheet_user_prompt_with_notes_selective",
            reference_key="beat_sheet_user_prompt_with_notes_selective",
            prompt_text=beat_sheet_user_prompt_with_notes_selective,
            user_context=user,
            update_existing=True
        )

        #update platform settings
        AdminService.update_platform_setting('prompts.generateBeatSheetWithNotes.selective', {"system_role": str(system_role_template.id), "user_prompt": str(user_prompt_template.id)})

        #SCRIPT TEXT FROM SCENE: SYSTEM ROLE
        script_text_system_role_from_scene = dedent("""\
            You are a talented screenwriter writing a movie script. In this case we are writing the script for a single scene in a larger movie.
            <<profile_prompt>>

            [% if style_guideline %]
                Here is the style guide we are using for writing scripts: <<style_guideline.prompt_text>>

                END STYLE GUIDE
            [% endif %]

            Please use Fountain markup to format your output.

            - For all dialogue the name of the speaker must be preceded by a blank line and be on a line by itself with the whole line being in all capital letters.
            - An optional description of blocking or speech tone (mode of speaking) can be inserted on a line, after the name of the speaker and before the dialogue.
            - No blank line should be inserted between the speaker's name and the optional decription. Do not include any description of the speaker themselves on this line.
            - This optional description line should be in lowercase letters and in parentheses. The dialogue text must be on a line by itself. No blank line just prior to it.
            - There must be a blank line after the line of dialogue. There must be no blank lines between the name of the speaker, the optional description, and the dialogue text.

            For necessary context, here is a narrative synopsis of the movie as a whole:

            <<story_text.text_content>>

            END SYNOPSIS

            [% if beat_sheet %]
                Your task will be to write the script for this one scene using the scene beat sheet and the scene narrative description in the user prompt.

                It is crucial that every detail of the scene narrative description be included in the script.

                It is also crucial that every beat in the beat sheet be included in the script.
            [% else %]
                Your task will be to write the script for this one scene using the scene narrative description in the user prompt.

                It is crucial that every detail of the scene narrative description be included in the script.
            [% endif %]

            FURTHER RULES:
            - Note where this scene appears in the chronological whole. Unless this is the first scene in which a character is introduced, do not include introductory details about the character (e.g. age or appearance).
            - Always begin with a slug line and a description of the scene setting.
            - Be sure to include plentiful dialogue, when appropriate. Dialogue, setting, and action descriptions are all important elements in a movie script.
            - Dialogue should never be summarized. It should always be written out fully in dialogue format.
            - Do not number any of the parts of the script.
            - Do not include any camera or editing instructions such as "CLOSE-UP", "FADE IN", "FADE OUT","FADE TO BLACK","CUT TO", "SHIFT TO", or any other camera or editing instructions.
            - Do not include "to be continued" or anything similar at the end of the script.
        """)
        system_role_template = PromptTemplateService.register_prompt_template(
            name="script_text_system_role_from_scene",
            reference_key="script_text_system_role_from_scene",
            prompt_text=script_text_system_role_from_scene,
            user_context=user,
            update_existing=True
        )

        #SCRIPT TEXT FROM SCENE: USER PROMPT
        script_text_user_prompt_from_scene = dedent("""\
            [% if beat_sheet %]
                Please write a scene in movie industry standard screenplay format using the scene narrative description and the beat sheet below:

                Scene Narrative Description:

                <<scene_text.text_content>>

                END SCENE NARRATIVE DESCRIPTION

                Beat Sheet:

                <<beat_sheet.text_content>>

                END BEAT SHEET

                - Be absolutely sure to use each and every detail from both the scene narrative description and the beat sheet in the creation of the Scene Script. Double-check this if necessary.

                Do not include any beat labels in the script for example do not include: "Beat One" "BEAT 1",  Include no beat labels in any form.
            [% else %]
                Please write a scene in movie industry standard screenplay format using the scene narrative description below:

                Scene Narrative Description:

                <<scene_text.text_content>>

                END SCENE NARRATIVE DESCRIPTION

                Be absolutely sure to use each and every detail from the scene narrative description in the creation of the Scene Script.
            [% endif %]

            - Include plenty of realistic dialogue, whenever appropriate to the scene. Include information about the scene location. Fully describe the scene action.
            - The scene script should have a rich balance of dialogue, location description, and action descriptions.

            [% if author_style %]
                Please write the Scene Script in the style of <<author_style.prompt_text>>
            [% endif %]

            [% if script_dialog_flavor %]
                Please write all of the dialogue in the Scene Script in <<script_dialog_flavor.prompt_text>>

                Only use this style for the dialogue. The rest of the Scene Script should be written in a neutral style.
            [% endif %]
        """)
        user_prompt_template = PromptTemplateService.register_prompt_template(
            name="script_text_user_prompt_from_scene",
            reference_key="script_text_user_prompt_from_scene",
            prompt_text=script_text_user_prompt_from_scene,
            user_context=user,
            update_existing=True
        )

        #update platform settings
        AdminService.update_platform_setting('prompts.generateScriptTextFromScene', {"system_role": str(system_role_template.id), "user_prompt": str(user_prompt_template.id)})

        #SCRIPT TEXT WITH NOTES: SYSTEM ROLE
        script_text_system_role_with_notes = dedent("""\
            You are a talented assistant helping a screenwriter write a movie script.
            <<profile_prompt>>

            [% if style_guideline %]
                This is the style guide we are using for writing scripts:

                <<style_guideline.prompt_text>>
            [% endif %]

            [% if screenplay_format %]
                Dialogue should be centered on the page. The name of the speaker of each piece of dialogue should be on a line by iteself, centered on the page, and in all upper case.
                An optional description of blocking or speech tone (mode of speaking) can be inserted on a line, centered on the page, after the name of the speaker and before the dialogue. Do not include any description of the speaker on this line. This line should be in lowercase letters and in parentheses.
                Here is an example of how to format dialogue:

                           ALEX
                   (muttering to himself)
                   it's just not the same without her.

                           JOHN
                   We'll manage, Alex. We have to.

                For purposes of centering each of the dialogue, the name of the speaker, and the optional line for mode of speaking, assume a fixed-width font like New Courier
                with a line width of 60 characters. The center of all of the centered lines should be at position 30 in the line. The centered lines include: the speaker of the dialogue in upper case,
                the lowercase optional line in parentheses for mode of speaking, and the dialogue itself.
                The dialogue itself should be divided with new lines so that no line on the page is longer than 40 characters. Each of the dialogue lines seperated by new lines should have its center at position 30. The optional mode of speaking line after the speaker's name should also have its center at position 30.
                The speaker's name in upper case should also be centered at the 30th position.
                Use spaces, not tabs, to center the text. The dialogue should not have quotation marks around it.
            [% endif %]

            In the user prompt you will be provided with a script for one scene from the movie, which we will call the "Scene Script".
            You will also be provided with 'Notes', which are instructions for rewriting the Scene Script.
            You will rewrite the Scene Script, taking into consideration the Notes. To the degree possible, unless instructed otherwise by the 'Note',
            you will retain all the details from the original version.

            The scene script was created from a prose scene narrative. The rewritten version of the scene script must include each and every detail from both the scene narrative and the original scene script.
            This is the scene narrative on which the scene script was based:

            <<scene_text.text_content>>
        """)
        system_role_template = PromptTemplateService.register_prompt_template(
            name="script_text_system_role_with_notes",
            reference_key="script_text_system_role_with_notes",
            prompt_text=script_text_system_role_with_notes,
            user_context=user,
            update_existing=True
        )

        #SCRIPT TEXT WITH NOTES: USER PROMPT
        script_text_user_prompt_with_notes = dedent("""\
            You will rewrite the scene script, taking into consideration the Notes. To the degree possible, unless instructed otherwise by the 'Note',
            you will retain all the details from the original version of the scene script and from the scene narrative.

            Here is the scene script:

            <<script_text.text_content>>

            Here are the notes to use for rewriting the scene script:

            <<text_notes>>

            Please rewrite the scene script, considering the Notes.

            [% if author_style %]
                Please rewrite the scene script in the style of <<author_style.prompt_text>>
            [% endif %]
        """)
        user_prompt_template = PromptTemplateService.register_prompt_template(
            name="script_text_user_prompt_with_notes",
            reference_key="script_text_user_prompt_with_notes",
            prompt_text=script_text_user_prompt_with_notes,
            user_context=user,
            update_existing=True
        )

        #update platform settings
        AdminService.update_platform_setting('prompts.generateScriptTextWithNotes', {"system_role": str(system_role_template.id), "user_prompt": str(user_prompt_template.id)})

        #SCRIPT TEXT WITH NOTES (SELECTIVE): SYSTEM ROLE
        script_text_system_role_with_notes_selective = dedent("""\
            You are a talented assistant helping a screenwriter write a movie script.
            <<profile_prompt>>
            We are working on the Scene Script, which is a script for one scene from the movie.

            [% if style_guideline %]
                This is the style guide we are using for writing scripts:

                <<style_guideline.prompt_text>>
            [% endif %]

            [% if screenplay_format %]
                Dialogue should be centered on the page. The name of the speaker of each piece of dialogue should be on a line by iteself, centered on the page, and in all upper case.
                An optional description of blocking or speech tone (mode of speaking) can be inserted on a line, centered on the page, after the name of the speaker and before the dialogue. Do not include any description of the speaker on this line. This line should be in lowercase letters and in parentheses.
                Here is an example of how to format dialogue:

                           ALEX
                   (muttering to himself)
                   it's just not the same without her.

                           JOHN
                   We'll manage, Alex. We have to.

                For purposes of centering each of the dialogue, the name of the speaker, and the optional line for mode of speaking, assume a fixed-width font like New Courier
                with a line width of 60 characters. The center of all of the centered lines should be at position 30 in the line. The centered lines include: the speaker of the dialogue in upper case,
                the lowercase optional line in parentheses for mode of speaking, and the dialogue itself.
                The dialogue itself should be divided with new lines so that no line on the page is longer than 40 characters. Each of the dialogue lines seperated by new lines should have its center at position 30. The optional mode of speaking line after the speaker's name should also have its center at position 30.
                The speaker's name in upper case should also be centered at the 30th position.
                Use spaces, not tabs, to center the text. The dialogue should not have quotation marks around it.
            [% endif %]

            Your task is to rewrite a selected part of the Scene Script.

            You will be provided in the user prompt with a selected part of the Scene Script, which we will call the "Selected Text".
            This is the Scene Script which includes the Selected Text:

            <<script_text.text_content>>

            In the user prompt you will be provided with the Selected Text from the Scene Script.
            You will also be provided with 'Notes', which are instructions for rewriting the Selected Text.
            You will rewrite the Selected Text, taking into consideration the Notes.  To the degree possible, unless instructed otherwise by the 'Note',
            you will retain all the details from the original version. You will use a writting style similar to that of the Scene Script
        """)
        system_role_template = PromptTemplateService.register_prompt_template(
            name="script_text_system_role_with_notes_selective",
            reference_key="script_text_system_role_with_notes_selective",
            prompt_text=script_text_system_role_with_notes_selective,
            user_context=user,
            update_existing=True
        )

        #SCRIPT TEXT WITH NOTES (SELECTIVE): USER PROMPT
        script_text_user_prompt_with_notes_selective = dedent("""\
            You will rewrite the Selected Text, taking into consideration the Notes. To the degree possible, unless instructed otherwise by the 'Note',
            you will retain all the details from the original version of the Selected Text. You will use a writting style similar to that of the Scene Script.
            Here is the Selected Text:

            <<selected_text>>

            Here are the notes to use for rewriting the Selected Text:

            <<text_notes>>

            Please rewrite the Selected Text, considering the Notes.

            [% if author_style %]
                Please rewrite the scene script in the style of <<author_style.prompt_text>>
            [% endif %]
        """)
        user_prompt_template = PromptTemplateService.register_prompt_template(
            name="script_text_user_prompt_with_notes_selective",
            reference_key="script_text_user_prompt_with_notes_selective",
            prompt_text=script_text_user_prompt_with_notes_selective,
            user_context=user,
            update_existing=True
        )

        #update platform settings
        AdminService.update_platform_setting('prompts.generateScriptTextWithNotes.selective', {"system_role": str(system_role_template.id), "user_prompt": str(user_prompt_template.id)})


        #MAKE MAGIC NOTES: STORY TEXT (SYSTEM ROLE)
        story_text_system_role_magic_notes = dedent("""\
            You are a professional consulting critic helping a screenplay writer develop a movie script.
            <<profile_prompt>>
            In the user prompt below you will receive a narrative text, henceforth called the "Movie Text". The Movie Text is the narrative document that will later be the source material for writing the movie screenplay.

            What follows is the "Movie Seed". The Movie Seed is a shorter document that was used as the basis for writing the Movie Text. The Movie Seed provides in whole or part a summary of the movie plot and characters. (Everything in the Movie Seed should be represented in the Movie Text, though the Movie Text may have much more detail and may include events and characters not in the Movie Seed.)

            Movie Seed:

            <<story_text.text_seed>>
            END MOVIE SEED

            [% if critics|length == 0 %]
                You will provide helpful, incisive, and detailed feedback to improve the Movie Text with respect to coherence, plot and plot details, dramatic impact and arc, character and character development, and anything else you care to advise on to improve the Movie Text.
                The Movie Text should provide a detailed description of the plot, characters, and settings of the movie, in sufficient detail to serve as the basis for a feature-length film.

                Your feedback will later be used as part of a prompt to provide you with guidance in rewriting the Movie Text, so make your response
                suitable for that purpose. Make your response specific, detailed, and actionable. Focus on what can be improved, not on what is currently good.

                Please provide your response as a numbered list. Provide a maximum of four focused points of suggestion.
            [% else %]
                You will provide helpful, incisive, detailed, and specific feedback to improve the Movie Text. In your feedback, minimize what you find good and emphasize improvements that could be made. Be precise, declarative, and detailed in your recommendations.
                Your feedback will be used later to prompt you for rewriting the Movie Text later, so provide your feedback in a form suitable for that purpose. Please provide feedback, in order, on the following list of topics. Please DO NOT provide feedback on ANY topics not listed below.

                [% for critic in critics %]
                    - <<critic.story_text_prompt>>
                [% endfor %]

                Do not provide any feedback about the use of angle brackets <> to enclose character names: example <Mary>.
                Please provide an overall maximum of five focused points of suggestion.
            [% endif %]
        """)
        system_role_template = PromptTemplateService.register_prompt_template(
            name="story_text_system_role_magic_notes",
            reference_key="story_text_system_role_magic_notes",
            prompt_text=story_text_system_role_magic_notes,
            user_context=user,
            update_existing=True
        )

        #MAKE MAGIC NOTES: STORY TEXT (USER PROMPT)
        story_text_user_prompt_magic_notes = dedent("""\
            Here is the Movie Text that you are to evaluate and provide feedback to improve:

            <<story_text.text_content>>
            END MOVIE TEXT

            [% if critics|length == 0 %]
                Please provide your response as a numbered list. Provide a maximum of four focused points of suggestion.
            [% else %]
                Please provide an overall maximum of five focused points of suggestion. Provide your response as a numbered list.
            [% endif %]

        """)
        user_prompt_template = PromptTemplateService.register_prompt_template(
            name="story_text_user_prompt_magic_notes",
            reference_key="story_text_user_prompt_magic_notes",
            prompt_text=story_text_user_prompt_magic_notes,
            user_context=user,
            update_existing=True
        )

        #update platform settings
        AdminService.update_platform_setting('prompts.generateMagicNotes.story_text', {"system_role": str(system_role_template.id), "user_prompt": str(user_prompt_template.id)})

        #MAKE MAGIC NOTES: SCENE TEXT (SYSTEM ROLE)
        scene_text_system_role_magic_notes = dedent("""\
            You are a professional screenwriting consultant tasked with evaluating a Scene Narrative for a movie.
            <<profile_prompt>>

            [% if critics|length == 0 %]
                A Scene Narrative is a detailed prose description of a Scene that will be used as the basis for writing a scene script. Your expertise lies in providing insightful, specific, and actionable feedback on the scene's coherence, dramatic impact, character development, and any other elements you consider relevant. Focus on points of improvement, not what's already working. Do not simply evaluate but explain HOW to make the improvements, with specific textual examples.

                Below is the Scene Narrative you are to evaluate. After reading it, please provide your suggestions on how it can be improved. Your feedback will then be used to guide a revision of the narrative. Present your suggestions as a numbered list.
            [% else %]
                A Scene Narrative is a detailed prose description of a Scene, serving as the basis for writing a scene script. Your expertise lies in providing insightful, specific, and actionable feedback. Focus on points of improvement, not what's already working. Do not simply evaluate but explain HOW to make the improvements, with specific textual examples.

                What follows is the Scene Seed. The Scene Seed is a shorter document that was used as the basis for writing for the Scene Narrative. The Scene Seed was the foundation for the Scene Narrative and should be wholly encompassed within it. However, the Scene Narrative can expand on this foundation considerably, incorporating new details or introducing new elements.

                Scene Seed:

                <<scene_text.text_seed>>
                END SCENE SEED

                In the user prompt below, you will receive the current Scene Narrative. The Scene Narrative is the document that will later be used as the source material for writing the Scene Script.
                Your feedback will later be used as a prompt back to you to instruct a revision of the Scene Narrative, so make your response suitable for that purpose.

                Please provide feedback, in this order, on the following key areas (and ONLY these areas):

                [% for critic in critics %]
                    - <<critic.scene_text_prompt>>
                [% endfor %]

                Do not provide any feedback about the use of angle brackets <> to enclose character names: example <Mary>.

                Please provide an overall maximum of five focused points of suggestion.
            [% endif %]
        """)
        system_role_template = PromptTemplateService.register_prompt_template(
            name="scene_text_system_role_magic_notes",
            reference_key="scene_text_system_role_magic_notes",
            prompt_text=scene_text_system_role_magic_notes,
            user_context=user,
            update_existing=True
        )

        #MAKE MAGIC NOTES: SCENE TEXT (USER PROMPT)
        scene_text_user_prompt_magic_notes = dedent("""\
            [% if critics|length == 0 %]
                Scene Narrative for evaluation:

                <<scene_text.text_content>>
                END SCENE NARRATIVE

                Please provide an overall maximum of five focused points of suggestion. Provide your response as a numbered list.
            [% else %]
                Here is the Scene Narrative for you to evaluate:

                <<scene_text.text_content>>
                END SCENE NARRATIVE

                Please provide your response as a numbered list.
            [% endif %]
        """)
        user_prompt_template = PromptTemplateService.register_prompt_template(
            name="scene_text_user_prompt_magic_notes",
            reference_key="scene_text_user_prompt_magic_notes",
            prompt_text=scene_text_user_prompt_magic_notes,
            user_context=user,
            update_existing=True
        )

        #update platform settings
        AdminService.update_platform_setting('prompts.generateMagicNotes.scene_text', {"system_role": str(system_role_template.id), "user_prompt": str(user_prompt_template.id)})


        #MAKE MAGIC NOTES: BEAT SHEET (SYSTEM ROLE)
        beat_sheet_system_role_magic_notes = dedent("""\

        """)
        system_role_template = PromptTemplateService.register_prompt_template(
            name="beat_sheet_system_role_magic_notes",
            reference_key="beat_sheet_system_role_magic_notes",
            prompt_text=beat_sheet_system_role_magic_notes,
            user_context=user,
            update_existing=True
        )

        #MAKE MAGIC NOTES: BEAT SHEET (USER PROMPT)
        beat_sheet_user_prompt_magic_notes = dedent("""\

        """)
        user_prompt_template = PromptTemplateService.register_prompt_template(
            name="beat_sheet_user_prompt_magic_notes",
            reference_key="beat_sheet_user_prompt_magic_notes",
            prompt_text=beat_sheet_user_prompt_magic_notes,
            user_context=user,
            update_existing=True
        )

        #update platform settings
        AdminService.update_platform_setting('prompts.generateMagicNotes.beat_sheet', {"system_role": str(system_role_template.id), "user_prompt": str(user_prompt_template.id)})

        #MAKE MAGIC NOTES: SCRIPT TEXT (SYSTEM ROLE)
        script_text_system_role_magic_notes = dedent("""\
            You are a professional screenwriting consultant tasked with evaluating a Scene Script for a movie.
            <<profile_prompt>>
            Your expertise lies in providing insightful, specific, and actionable feedback on coherence, dramatic impact, character development, and any other elements you consider relevant. Your feedback will later be used as part of a prompt back to you to provide guidance in rewriting the Scene Script, so make it suitable for that purpose. Focus on points of improvement, not what's already working. Do not simply evaluate but explain HOW to make the improvements, with specific textual examples.

            [% if critics|length > 0 %]
                You will be provided in the user prompt with a list of topics to provide feedback on. Restrict your responses to those topics.
            [% endif %]

            The Scene Script is to closely follow the Scene Narrative. This is the Scene Narrative for the scene:

            <<script_text.scene().text_content>>
        """)
        system_role_template = PromptTemplateService.register_prompt_template(
            name="script_text_system_role_magic_notes",
            reference_key="script_text_system_role_magic_notes",
            prompt_text=script_text_system_role_magic_notes,
            user_context=user,
            update_existing=True
        )

        #MAKE MAGIC NOTES: SCRIPT TEXT (USER PROMPT)
        script_text_user_prompt_magic_notes = dedent("""\
            This is the Scene Script that you are to evaluate and provide feedback to improve:

            <<script_text.text_content>>

            [% if critics|length > 0 %]
                These are the topics for you to provide feedback on:

                [% for critic in critics %]
                    - <<critic.script_text_prompt>>
                [% endfor %]
            [% endif %]

            Please provide your response as a numbered list.
        """)
        user_prompt_template = PromptTemplateService.register_prompt_template(
            name="script_text_user_prompt_magic_notes",
            reference_key="script_text_user_prompt_magic_notes",
            prompt_text=script_text_user_prompt_magic_notes,
            user_context=user,
            update_existing=True
        )

        #update platform settings
        AdminService.update_platform_setting('prompts.generateMagicNotes.script_text', {"system_role": str(system_role_template.id), "user_prompt": str(user_prompt_template.id)})

        #MAKE EXPANSIVE MAGIC NOTES: STORY TEXT (SYSTEM ROLE)
        story_text_system_role_expansive_notes = dedent("""\
            You are a professional analyst and writer for a movie studio working on a movie.
            <<profile_prompt>>
            Your task is to make detailed suggestions of material to add to a given prose narrative, referred to as the "Movie Text", to make it a suitable length for a feature-length film script.

            Your Role:

            - You'll receive the Movie Text as part of the user prompt. This text outlines all existing elements that will be in the movie script.
            - You will also be given a percentage indicating how much longer the narrative needs to be. For example, "50%" means that we're looking to make the Movie Text 50% longer.

            Your Output:

            - Reply with no more than five (5) detailed suggestions for meeting the specified lengthening target.
            - Your suggestions can optionally include new scenes, characters, plot twists, locations, elements of dramatic or interpersonal tension, further character development, or new beginnings and endings. Use your extensive expertise in film to ensure that your suggestions enhance the movie quality while maintaining narrative coherence.
            - State your suggestions as directions, not hypotheticals. Instead of leaving specifics to be filled in at the next stage, provide them now. Avoid words like "could" and "perhaps." Whenever possible, make your suggestions such that they could be interpolated in the movie text without extensive adjustment.
            - Pursue depth over breadth.
            - All character names must be enclosed in angle brackets, like so: <Mary>.
        """)
        system_role_template = PromptTemplateService.register_prompt_template(
            name="story_text_system_role_expansive_notes",
            reference_key="story_text_system_role_expansive_notes",
            prompt_text=story_text_system_role_expansive_notes,
            user_context=user,
            update_existing=True
        )

        #MAKE EXPANSIVE MAGIC NOTES: STORY TEXT (USER PROMPT)
        story_text_user_prompt_expansive_notes = dedent("""\
            Below is the Movie Text for your evaluation:

            <<story_text.text_content>>

            Please provide a numbered list of detailed suggestions for making the Movie Text <<target_percent>>% longer.
        """)
        user_prompt_template = PromptTemplateService.register_prompt_template(
            name="story_text_user_prompt_expansive_notes",
            reference_key="story_text_user_prompt_expansive_notes",
            prompt_text=story_text_user_prompt_expansive_notes,
            user_context=user,
            update_existing=True
        )

        #update platform settings
        AdminService.update_platform_setting('prompts.generateExpansiveNotes.story_text', {"system_role": str(system_role_template.id), "user_prompt": str(user_prompt_template.id)})

        #MAKE EXPANSIVE MAGIC NOTES: SCENE TEXT (SYSTEM ROLE)
        scene_text_system_role_expansive_notes = dedent("""\
            You are a professional analyst and writer for a movie studio working on a movie.
            <<profile_prompt>>

            Your task is to make detailed suggestions of material to add to a given prose narrative, referred to as the "Scene Text," which you have deemed to be too short in duration.
            Your suggestions for additional material are intended to make the Scene Text longer in run time when filmed.

            Your Role:

            - You'll receive the Scene Text as part of the user prompt. This text outlines all existing elements that will be in the Scene.

            Your Output:

            - Reply with no more than five (5) detailed suggestions for meeting the specified lengthening target.
            - Your suggestions can optionally include new characters, plot twists, elements of dramatic or interpersonal tension, further character development, or new beginnings and endings. Use your extensive expertise in film to ensure that your suggestions enhance the movie quality while maintaining narrative coherence.
            - State your suggestions as directions, not hypotheticals. Instead of leaving specifics to be filled in at the next stage, provide them now. Avoid words like "could" and "perhaps." Whenever possible, write suggestions in such a way that they could be interpolated in the Scene Text without extensive adjustment.
            - Pursue depth over breadth.
            - All character names must be enclosed in angle brackets, like so: <Mary>.

        """)
        system_role_template = PromptTemplateService.register_prompt_template(
            name="scene_text_system_role_expansive_notes",
            reference_key="scene_text_system_role_expansive_notes",
            prompt_text=scene_text_system_role_expansive_notes,
            user_context=user,
            update_existing=True
        )

        #MAKE EXPANSIVE MAGIC NOTES: SCENE TEXT (USER PROMPT)
        scene_text_user_prompt_expansive_notes = dedent("""\
            Below is the Scene Text for your evaluation:

            <<scene_text.text_content>>
            END SCENE Text

            Please provide an overall maximum of five points of suggestion. Provide your response as a numbered list.
        """)
        user_prompt_template = PromptTemplateService.register_prompt_template(
            name="scene_text_user_prompt_expansive_notes",
            reference_key="scene_text_user_prompt_expansive_notes",
            prompt_text=scene_text_user_prompt_expansive_notes,
            user_context=user,
            update_existing=True
        )

        #update platform settings
        AdminService.update_platform_setting('prompts.generateExpansiveNotes.scene_text', {"system_role": str(system_role_template.id), "user_prompt": str(user_prompt_template.id)})

        #MAKE EXPANSIVE MAGIC NOTES: BEAT SHEET (SYSTEM ROLE)
        beat_sheet_system_role_expansive_notes = dedent("""\

        """)
        system_role_template = PromptTemplateService.register_prompt_template(
            name="beat_sheet_system_role_expansive_notes",
            reference_key="beat_sheet_system_role_expansive_notes",
            prompt_text=beat_sheet_system_role_expansive_notes,
            user_context=user,
            update_existing=True
        )

        #MAKE EXPANSIVE MAGIC NOTES: BEAT SHEET (USER PROMPT)
        beat_sheet_user_prompt_expansive_notes = dedent("""\

        """)
        user_prompt_template = PromptTemplateService.register_prompt_template(
            name="beat_sheet_user_prompt_expansive_notes",
            reference_key="beat_sheet_user_prompt_expansive_notes",
            prompt_text=beat_sheet_user_prompt_expansive_notes,
            user_context=user,
            update_existing=True
        )

        #update platform settings
        AdminService.update_platform_setting('prompts.generateExpansiveNotes.beat_sheet', {"system_role": str(system_role_template.id), "user_prompt": str(user_prompt_template.id)})

        #MAKE EXPANSIVE MAGIC NOTES: SCRIPT TEXT (SYSTEM ROLE)
        script_text_system_role_expansive_notes = dedent("""\

        """)
        system_role_template = PromptTemplateService.register_prompt_template(
            name="script_text_system_role_expansive_notes",
            reference_key="script_text_system_role_expansive_notes",
            prompt_text=script_text_system_role_expansive_notes,
            user_context=user,
            update_existing=True
        )

        #MAKE EXPANSIVE MAGIC NOTES: SCRIPT TEXT (USER PROMPT)
        script_text_user_prompt_expansive_notes = dedent("""\

        """)
        user_prompt_template = PromptTemplateService.register_prompt_template(
            name="script_text_user_prompt_expansive_notes",
            reference_key="script_text_user_prompt_expansive_notes",
            prompt_text=script_text_user_prompt_expansive_notes,
            user_context=user,
            update_existing=True
        )

        #update platform settings
        AdminService.update_platform_setting('prompts.generateExpansiveNotes.script_text', {"system_role": str(system_role_template.id), "user_prompt": str(user_prompt_template.id)})

        #MAKE CHARACTER PROFILE: FROM SEED (SYSTEM ROLE)
        character_profile_system_role_from_seed = dedent("""\

        """)
        system_role_template = PromptTemplateService.register_prompt_template(
            name="character_profile_system_role_from_seed",
            reference_key="character_profile_system_role_from_seed",
            prompt_text=character_profile_system_role_from_seed,
            user_context=user,
            update_existing=True
        )

        #MAKE CHARACTER PROFILE: FROM SEED (USER PROMPT)
        character_profile_prompt_text_from_seed = dedent("""\

        """)
        user_prompt_template = PromptTemplateService.register_prompt_template(
            name="character_profile_prompt_text_from_seed",
            reference_key="character_profile_prompt_text_from_seed",
            prompt_text=character_profile_prompt_text_from_seed,
            user_context=user,
            update_existing=True
        )

        #update platform settings
        AdminService.update_platform_setting('prompts.generateCharacterFromSeed', {"system_role": str(system_role_template.id), "user_prompt": str(user_prompt_template.id)})


        #MAKE CHARACTER PROFILE: WITH NOTES (SYSTEM ROLE)
        character_profile_system_role_with_notes = dedent("""\

        """)
        system_role_template = PromptTemplateService.register_prompt_template(
            name="character_profile_system_role_with_notes",
            reference_key="character_profile_system_role_with_notes",
            prompt_text=character_profile_system_role_with_notes,
            user_context=user,
            update_existing=True
        )

        #MAKE CHARACTER PROFILE: WITH NOTES (USER PROMPT)
        character_profile_prompt_text_with_notes = dedent("""\

        """)
        user_prompt_template = PromptTemplateService.register_prompt_template(
            name="character_profile_prompt_text_with_notes",
            reference_key="character_profile_prompt_text_with_notes",
            prompt_text=character_profile_prompt_text_with_notes,
            user_context=user,
            update_existing=True
        )

        #update platform settings
        AdminService.update_platform_setting('prompts.generateCharacterWithNotes', {"system_role": str(system_role_template.id), "user_prompt": str(user_prompt_template.id)})

        #MAKE CHARACTER PROFILE: WITH NOTES (SELECTIVE) (SYSTEM ROLE)
        character_profile_system_role_with_notes_selective = dedent("""\

        """)
        system_role_template = PromptTemplateService.register_prompt_template(
            name="character_profile_system_role_with_notes_selective",
            reference_key="character_profile_system_role_with_notes_selective",
            prompt_text=character_profile_system_role_with_notes_selective,
            user_context=user,
            update_existing=True
        )

        #MAKE CHARACTER PROFILE: WITH NOTES (SELECTIVE) (USER PROMPT)
        character_profile_prompt_text_with_notes_selective = dedent("""\

        """)
        user_prompt_template = PromptTemplateService.register_prompt_template(
            name="character_profile_prompt_text_with_notes_selective",
            reference_key="character_profile_prompt_text_with_notes_selective",
            prompt_text=character_profile_prompt_text_with_notes_selective,
            user_context=user,
            update_existing=True
        )

        #update platform settings
        AdminService.update_platform_setting('prompts.generateCharacterWithNotes.selective', {"system_role": str(system_role_template.id), "user_prompt": str(user_prompt_template.id)})

        #MAKE LOCATION PROFILE: FROM SEED (SYSTEM ROLE)
        location_profile_system_role_from_seed = dedent("""\

        """)
        system_role_template = PromptTemplateService.register_prompt_template(
            name="location_profile_system_role_from_seed",
            reference_key="location_profile_system_role_from_seed",
            prompt_text=location_profile_system_role_from_seed,
            user_context=user,
            update_existing=True
        )

        #MAKE LOCATION PROFILE: FROM SEED (USER PROMPT)
        location_profile_prompt_text_from_seed = dedent("""\

        """)
        user_prompt_template = PromptTemplateService.register_prompt_template(
            name="location_profile_prompt_text_from_seed",
            reference_key="location_profile_prompt_text_from_seed",
            prompt_text=location_profile_prompt_text_from_seed,
            user_context=user,
            update_existing=True
        )

        #update platform settings
        AdminService.update_platform_setting('prompts.generateLocationFromSeed', {"system_role": str(system_role_template.id), "user_prompt": str(user_prompt_template.id)})

        #MAKE LOCATION PROFILE: WITH NOTES (SYSTEM ROLE)
        location_profile_system_role_with_notes = dedent("""\

        """)
        system_role_template = PromptTemplateService.register_prompt_template(
            name="location_profile_system_role_with_notes",
            reference_key="location_profile_system_role_with_notes",
            prompt_text=location_profile_system_role_with_notes,
            user_context=user,
            update_existing=True
        )

        #MAKE LOCATION PROFILE: WITH NOTES (USER PROMPT)
        location_profile_prompt_text_with_notes = dedent("""\

        """)
        user_prompt_template = PromptTemplateService.register_prompt_template(
            name="location_profile_prompt_text_with_notes",
            reference_key="location_profile_prompt_text_with_notes",
            prompt_text=location_profile_prompt_text_with_notes,
            user_context=user,
            update_existing=True
        )

        #update platform settings
        AdminService.update_platform_setting('prompts.generateLocationWithNotes', {"system_role": str(system_role_template.id), "user_prompt": str(user_prompt_template.id)})


        #MAKE LOCATION PROFILE: WITH NOTES (SELECTIVE) (SYSTEM ROLE)
        location_profile_system_role_with_notes_selective = dedent("""\

        """)
        system_role_template = PromptTemplateService.register_prompt_template(
            name="location_profile_system_role_with_notes_selective",
            reference_key="location_profile_system_role_with_notes_selective",
            prompt_text=location_profile_system_role_with_notes_selective,
            user_context=user,
            update_existing=True
        )

        #MAKE LOCATION PROFILE: WITH NOTES (SELECTIVE) (USER PROMPT)
        location_profile_prompt_text_with_notes_selective = dedent("""\

        """)
        user_prompt_template = PromptTemplateService.register_prompt_template(
            name="location_profile_prompt_text_with_notes_selective",
            reference_key="location_profile_prompt_text_with_notes_selective",
            prompt_text=location_profile_prompt_text_with_notes_selective,
            user_context=user,
            update_existing=True
        )

        #update platform settings
        AdminService.update_platform_setting('prompts.generateLocationWithNotes.selective', {"system_role": str(system_role_template.id), "user_prompt": str(user_prompt_template.id)})


        print('Prompt templates seeded')

        return
