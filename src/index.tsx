import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import RoutingConfig from './routing';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RoutingConfig />
  </StrictMode>,
);
