import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import {
  createPairInvite,
  EMPTY_PAIR_SNAPSHOT,
  getMyPair,
  joinPairWithCode,
  normalizeInviteCode,
  type PairSnapshot,
} from '../lib/pairs';
import { getProfileAvatarUrl } from '../lib/profiles';
import { useAuth } from './AuthProvider';

const PENDING_INVITE_STORAGE_KEY = 'locket.pendingInviteCode';

type PairActionResult = {
  error: string | null;
};

type PairContextValue = PairSnapshot & {
  clearPendingInviteCode: () => Promise<void>;
  createInvite: () => Promise<PairActionResult>;
  initialized: boolean;
  joinWithCode: (code: string) => Promise<PairActionResult>;
  pendingInviteCodeFromLink: string | null;
  refreshPair: () => Promise<PairActionResult>;
  setPendingInviteCodeFromLink: (code: string) => Promise<void>;
};

const PairContext = createContext<PairContextValue | undefined>(undefined);

export function PairProvider({ children }: PropsWithChildren) {
  const { initialized: authInitialized, session } = useAuth();
  const [initialized, setInitialized] = useState(false);
  const [snapshot, setSnapshot] = useState<PairSnapshot>(EMPTY_PAIR_SNAPSHOT);
  const [pendingInviteCodeFromLink, setPendingInviteCodeState] = useState<string | null>(null);

  const loadPair = useCallback(async () => {
    const { data, error } = await getMyPair();

    if (!error) {
      setSnapshot(await hydratePairSnapshot(data));
    }

    return { error };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function initialize() {
      if (!authInitialized) {
        return;
      }

      setInitialized(false);
      const storedCode = await AsyncStorage.getItem(PENDING_INVITE_STORAGE_KEY);

      if (!isMounted) {
        return;
      }

      setPendingInviteCodeState(storedCode);

      if (!session) {
        setSnapshot(EMPTY_PAIR_SNAPSHOT);
        setInitialized(true);
        return;
      }

      const { data } = await getMyPair();

      if (isMounted) {
        setSnapshot(await hydratePairSnapshot(data));
        setInitialized(true);
      }
    }

    initialize();

    return () => {
      isMounted = false;
    };
  }, [authInitialized, session]);

  const setPendingInviteCodeFromLink = useCallback(async (code: string) => {
    const nextCode = normalizeInviteCode(code);

    if (!nextCode) {
      return;
    }

    setPendingInviteCodeState(nextCode);
    await AsyncStorage.setItem(PENDING_INVITE_STORAGE_KEY, nextCode);
  }, []);

  const clearPendingInviteCode = useCallback(async () => {
    setPendingInviteCodeState(null);
    await AsyncStorage.removeItem(PENDING_INVITE_STORAGE_KEY);
  }, []);

  const value = useMemo<PairContextValue>(
    () => ({
      ...snapshot,
      clearPendingInviteCode,
      createInvite: async () => {
        const { data, error } = await createPairInvite();

        if (!error) {
          setSnapshot(await hydratePairSnapshot(data));
        }

        return { error };
      },
      initialized,
      joinWithCode: async (code) => {
        const { data, error } = await joinPairWithCode(code);

        if (!error) {
          setSnapshot(await hydratePairSnapshot(data));
          await clearPendingInviteCode();
        }

        return { error };
      },
      pendingInviteCodeFromLink,
      refreshPair: loadPair,
      setPendingInviteCodeFromLink,
    }),
    [
      clearPendingInviteCode,
      initialized,
      loadPair,
      pendingInviteCodeFromLink,
      setPendingInviteCodeFromLink,
      snapshot,
    ],
  );

  return <PairContext.Provider value={value}>{children}</PairContext.Provider>;
}

export function usePair() {
  const context = useContext(PairContext);

  if (!context) {
    throw new Error('usePair must be used inside PairProvider');
  }

  return context;
}

async function hydratePairSnapshot(snapshot: PairSnapshot): Promise<PairSnapshot> {
  if (!snapshot.partner?.avatarPath) {
    return snapshot;
  }

  return {
    ...snapshot,
    partner: {
      ...snapshot.partner,
      avatarUrl: await getProfileAvatarUrl(snapshot.partner.avatarPath),
    },
  };
}
