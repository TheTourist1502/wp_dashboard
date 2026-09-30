declare module 'wp_shared/Card' {
  import type { FC, ReactNode } from 'react';

  export const Card: FC<{ title: string; children?: ReactNode }>;
}
