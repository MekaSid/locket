import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '../../src/components/AppText';
import { Avatar } from '../../src/components/Avatar';
import { Button } from '../../src/components/Button';
import { LoadingOverlay } from '../../src/components/LoadingOverlay';
import { Screen } from '../../src/components/Screen';
import { TextField } from '../../src/components/TextField';
import {
  getMyProfile,
  getProfileDisplayName,
  saveMyProfileAvatarPath,
  updateMyProfile,
  uploadProfileAvatar,
  type Profile,
} from '../../src/lib/profiles';
import { useAuth } from '../../src/providers/AuthProvider';
import { usePair } from '../../src/providers/PairProvider';

export default function ProfileScreen() {
  const { signOut, user } = useAuth();
  const pairState = usePair();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [avatarPath, setAvatarPath] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [profileLoadError, setProfileLoadError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      const { data, error: loadError } = await getMyProfile(user?.id);

      if (!isMounted) {
        return;
      }

      if (loadError) {
        setProfileLoadError(loadError);
      } else {
        setProfileLoadError(null);
      }

      setProfile(data);
      setFirstName(data?.firstName ?? '');
      setLastName(data?.lastName ?? '');
      setAvatarPath(data?.avatarPath ?? '');
      setAvatarUrl(data?.avatarUrl ?? null);
      setLoading(false);
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function refreshProfile() {
        const { data } = await getMyProfile(user?.id);

        if (!isActive || !data) {
          return;
        }

        setProfile(data);
        setAvatarPath(data.avatarPath ?? '');
        setAvatarUrl(data.avatarUrl ?? null);
      }

      refreshProfile();

      return () => {
        isActive = false;
      };
    }, [user?.id]),
  );

  if (loading) {
    return <LoadingOverlay message="Loading profile..." />;
  }

  const myName = getProfileDisplayName(profile);
  const partnerName = getProfileDisplayName(pairState.partner);

  const refreshProfile = async () => {
    const { data, error: refreshError } = await getMyProfile(user?.id);

    if (refreshError) {
      setProfileLoadError(refreshError);
      return;
    }

    setProfileLoadError(null);
    setProfile(data);
    setFirstName(data?.firstName ?? '');
    setLastName(data?.lastName ?? '');
    setAvatarPath(data?.avatarPath ?? '');
    setAvatarUrl(data?.avatarUrl ?? null);
  };

  const handleChooseAvatar = async () => {
    if (!user?.id) {
      return;
    }

    setError(null);
    setMessage(null);
    setUploadingAvatar(true);

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setError('Photo library permission is required to choose a profile picture.');
      setUploadingAvatar(false);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      mediaTypes: ['images'],
      quality: 0.85,
    });

    if (result.canceled) {
      setUploadingAvatar(false);
      return;
    }

    const asset = result.assets[0];
    const upload = await uploadProfileAvatar({
      mimeType: asset.mimeType,
      uri: asset.uri,
      userId: user.id,
    });

    if (upload.error || !upload.data) {
      setError(upload.error ?? 'Could not upload profile picture.');
      setUploadingAvatar(false);
      return;
    }

    const save = await saveMyProfileAvatarPath(upload.data);

    if (save.error) {
      setError(save.error);
      setUploadingAvatar(false);
      return;
    }

    setProfile(save.data);
    setAvatarPath(save.data?.avatarPath ?? '');
    setAvatarUrl(save.data?.avatarUrl ?? asset.uri);
    setMessage('Profile picture updated.');
    await pairState.refreshPair();
    setUploadingAvatar(false);
  };

  const handleSave = async () => {
    if (!user?.id) {
      return;
    }

    setError(null);
    setMessage(null);
    setSaving(true);

    const result = await updateMyProfile(user.id, {
      firstName,
      lastName,
    });

    if (result.error) {
      setError(result.error);
    } else {
      const { data } = await getMyProfile(user.id);
      setProfile(data);
      setAvatarPath(data?.avatarPath ?? '');
      setAvatarUrl(data?.avatarUrl ?? null);
      setMessage('Profile updated.');
      setIsEditing(false);
      await pairState.refreshPair();
    }

    setSaving(false);
  };

  return (
    <Screen scrollable>
      <View style={styles.content}>
        <View style={styles.profile}>
          <Avatar imageUrl={avatarUrl} label={myName} size={112} />
          <AppText variant="title">{myName}</AppText>
          {profileLoadError ? <AppText color="danger">{profileLoadError}</AppText> : null}
          <Button onPress={() => setIsEditing((current) => !current)} variant="secondary">
            {isEditing ? 'Close edit' : 'Edit profile'}
          </Button>
        </View>

        {isEditing ? (
          <View style={styles.panel}>
            <AppText variant="subtitle">Edit profile</AppText>
            <TextField
              autoCapitalize="words"
              label="First name"
              onChangeText={setFirstName}
              placeholder="Sid"
              value={firstName}
            />
            <TextField
              autoCapitalize="words"
              label="Last name"
              onChangeText={setLastName}
              placeholder="Meka"
              value={lastName}
            />
            <View style={styles.avatarEditor}>
              <Avatar imageUrl={avatarUrl} label={myName} />
              <View style={styles.heading}>
                <AppText variant="caption">Profile picture</AppText>
                <Button disabled={uploadingAvatar} loading={uploadingAvatar} onPress={handleChooseAvatar} variant="secondary">
                  Choose photo
                </Button>
              </View>
            </View>
            {error ? <AppText color="danger">{error}</AppText> : null}
            {message ? <AppText color="success">{message}</AppText> : null}
            <Button disabled={saving} loading={saving} onPress={handleSave}>
              Save profile
            </Button>
          </View>
        ) : null}

        <View style={styles.panel}>
          <AppText variant="subtitle">Linked partner</AppText>
          <View style={styles.partnerRow}>
            <Avatar imageUrl={pairState.partner?.avatarUrl} label={partnerName} />
            <AppText variant="subtitle">{partnerName}</AppText>
          </View>
        </View>

        <Button onPress={signOut} variant="secondary">
          Sign out
        </Button>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 28,
    paddingTop: 20,
  },
  profile: {
    alignItems: 'center',
    gap: 12,
    justifyContent: 'center',
    paddingTop: 16,
  },
  heading: {
    flex: 1,
    gap: 4,
  },
  panel: {
    backgroundColor: '#ffffff',
    borderColor: '#d9d9d9',
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 16,
  },
  avatarEditor: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
  },
  partnerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
  },
});
