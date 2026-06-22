import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { AppText } from '../src/components/AppText';
import { Button } from '../src/components/Button';
import { Screen } from '../src/components/Screen';
import { sendPairPhoto } from '../src/lib/photos';
import { useAuth } from '../src/providers/AuthProvider';
import { usePair } from '../src/providers/PairProvider';

export default function CameraScreen() {
  const cameraRef = useRef<CameraView>(null);
  const { user } = useAuth();
  const { pair } = usePair();
  const [permission, requestPermission] = useCameraPermissions();
  const [error, setError] = useState<string | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  if (!permission) {
    return (
      <Screen>
        <View style={styles.center}>
          <AppText>Checking camera permission...</AppText>
        </View>
      </Screen>
    );
  }

  if (!permission.granted) {
    return (
      <Screen>
        <View style={styles.center}>
          <AppText variant="title">Camera access</AppText>
          <AppText color="muted">Enable camera access to send a photo.</AppText>
          <Button onPress={requestPermission}>Allow camera</Button>
          <Button onPress={() => router.back()} variant="ghost">
            Cancel
          </Button>
        </View>
      </Screen>
    );
  }

  const handleCapture = async () => {
    setError(null);
    const photo = await cameraRef.current?.takePictureAsync({
      quality: 0.85,
      skipProcessing: false,
    });

    if (photo?.uri) {
      setPhotoUri(photo.uri);
    }
  };

  const handleSend = async () => {
    if (!pair?.id || !user?.id || !photoUri) {
      setError('You need an active pair before sending photos.');
      return;
    }

    setError(null);
    setSending(true);

    const result = await sendPairPhoto({
      imageUri: photoUri,
      pairId: pair.id,
      senderId: user.id,
    });

    if (result.error) {
      setError(result.error);
      setSending(false);
      return;
    }

    setSending(false);
    router.replace('/(tabs)/photos');
  };

  if (photoUri) {
    return (
      <Screen>
        <View style={styles.previewContent}>
          <Image source={{ uri: photoUri }} style={styles.preview} />
          {error ? <AppText color="danger">{error}</AppText> : null}
          <View style={styles.actions}>
            <Button disabled={sending} loading={sending} onPress={handleSend}>
              Send
            </Button>
            <Button disabled={sending} onPress={() => setPhotoUri(null)} variant="secondary">
              Retake
            </Button>
          </View>
        </View>
      </Screen>
    );
  }

  return (
    <View style={styles.cameraScreen}>
      <CameraView ref={cameraRef} facing="back" style={styles.camera} />
      <View style={styles.cameraOverlay}>
        {error ? <AppText color="inverse">{error}</AppText> : null}
        <View style={styles.captureRow}>
          <Button onPress={() => router.back()} variant="secondary">
            Cancel
          </Button>
          <Button onPress={handleCapture}>Capture</Button>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: 12,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    bottom: 42,
    gap: 14,
    left: 24,
    position: 'absolute',
    right: 24,
  },
  cameraScreen: {
    backgroundColor: '#000000',
    flex: 1,
  },
  captureRow: {
    flexDirection: 'row',
    gap: 12,
  },
  center: {
    flex: 1,
    gap: 16,
    justifyContent: 'center',
  },
  preview: {
    aspectRatio: 3 / 4,
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    width: '100%',
  },
  previewContent: {
    flex: 1,
    gap: 16,
    justifyContent: 'center',
  },
});
