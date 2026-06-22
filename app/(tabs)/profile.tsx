import * as ImagePicker from 'expo-image-picker';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

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
  const { user } = useAuth();
  const pairState = usePair();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const refreshProfile = useCallback(async () => {
    const { data, error: refreshError } = await getMyProfile(user?.id);

    if (refreshError) {
      setError(refreshError);
      return;
    }

    setProfile(data);
    setFirstName(data?.firstName ?? '');
    setLastName(data?.lastName ?? '');
    setAvatarUrl(data?.avatarUrl ?? null);
  }, [user?.id]);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      const { data, error: loadError } = await getMyProfile(user?.id);

      if (!isMounted) {
        return;
      }

      if (loadError) {
        setError(loadError);
      }

      setProfile(data);
      setFirstName(data?.firstName ?? '');
      setLastName(data?.lastName ?? '');
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
      void refreshProfile();
    }, [refreshProfile]),
  );

  if (loading) {
    return <LoadingOverlay message="Loading profile..." />;
  }

  const myName = getProfileDisplayName(profile);
  const partnerName = pairState.partner ? getProfileDisplayName(pairState.partner) : 'No partner linked';

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
      setSaving(false);
      return;
    }

    await refreshProfile();
    setMessage('Profile updated.');
    setIsEditing(false);
    await pairState.refreshPair();
    setSaving(false);
  };

  return (
    <Screen scrollable>
      <View style={styles.content}>
        <View style={styles.profileHeader}>
          <Avatar imageUrl={avatarUrl} label={myName} size={112} />
          <AppText variant="title">{myName}</AppText>
          {profile?.email ? <AppText color="muted">{profile.email}</AppText> : null}
        </View>

        <View style={styles.panel}>
          <AppText variant="subtitle">Profile details</AppText>
          <AppText color="muted">Update your avatar and display name.</AppText>
          <View style={styles.actions}>
            <Button disabled={saving || uploadingAvatar} loading={uploadingAvatar} onPress={handleChooseAvatar} variant="secondary">
              Change avatar
            </Button>
            <Button disabled={saving || uploadingAvatar} onPress={() => setIsEditing((current) => !current)} variant="ghost">
              {isEditing ? 'Close edit' : 'Edit name'}
            </Button>
          </View>
          {isEditing ? (
            <View style={styles.editForm}>
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
              <Button disabled={saving || uploadingAvatar} loading={saving} onPress={handleSave}>
                Save profile
              </Button>
            </View>
          ) : null}
          {error ? <AppText color="danger">{error}</AppText> : null}
          {message ? <AppText color="success">{message}</AppText> : null}
        </View>

        <View style={styles.panel}>
          <AppText variant="subtitle">Linked partner</AppText>
          {pairState.partner ? (
            <View style={styles.partnerRow}>
              <Avatar imageUrl={pairState.partner.avatarUrl} label={partnerName} />
              <View style={styles.partnerCopy}>
                <AppText variant="subtitle">{partnerName}</AppText>
                <AppText color="muted">
                  {pairState.partner.email || 'Your current paired account'}
                </AppText>
              </View>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <AppText color="muted">No partner is linked to this account yet.</AppText>
              <Button onPress={() => router.push('/pairing')} variant="secondary">
                Open pairing
              </Button>
            </View>
          )}
        </View>

        <View style={styles.linkStack}>
          <PanelLink
            description="Manage sign out, unpairing, and permanent account deletion."
            onPress={() => router.push('/profile/account')}
            title="Account"
          />
          <PanelLink
            description="Privacy policy, terms, and how app data is used."
            onPress={() => router.push('/profile/legal')}
            title="Legal"
          />
        </View>
      </View>
    </Screen>
  );
}

function PanelLink({
  description,
  onPress,
  title,
}: {
  description: string;
  onPress: () => void;
  title: string;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.linkPanel, pressed && styles.pressed]}>
      <View style={styles.linkCopy}>
        <AppText variant="subtitle">{title}</AppText>
        <AppText color="muted">{description}</AppText>
      </View>
      <AppText variant="subtitle">›</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: 10,
  },
  content: {
    gap: 24,
    paddingTop: 20,
  },
  editForm: {
    gap: 12,
  },
  emptyState: {
    gap: 10,
  },
  linkCopy: {
    flex: 1,
    gap: 4,
  },
  linkPanel: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#d9d9d9',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  linkStack: {
    gap: 14,
  },
  panel: {
    backgroundColor: '#ffffff',
    borderColor: '#d9d9d9',
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 16,
  },
  partnerCopy: {
    flex: 1,
    gap: 4,
  },
  partnerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
  },
  pressed: {
    opacity: 0.76,
  },
  profileHeader: {
    alignItems: 'center',
    gap: 12,
    paddingTop: 16,
  },
});
