from main.modules.AgentTask.AgentTaskService import AgentTaskService

class ResetAgentTask:
    command_name = 'resetAgentTask'

    def run(self, args):
        if len(args) < 1:
            print('No ID provided')
            return

        task_id = args[0]
        reset = AgentTaskService.reset_agent_task(task_id)
        if reset:
            print(f'Task ID {task_id} reset to queue!')
        else:
            print(f'Failed resetting task')

        return
