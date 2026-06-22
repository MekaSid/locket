import * as Haptics from 'expo-haptics';
import { Body, Bodies, Engine, World } from 'matter-js';
import { useEffect, useMemo, useRef, useState } from 'react';
import { PanResponder, type PanResponderGestureState } from 'react-native';

import { buildCupPongRack, CUP_PONG_BALL_RADIUS, CUP_PONG_BOARD_HEIGHT, CUP_PONG_CUP_RADIUS, type CupPongCup } from './constants';

type DragIndicator = {
  x: number;
  y: number;
};

type BallPosition = {
  x: number;
  y: number;
};

type UseCupPongGameParams = {
  boardWidth: number;
};

export function useCupPongGame({ boardWidth }: UseCupPongGameParams) {
  const boardHeight = CUP_PONG_BOARD_HEIGHT;
  const cupLayout = useMemo(() => buildCupPongRack(boardWidth), [boardWidth]);
  const [ballPosition, setBallPosition] = useState<BallPosition>(() => createBallStartPosition(boardWidth));
  const [cups, setCups] = useState<CupPongCup[]>(cupLayout);
  const [dragIndicator, setDragIndicator] = useState<DragIndicator | null>(null);
  const [message, setMessage] = useState('Swipe up from the ball to flick it toward the rack.');
  const [remainingCups, setRemainingCups] = useState(cupLayout.length);
  const [shotsTaken, setShotsTaken] = useState(0);
  const ballRef = useRef<Body | null>(null);
  const ballReadyRef = useRef(true);
  const cupsRef = useRef<CupPongCup[]>(cupLayout);
  const engineRef = useRef<Engine | null>(null);
  const lowSpeedFramesRef = useRef(0);
  const resolvingShotRef = useRef(false);

  useEffect(() => {
    const nextRack = buildCupPongRack(boardWidth);
    cupsRef.current = nextRack;
    setCups(nextRack);
    setRemainingCups(nextRack.length);
    setBallPosition(createBallStartPosition(boardWidth));
    setMessage('Swipe up from the ball to flick it toward the rack.');
  }, [boardWidth]);

  useEffect(() => {
    const engine = Engine.create({
      gravity: { x: 0, y: 0 },
    });
    engineRef.current = engine;

    const startPosition = createBallStartPosition(boardWidth);
    const ball = Bodies.circle(startPosition.x, startPosition.y, CUP_PONG_BALL_RADIUS, {
      friction: 0.003,
      frictionAir: 0.022,
      restitution: 0.88,
      slop: 0.01,
    });

    const wallThickness = 24;
    const walls = [
      Bodies.rectangle(boardWidth / 2, -wallThickness / 2, boardWidth, wallThickness, { isStatic: true }),
      Bodies.rectangle(boardWidth / 2, boardHeight + (wallThickness / 2), boardWidth, wallThickness, { isStatic: true }),
      Bodies.rectangle(-wallThickness / 2, boardHeight / 2, wallThickness, boardHeight, { isStatic: true }),
      Bodies.rectangle(boardWidth + (wallThickness / 2), boardHeight / 2, wallThickness, boardHeight, { isStatic: true }),
    ];

    ballRef.current = ball;
    World.add(engine.world, [ball, ...walls]);

    let animationFrame = 0;
    let lastTimestamp = 0;

    const tick = (timestamp: number) => {
      if (!lastTimestamp) {
        lastTimestamp = timestamp;
      }

      const delta = Math.min(timestamp - lastTimestamp, 32);
      lastTimestamp = timestamp;
      Engine.update(engine, delta);

      const activeBall = ballRef.current;

      if (activeBall) {
        const nextPosition = { x: activeBall.position.x, y: activeBall.position.y };
        const speed = Math.hypot(activeBall.velocity.x, activeBall.velocity.y);

        setBallPosition(nextPosition);
        checkCupScore(nextPosition, speed);
        checkShotEnd(nextPosition, speed);
      }

      animationFrame = requestAnimationFrame(tick);
    };

    animationFrame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animationFrame);
      World.clear(engine.world, false);
      Engine.clear(engine);
      ballRef.current = null;
      engineRef.current = null;
    };
  }, [boardHeight, boardWidth]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (event) => {
          return ballReadyRef.current && isNearBall(event.nativeEvent.locationX, event.nativeEvent.locationY, ballPosition);
        },
        onPanResponderGrant: (event) => {
          if (!ballReadyRef.current) {
            return;
          }

          setDragIndicator({
            x: event.nativeEvent.locationX,
            y: event.nativeEvent.locationY,
          });
        },
        onPanResponderMove: (event) => {
          if (!ballReadyRef.current) {
            return;
          }

          setDragIndicator({
            x: event.nativeEvent.locationX,
            y: event.nativeEvent.locationY,
          });
        },
        onPanResponderRelease: async (_, gestureState) => {
          if (!ballReadyRef.current) {
            setDragIndicator(null);
            return;
          }

          const didLaunch = launchBall(gestureState);
          setDragIndicator(null);

          if (didLaunch) {
            await Haptics.selectionAsync();
          }
        },
        onPanResponderTerminate: () => {
          setDragIndicator(null);
        },
      }),
    [ballPosition],
  );

  const resetRound = async () => {
    const nextRack = buildCupPongRack(boardWidth);
    cupsRef.current = nextRack;
    setCups(nextRack);
    setRemainingCups(nextRack.length);
    setShotsTaken(0);
    ballReadyRef.current = true;
    resolvingShotRef.current = false;
    lowSpeedFramesRef.current = 0;
    setMessage('Swipe up from the ball to flick it toward the rack.');
    repositionBall();
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return {
    ballPosition,
    boardHeight,
    cups,
    dragIndicator,
    message,
    panHandlers: panResponder.panHandlers,
    remainingCups,
    resetRound,
    shotsTaken,
  };

  function launchBall(gestureState: PanResponderGestureState) {
    const activeBall = ballRef.current;

    if (!activeBall) {
      return false;
    }

    if (gestureState.dy > -14) {
      return false;
    }

    const velocityX = clamp((gestureState.dx * 0.018) + (gestureState.vx * 1.6), -7, 7);
    const velocityY = clamp((gestureState.dy * 0.025) + (gestureState.vy * 2.2), -13, -3.5);

    Body.setVelocity(activeBall, {
      x: velocityX,
      y: velocityY,
    });

    ballReadyRef.current = false;
    lowSpeedFramesRef.current = 0;
    setShotsTaken((value) => value + 1);
    setMessage('Shot in flight.');
    return true;
  }

  function checkCupScore(position: BallPosition, speed: number) {
    if (resolvingShotRef.current) {
      return;
    }

    const hitCup = cupsRef.current.find((cup) => {
      return distance(position.x, position.y, cup.x, cup.y) <= CUP_PONG_CUP_RADIUS - 2;
    });

    if (!hitCup) {
      return;
    }

    resolvingShotRef.current = true;
    cupsRef.current = cupsRef.current.filter((cup) => cup.id !== hitCup.id);
    setCups(cupsRef.current);
    setRemainingCups(cupsRef.current.length);
    setMessage(cupsRef.current.length === 0 ? 'Rack cleared.' : 'Bucket. Line up the next one.');

    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    if (speed > 0) {
      freezeBall();
    }

    setTimeout(() => {
      if (cupsRef.current.length === 0) {
        void resetRound();
        return;
      }

      resolvingShotRef.current = false;
      repositionBall();
      ballReadyRef.current = true;
    }, 550);
  }

  function checkShotEnd(position: BallPosition, speed: number) {
    if (ballReadyRef.current || resolvingShotRef.current) {
      return;
    }

    if (speed < 0.18) {
      lowSpeedFramesRef.current += 1;
    } else {
      lowSpeedFramesRef.current = 0;
    }

    if (lowSpeedFramesRef.current < 10) {
      return;
    }

    if (position.y < boardHeight * 0.3) {
      return;
    }

    resolvingShotRef.current = true;
    setMessage('Missed. Set the next shot.');
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setTimeout(() => {
      repositionBall();
      ballReadyRef.current = true;
      resolvingShotRef.current = false;
    }, 450);
  }

  function repositionBall() {
    const activeBall = ballRef.current;
    const startPosition = createBallStartPosition(boardWidth);

    if (!activeBall) {
      return;
    }

    Body.setPosition(activeBall, startPosition);
    Body.setVelocity(activeBall, { x: 0, y: 0 });
    Body.setAngle(activeBall, 0);
    Body.setAngularVelocity(activeBall, 0);
    setBallPosition(startPosition);
    lowSpeedFramesRef.current = 0;
  }

  function freezeBall() {
    const activeBall = ballRef.current;

    if (!activeBall) {
      return;
    }

    Body.setVelocity(activeBall, { x: 0, y: 0 });
    Body.setAngularVelocity(activeBall, 0);
  }
}

function createBallStartPosition(boardWidth: number): BallPosition {
  return {
    x: boardWidth / 2,
    y: CUP_PONG_BOARD_HEIGHT - 70,
  };
}

function isNearBall(x: number, y: number, ballPosition: BallPosition) {
  return distance(x, y, ballPosition.x, ballPosition.y) <= CUP_PONG_BALL_RADIUS * 2.5;
}

function distance(ax: number, ay: number, bx: number, by: number) {
  return Math.hypot(ax - bx, ay - by);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
