import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import RoutingConfig from './routing';

// Standalone dev entry only; inside the host the shell's QueryClientProvider is used.
const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RoutingConfig />
    </QueryClientProvider>
  </StrictMode>,
);
