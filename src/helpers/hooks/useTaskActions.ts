import { Task } from '@/types/schemas';
import { useStorage } from '@/storage/StorageContext';
import { addTaskMutation } from '@/controllers/goals';

export const useTaskActions = (
	goalId: number,
	parentId?: number | undefined,
	taskId?: number | undefined,
) => {
	const storage = useStorage();
	const { mutateAsync } = addTaskMutation();
	const storageString = (target?: number) => {
		return target ? `goals.${goalId}.${target}` : `goals.${goalId}`;
	};
	const storedId = storage.getNumber(`goals.${goalId}.lastId`);
	const lastId = storedId || 0;
	const storedTasks = storage.getString(storageString(parentId));
	let tasks: Task[] = [];
	if (storedTasks) {
		tasks = JSON.parse(storedTasks) as Task[];
	}
	const updateTasks = (updatedTasks: Task[], target?: number) => {
		storage.set(storageString(target), JSON.stringify(updatedTasks));
	};

	const deleteTask = () => {
		const updatedTasks = tasks.filter(t => t.taskId !== taskId);
		updateTasks(updatedTasks, parentId);
	};

	const finishTask = () => {
		const updatedTasks = tasks.map(t =>
			t.taskId === taskId ? { ...t, completed: true } : t,
		);
		updateTasks(updatedTasks, parentId);
	};

	const editTask = (newName: string, newDescription: string) => {
		const updatedTasks = tasks.map(t =>
			t.taskId === taskId
				? { ...t, name: newName, description: newDescription }
				: t,
		);
		updateTasks(updatedTasks, parentId);
	};

	const addTask = async (
		oldTasks: Task[],
		name: string,
		description: string,
		durationTime?: number,
		dueDate?: Date,
	) => {
		const duration = durationTime
			? { base: durationTime, elapsed: 0 }
			: undefined;
		const newTask = {
			name,
			description,
			goalId,
			taskId: lastId + 1,
			parentId: taskId,
			duration,
			dueDate,
			completed: false,
		};
		storage.set(`goals.${goalId}.lastId`, lastId + 1);
		const updatedTasks = [...oldTasks, newTask];
		const token = storage.getString('token');
		if (token) {
			try {
				// Use mutateAsync and await the result
				const savedTask = await mutateAsync({ task: newTask, token });
				const tasksWithSavedTask = [...oldTasks, savedTask];
				updateTasks(tasksWithSavedTask, taskId);
				console.log(savedTask); // Log the data for debugging
				return tasksWithSavedTask; // Return the updated tasks
			} catch (error) {
				console.error('Failed to save task to backend:', error);
				// Fallback to local update if mutation fails
				updateTasks(updatedTasks, taskId);
			}
		}
		updateTasks(updatedTasks, taskId);
		return updatedTasks;
	};
	const findMostImportantTask = (): Task | null => {
		const traverseTasks = (list: Task[]): Task | null => {
			return list.reduce<Task | null>((result, task) => {
				if (result) {
					return result;
				}
				if (!task.completed) {
					const tasksData = storage.getString(`goals.${goalId}.${task.taskId}`);
					if (tasksData) {
						const subTasks = JSON.parse(tasksData) as Task[];
						if (subTasks.length === 0) {
							return task;
						}
						return traverseTasks(subTasks) || task;
					}
					return task;
				}
				return null;
			}, null);
		};
		return traverseTasks(tasks);
	};
	const findImportantTasks = (freeMinutes: number): Task[] => {
		const allocatedTaskIds = new Set<number>();
		const traverseTasks = (list: Task[]): Task | null => {
			return list.reduce<Task | null>((result, task) => {
				if (result) return result;

				if (!task.completed && !allocatedTaskIds.has(task.taskId)) {
					const tasksData = storage.getString(
						`goals.${task.goalId}.${task.taskId}`,
					);
					if (tasksData) {
						const subTasks = JSON.parse(tasksData) as Task[];
						if (subTasks.length === 0) return task;
						return traverseTasks(subTasks) || task;
					}

					if (!task.duration || task.duration.elapsed < task.duration.base) {
						return task;
					}
				}

				return null;
			}, null);
		};

		const importantTasks = [];
		let task = traverseTasks(tasks);
		let remainingMinutes = freeMinutes;
		while (task && remainingMinutes > 0) {
			importantTasks.push(task);
			allocatedTaskIds.add(task.taskId);
			if (task.duration)
				remainingMinutes -= task.duration.base - task.duration.elapsed;
			task = traverseTasks(tasks);
		}

		return importantTasks;
	};
	interface TaskCount {
		completed: number;
		total: number;
	}
	const countTasks = (taskArray: Task[]) => {
		const counts: TaskCount = { completed: 0, total: 0 };

		taskArray.forEach(task => {
			counts.total += 1;
			if (task.completed) {
				counts.completed += 1;
			}
			const tasksData = storage.getString(`goals.${goalId}.${task.taskId}`);
			if (tasksData) {
				const subTasks = JSON.parse(tasksData) as Task[];
				const subtaskCounts = countTasks(subTasks);
				counts.completed += subtaskCounts.completed;
				counts.total += subtaskCounts.total;
			}
		});

		return counts;
	};

	return {
		deleteTask,
		finishTask,
		editTask,
		addTask,
		countTasks,
		updateTasks,
		findMostImportantTask,
		findImportantTasks,
	};
};
