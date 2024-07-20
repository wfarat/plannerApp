import {
	Text,
	TouchableOpacity,
	View,
	TextInput,
	ListRenderItem,
	FlatList,
} from 'react-native';

import { useTranslation } from 'react-i18next';
import { SafeScreen } from '@/components/template';
import { useTheme } from '@/theme';
import { ImageVariant } from '@/components/atoms';
import { useEffect, useState } from 'react';
import { useStorage } from '@/storage/StorageContext';
import SendImage from '@/theme/assets/images/send.png';
import { Goal } from '@/types/schemas/goal';

function Goals() {
	const { t } = useTranslation(['goals']);
	const storage = useStorage();
	const { colors, layout, gutters, borders, components } = useTheme();
	const [name, setName] = useState<string>('');
	const [description, setDescription] = useState<string>('');
	const [goals, setGoals] = useState<Goal[]>([]);
	useEffect(() => {
		const storedTasks = storage.getString('tasks');
		if (storedTasks) {
			setGoals(JSON.parse(storedTasks) as Goal[]);
		}
	}, []);

	const addGoal = () => {
		if (name.trim()) {
			const goal = { name, description };
			const updatedTasks = [...goals, goal];
			setGoals(updatedTasks);
			storage.set('tasks', JSON.stringify(updatedTasks));
			setName('');
			setDescription('');
		}
	};
	const renderItem: ListRenderItem<Goal> = ({ item }: { item: Goal }) => (
		<View
			style={[
				gutters.marginBottom_16,
				borders.gray400,
				borders.w_1,
				layout.fullWidth,
			]}
		>
			<Text>{item.name}</Text>
			<Text>{item.description}</Text>
		</View>
	);
	return (
		<SafeScreen>
			<View
				style={[
					layout.justifyCenter,
					layout.itemsCenter,
					gutters.marginTop_120,
				]}
			>
				<View style={[gutters.paddingHorizontal_32]}>
					<View>
						<TextInput
							style={components.textInputRounded}
							value={name}
							onChangeText={setName}
							placeholder={t('goals:title')}
						/>

						<TextInput
							style={components.textInputRounded}
							multiline
							value={description}
							onChangeText={setDescription}
							placeholder={t('goals:description')}
						/>
					</View>

					<View
						style={[
							layout.row,
							layout.justifyBetween,
							layout.fullWidth,
							gutters.marginTop_16,
						]}
					>
						<TouchableOpacity
							testID="change-language-button"
							style={[components.buttonCircle, gutters.marginBottom_16]}
							onPress={() => addGoal()}
						>
							<ImageVariant
								source={SendImage}
								style={{ tintColor: colors.purple500 }}
							/>
						</TouchableOpacity>
					</View>
					<View>
						<FlatList
							data={goals}
							keyExtractor={(item, index) => index.toString()}
							renderItem={renderItem}
						/>
					</View>
				</View>
			</View>
		</SafeScreen>
	);
}

export default Goals;
