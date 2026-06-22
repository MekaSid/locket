import type { Connect4Session } from '../../lib/connect4';

type DiscAssignments = {
  didIWin: boolean;
  isMyTurn: boolean;
  myBoardValue: 1 | 2;
  myDiscColor: string;
  partnerBoardValue: 1 | 2;
  partnerDiscColor: string;
  winnerBanner: string | null;
};

const PRIMARY_DISC_COLOR = '#ff4d5f';
const SECONDARY_DISC_COLOR = '#111111';

export function getConnect4DiscAssignments(params: {
  currentUserId: string | undefined;
  pairCreatedBy: string | undefined;
  partnerFirstName: string | null | undefined;
  partnerUserId: string | undefined;
  session: Connect4Session | null;
}): DiscAssignments {
  const { currentUserId, pairCreatedBy, partnerFirstName, partnerUserId, session } = params;
  const amPrimaryPlayer = pairCreatedBy === currentUserId;
  const myBoardValue = amPrimaryPlayer ? 1 : 2;
  const partnerBoardValue = amPrimaryPlayer ? 2 : 1;
  const myDiscColor = amPrimaryPlayer ? PRIMARY_DISC_COLOR : SECONDARY_DISC_COLOR;
  const partnerDiscColor = amPrimaryPlayer ? SECONDARY_DISC_COLOR : PRIMARY_DISC_COLOR;
  const isMyTurn = session?.currentTurnUserId === currentUserId && session?.status === 'active';
  const didIWin = session?.winnerUserId === currentUserId;
  const winnerName =
    session?.winnerUserId === currentUserId ? 'You' : session?.winnerUserId === partnerUserId ? partnerFirstName || 'Partner' : null;

  return {
    didIWin,
    isMyTurn,
    myBoardValue,
    myDiscColor,
    partnerBoardValue,
    partnerDiscColor,
    winnerBanner: getWinnerBanner(session, didIWin, winnerName),
  };
}

export function getConnect4HeaderStatus(params: {
  isMyTurn: boolean;
  partnerFirstName: string | null | undefined;
  session: Connect4Session | null;
  winnerBanner: string | null;
}) {
  const { isMyTurn, partnerFirstName, session, winnerBanner } = params;

  if (session?.status === 'finished') {
    return winnerBanner ?? 'Round finished.';
  }

  if (isMyTurn) {
    return 'Your move.';
  }

  return `Waiting for ${partnerFirstName || 'your partner'}.`;
}

function getWinnerBanner(session: Connect4Session | null, didIWin: boolean, winnerName: string | null) {
  if (session?.status !== 'finished') {
    return null;
  }

  if (didIWin) {
    return 'You won.';
  }

  if (winnerName) {
    return `${winnerName} won this round.`;
  }

  return 'Round finished.';
}
