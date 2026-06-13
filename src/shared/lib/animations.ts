import type { WithSpringConfig, WithTimingConfig } from 'react-native-reanimated';

export const SPRING_SNAP: WithSpringConfig = {
  damping: 18,
  stiffness: 220,
  mass: 0.9,
};

export const SPRING_SOFT: WithSpringConfig = {
  damping: 22,
  stiffness: 170,
  mass: 1,
};

export const SPRING_BOUNCY: WithSpringConfig = {
  damping: 12,
  stiffness: 200,
  mass: 0.8,
};

export const TIMING_DEFAULT: WithTimingConfig = {
  duration: 250,
};

export const TIMING_FAST: WithTimingConfig = {
  duration: 150,
};

export const SPRING_PRESS: WithSpringConfig = {
  damping: 15,
  stiffness: 400,
  mass: 0.6,
};
