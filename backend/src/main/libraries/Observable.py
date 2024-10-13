from opentelemetry import trace
import os

class Observable:
    """
    Observable Class

    This class represents a core component of the
    Observer pattern. It maintains a list of listeners for different event types and
    provides methods to register, unregister, and notify these listeners.
    """

    def __init__(self):
        """
        Initialize an instance of Observable.

        :attribute listeners: A dictionary to hold lists of listener functions
                              for each event type.
        """

        self.listeners = {}  # The listeners dictionary

    def register(self, event_type, listener):
        """
        Register a listener for a specified event type.

        :param event_type: A string representing the type of the event.
        :param listener: The listener function to be called when the event occurs.
        """

        # If the event type is not already in the listeners dictionary, add it
        if event_type not in self.listeners:
            self.listeners[event_type] = set()

        # Add the listener to the list of listeners for this event type
        self.listeners[event_type].add(listener)

    def unregister(self, event_type, listener):
        """
        Unregister a listener for a specified event type.

        :param event_type: A string representing the type of the event.
        :param listener: The listener function to be removed.
        """

        # If the event type is in the listeners dictionary and the listener is in the
        # list for that event type, remove the listener
        if event_type in self.listeners and listener in self.listeners[event_type]:
            self.listeners[event_type].remove(listener)

    def notify(self, event):
        """
        Notify all listeners of a specified event type.

        :param event: An instance of Event.
        """

        # Check if OpenTelemetry tracing is enabled via environment variable
        if os.getenv('OPENTELEMETRY_ENABLED') == 'True':
            tracer = trace.get_tracer(__name__)
            with tracer.start_as_current_span(f"Event: {event.type}") as span:
                span.set_attribute("event.type", event.type)
                span.set_attribute("event.data", str(event.data))  # Ensure this is a string or a simple scalar value

                if event.type in self.listeners:
                    for listener in self.listeners[event.type]:
                        listener(event)  # Call the listener function with the event
        else:
            # If OpenTelemetry is not enabled, just trigger the event normally without tracing
            if event.type in self.listeners:
                for listener in self.listeners[event.type]:
                    listener(event)
