from .StyleGuidelineService import StyleGuidelineService

class StyleGuidelineListener:

    @staticmethod
    def style_guideline_registered_listener(event):
        # logic for when a style guideline is registered
        pass

    @staticmethod
    def style_guideline_updated_listener(event):
        # logic for when a style guideline is updated
        pass

    @staticmethod
    def style_guideline_deleted_listener(event):
        # logic for when a style guideline is deleted
        pass

    def register_listeners(self):
        pass
