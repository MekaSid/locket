import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '../../src/components/AppText';
import { Button } from '../../src/components/Button';
import { LoadingOverlay } from '../../src/components/LoadingOverlay';
import { PhotoMessageCard } from '../../src/components/PhotoMessageCard';
import { Screen } from '../../src/components/Screen';
import { getPairPhotoOpenUrl, listPairPhotos, markPairPhotoViewed, type PairPhoto } from '../../src/lib/photos';
import { supabase } from '../../src/lib/supabase';
import { useAuth } from '../../src/providers/AuthProvider';
import { usePair } from '../../src/providers/PairProvider';

type OpenPhotoState = {
  photo: PairPhoto;
  url: string;
};

export default function PhotosScreen() {
  const { user } = useAuth();
  const { pair, partner } = usePair();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<PairPhoto[]>([]);
  const [openPhoto, setOpenPhoto] = useState<OpenPhotoState | null>(null);
  const [openingPhotoId, setOpeningPhotoId] = useState<string | null>(null);

  const refreshPhotos = useCallback(async () => {
    if (!pair?.id) {
      setMessages([]);
      setLoading(false);
      return;
    }

    const result = await listPairPhotos(pair.id);

    if (result.error) {
      setError(result.error);
    } else {
      setError(null);
      setMessages(result.data);
    }

    setLoading(false);
  }, [pair?.id]);

  useEffect(() => {
    refreshPhotos();
  }, [refreshPhotos]);

  useEffect(() => {
    if (!pair?.id || !supabase) {
      return undefined;
    }

    const client = supabase;
    const channel = client
      .channel(`pair-photos-thread-${pair.id}-${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pair_photos',
          filter: `pair_id=eq.${pair.id}`,
        },
        () => {
          refreshPhotos();
        },
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [pair?.id, refreshPhotos]);

  const threadedMessages = useMemo(() => {
    return messages.map((photo) => {
      const isOutgoing = photo.senderId === user?.id;
      const isOpened = Boolean(photo.viewedAt);

      return {
        ...photo,
        isOpened,
        isOutgoing,
        canOpen: !isOutgoing && !isOpened,
      };
    });
  }, [messages, user?.id]);

  const handleOpenPhoto = async (photo: PairPhoto) => {
    if (photo.senderId === user?.id || photo.viewedAt) {
      return;
    }

    setError(null);
    setOpeningPhotoId(photo.id);

    const result = await getPairPhotoOpenUrl(photo.storagePath);

    if (result.error || !result.data) {
      setError(result.error || 'Could not open photo.');
      setOpeningPhotoId(null);
      return;
    }

    setOpenPhoto({
      photo,
      url: result.data,
    });
    setOpeningPhotoId(null);
  };

  const handleCloseOpenedPhoto = async () => {
    if (!openPhoto) {
      return;
    }

    const photoId = openPhoto.photo.id;
    setOpenPhoto(null);

    const result = await markPairPhotoViewed(photoId);

    if (result.error) {
      setError(result.error);
      return;
    }

    setMessages((current) =>
      current.map((photo) => (photo.id === photoId ? { ...photo, viewedAt: new Date().toISOString() } : photo)),
    );
  };

  if (loading) {
    return <LoadingOverlay message="Loading photos..." />;
  }

  return (
    <>
      <Screen scrollable>
        <View style={styles.header}>
          <AppText variant="eyebrow">Photo exchange</AppText>
          <AppText variant="title">Photos</AppText>
          <AppText color="muted">Take a photo, preview it, send it, and let your partner open it once.</AppText>
        </View>

        <View style={styles.thread}>
          {error ? <AppText color="danger">{error}</AppText> : null}

          {threadedMessages.length === 0 ? (
            <View style={styles.emptyState}>
              <AppText color="muted">No photo messages yet.</AppText>
            </View>
          ) : null}

          {threadedMessages.map((photo) => (
            <PhotoMessageCard
              disabled={!photo.canOpen && !photo.isOutgoing}
              key={photo.id}
              onPress={photo.canOpen ? () => handleOpenPhoto(photo) : undefined}
              stateLabel={getStateLabel({
                isOpened: photo.isOpened,
                isOutgoing: photo.isOutgoing,
                isOpening: openingPhotoId === photo.id,
              })}
              subtitle={getSubtitle({
                isOpened: photo.isOpened,
                isOutgoing: photo.isOutgoing,
                partnerName: partner?.firstName || 'Your partner',
              })}
              title={photo.isOutgoing ? 'Sent photo' : 'Photo message'}
            />
          ))}

          <View style={styles.composePanel}>
            <Button onPress={() => router.push('/camera')}>Open camera</Button>
          </View>
        </View>
      </Screen>

      <Modal animationType="fade" onRequestClose={handleCloseOpenedPhoto} transparent visible={Boolean(openPhoto)}>
        <View style={styles.modalBackdrop}>
          <Pressable onPress={handleCloseOpenedPhoto} style={styles.modalCloseArea} />
          {openPhoto ? <Image source={{ uri: openPhoto.url }} style={styles.fullScreenPhoto} /> : null}
          <View style={styles.modalFooter}>
            <Button onPress={handleCloseOpenedPhoto} variant="secondary">
              Close
            </Button>
          </View>
        </View>
      </Modal>
    </>
  );
}

function getStateLabel(params: { isOpened: boolean; isOpening: boolean; isOutgoing: boolean }) {
  const { isOpened, isOpening, isOutgoing } = params;

  if (isOpening) {
    return 'Opening';
  }

  if (isOutgoing) {
    return isOpened ? 'Opened' : 'Delivered';
  }

  return isOpened ? 'Opened' : 'Tap to open';
}

function getSubtitle(params: { isOpened: boolean; isOutgoing: boolean; partnerName: string }) {
  const { isOpened, isOutgoing, partnerName } = params;

  if (isOutgoing) {
    return isOpened ? `${partnerName} opened this photo.` : `Waiting for ${partnerName.toLowerCase()} to open it.`;
  }

  return isOpened ? 'This photo has already been opened.' : `${partnerName} sent you a photo.`;
}

const styles = StyleSheet.create({
  composePanel: {
    marginTop: 10,
    paddingBottom: 24,
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#d9d9d9',
    borderRadius: 8,
    borderWidth: 1,
    padding: 20,
  },
  fullScreenPhoto: {
    flex: 1,
    resizeMode: 'contain',
    width: '100%',
  },
  header: {
    gap: 8,
    paddingTop: 20,
  },
  modalBackdrop: {
    backgroundColor: '#000000',
    flex: 1,
    justifyContent: 'center',
  },
  modalCloseArea: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  modalFooter: {
    left: 24,
    position: 'absolute',
    right: 24,
    bottom: 42,
  },
  thread: {
    gap: 14,
    marginTop: 28,
  },
});
