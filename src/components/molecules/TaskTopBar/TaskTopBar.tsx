import { View, TouchableOpacity } from 'react-native';
import { useTheme } from '@/theme';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

type TaskTopBarProps = {
	onDelete: () => void;
	onFinish?: () => void;
	onEdit: () => void;
	isCompletionPossible?: boolean;
};

function TaskTopBar({
	onDelete,
	onEdit,
	onFinish = undefined,
	isCompletionPossible = undefined,
}: TaskTopBarProps) {
	const { layout, gutters, colors } = useTheme();

	return (
		<View style={[layout.absolute, layout.itemsCenter, layout.top0]}>
			<View
				style={[
					layout.row,
					layout.justifyBetween,
					layout.fullWidth,
					gutters.padding_32,
				]}
			>
				<TouchableOpacity onPress={onDelete}>
					<MaterialCommunityIcons
						name="delete"
						size={20}
						color={colors.gray400}
					/>
				</TouchableOpacity>
				<TouchableOpacity onPress={onEdit}>
					<MaterialCommunityIcons
						name="pencil-box"
						size={20}
						color={colors.gray400}
					/>
				</TouchableOpacity>
				{onFinish && isCompletionPossible && (
					<TouchableOpacity onPress={onFinish} disabled={!isCompletionPossible}>
						<MaterialCommunityIcons
							name="check"
							size={20}
							color={isCompletionPossible ? 'green' : 'red'}
						/>
					</TouchableOpacity>
				)}
			</View>
		</View>
	);
}

export default TaskTopBar;
