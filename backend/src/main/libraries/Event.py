"""
Event Module

This module defines the Event class which represents a type of event along with its associated data.
"""

class Event:
    """
    Event Class

    This class is used to represent an event with its type and corresponding data.
    """

    def __init__(self, event_type, data):
        """
        Initialize an instance of Event.

        :param event_type: A string representing the type of the event.
        :param data: The data associated with the event.
        """

        self.type = event_type   # The type of the event
        self.data = data         # The data associated with the event
