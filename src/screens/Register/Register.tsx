import {
	TouchableOpacity,
	View,
	TextInput,
	Text,
	ActivityIndicator,
} from 'react-native';
import { register } from '@/controllers/users';
import { useTranslation } from 'react-i18next';
import { SafeScreen } from '@/components/template';
import { useTheme } from '@/theme';
import { ImageVariant } from '@/components/atoms';
import { useState } from 'react';
import { useStorage } from '@/storage/StorageContext';
import SendImage from '@/theme/assets/images/send.png';
import { isImageSourcePropType } from '@/types/guards/image';

function Register() {
	const { t } = useTranslation(['register']);
	const storage = useStorage();
	const { colors, layout, gutters, components } = useTheme();
	const [name, setName] = useState<string>('');
	const [password, setPassword] = useState<string>('');
	const [repeat, setRepeat] = useState<string>('');
	const { mutate, isPending, isSuccess, error, data } = register();

	const addUser = () => {
		if (name.trim()) {
			mutate({ name, password });
			storage.set('user', name);
			setName('');
			setPassword('');
			setRepeat('');
		}
	};
	if (!isImageSourcePropType(SendImage)) {
		throw new Error('Image source is not valid');
	}
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
							placeholder={t('register:user')}
						/>

						<TextInput
							style={components.textInputRounded}
							multiline
							value={password}
							onChangeText={setPassword}
							placeholder={t('register:password')}
						/>
					</View>
					<TextInput
						style={components.textInputRounded}
						multiline
						value={repeat}
						onChangeText={setRepeat}
						placeholder={t('register:repeat')}
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
						onPress={() => addUser()}
					>
						{isPending ? (
							<ActivityIndicator />
						) : (
							<ImageVariant
								source={SendImage}
								style={{ tintColor: colors.purple500 }}
							/>
						)}
					</TouchableOpacity>
				</View>
				{isSuccess && (
					<View>
						<Text>Registration successful!</Text>
						<Text>{JSON.stringify(data)}</Text>
					</View>
				)}
				{error && (
					<View>
						<Text>Error: {error.message}</Text>
					</View>
				)}
			</View>
		</SafeScreen>
	);
}

export default Register;
