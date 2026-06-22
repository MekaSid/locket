import { useEffect, useState } from 'react';

import { canPlay, getAvailableRow, type Connect4Session } from '../../lib/connect4';
import { getOrCreateConnect4Session, playConnect4Move, startNewConnect4Round, subscribeToConnect4Session } from '../../lib/games';

type StagedMove = {
  column: number;
  row: number;
};

type UseConnect4SessionParams = {
  currentUserId: string | undefined;
  pairId: string | undefined;
};

export function useConnect4Session({ currentUserId, pairId }: UseConnect4SessionParams) {
  const [celebratedWinnerAt, setCelebratedWinnerAt] = useState<string | null>(null);
  const [confettiSeed, setConfettiSeed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Connect4Session | null>(null);
  const [stagedMove, setStagedMove] = useState<StagedMove | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      if (!pairId) {
        if (isMounted) {
          setLoading(false);
        }
        return;
      }

      const result = await getOrCreateConnect4Session(pairId);

      if (!isMounted) {
        return;
      }

      if (result.error) {
        setError(result.error);
      } else {
        setError(null);
        setSession(result.data);
        setStagedMove(null);
      }

      setLoading(false);
    }

    loadSession();

    return () => {
      isMounted = false;
    };
  }, [pairId]);

  useEffect(() => {
    if (!pairId || !session?.id) {
      return undefined;
    }

    const subscription = subscribeToConnect4Session(session.id, async () => {
      const result = await getOrCreateConnect4Session(pairId);

      if (result.error) {
        setError(result.error);
        return;
      }

      setError(null);
      setSession(result.data);
      setStagedMove(null);
    });

    return () => subscription.unsubscribe();
  }, [pairId, session?.id]);

  useEffect(() => {
    const didIWin = session?.winnerUserId === currentUserId;

    if (!didIWin || session?.status !== 'finished' || !session.updatedAt) {
      return;
    }

    if (celebratedWinnerAt === session.updatedAt) {
      return;
    }

    setCelebratedWinnerAt(session.updatedAt);
    setConfettiSeed((value) => value + 1);
  }, [celebratedWinnerAt, currentUserId, session?.status, session?.updatedAt, session?.winnerUserId]);

  const canSelectColumn = (column: number) => {
    const isMyTurn = session?.currentTurnUserId === currentUserId && session?.status === 'active';

    return Boolean(session && isMyTurn && !submitting && canPlay(session.board, column));
  };

  const stageColumn = (column: number) => {
    if (!session || !canSelectColumn(column)) {
      return;
    }

    const targetRow = getAvailableRow(session.board, column);

    if (targetRow < 0) {
      return;
    }

    setError(null);
    setStagedMove({
      column,
      row: targetRow,
    });
  };

  const sendMove = async () => {
    const isMyTurn = session?.currentTurnUserId === currentUserId && session?.status === 'active';

    if (!session || !stagedMove || !isMyTurn || submitting) {
      return;
    }

    setError(null);
    setSubmitting(true);

    const result = await playConnect4Move(session.id, stagedMove.column);

    if (result.error) {
      setError(result.error);
    } else {
      setSession(result.data);
      setStagedMove(null);
    }

    setSubmitting(false);
  };

  const playAgain = async () => {
    if (!session || session.status !== 'finished' || submitting) {
      return;
    }

    setError(null);
    setSubmitting(true);

    const result = await startNewConnect4Round(session.id);

    if (result.error) {
      setError(result.error);
    } else {
      setSession(result.data);
      setStagedMove(null);
    }

    setSubmitting(false);
  };

  return {
    canSelectColumn,
    confettiSeed,
    error,
    loading,
    playAgain,
    sendMove,
    session,
    stagedMove,
    stageColumn,
    submitting,
  };
}
