import { instance } from '@/services/instance';
import Task, { FetchedTask } from '@/types/schemas/task';
import { objectToCamel, objectToSnake } from 'ts-case-convert/lib/caseConvert';

const convertToTask = (fetchedTask: FetchedTask): Task =>
	// eslint-disable-next-line no-underscore-dangle
	objectToCamel({ ...fetchedTask, id: fetchedTask._id, _id: undefined });
export const saveTask = async (task: Task, token: string): Promise<Task> => {
	const response = await instance.post('tasks', {
		json: { ...objectToSnake(task) },
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json',
		},
	});
	const responseData = await response.json();
	return convertToTask(responseData as FetchedTask);
};
export const saveTasks = async (
	tasks: Task[],
	token: string,
): Promise<Task[]> => {
	const taskPromises = tasks.map(task => saveTask(task, token));
	return Promise.all(taskPromises);
};

export const getTasks = async (token: string): Promise<Task[]> => {
	const response = await instance.get('tasks', {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
	const responseData: FetchedTask[] = await response.json<FetchedTask[]>();
	return responseData.map((task: FetchedTask) => convertToTask(task));
};

export const removeTask = async (id: string, token: string) => {
	await instance.delete(`tasks/${id}`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
};
