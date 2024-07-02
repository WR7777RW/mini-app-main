import { SDKProvider, useLaunchParams } from '@tma.js/sdk-react';
import { type FC } from 'react';
import { WagmiProvider } from 'wagmi'
import { optimismSepolia } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { http, createConfig } from 'wagmi'
import { walletConnect } from 'wagmi/connectors'
import { App } from './App';
import { ErrorBoundary } from './ErrorBoundary';
import dotenv from 'dotenv';

export const config = createConfig({

  chains: [optimismSepolia],
  connectors: [
    walletConnect({ projectId: process.env.WC_PROJECT_ID! }),
  ],

  transports: {
    [optimismSepolia.id]: http(),
  },
})

const ErrorBoundaryError: FC<{ error: unknown }> = ({ error }) => (
  <div>
    <p>An unhandled error occurred:</p>
    <blockquote>
      <code>
        {error instanceof Error
          ? error.message
          : typeof error === 'string'
            ? error
            : JSON.stringify(error)}
      </code>
    </blockquote>
  </div>
);

const Inner: FC = () => {
  const debug = useLaunchParams().startParam === 'debug';
  const queryClient = new QueryClient()
  return (
    <SDKProvider acceptCustomStyles debug={debug}>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </WagmiProvider>
    </SDKProvider>
  );
};

export const Root: FC = () => (
  <ErrorBoundary fallback={ErrorBoundaryError}>
    <Inner />
  </ErrorBoundary>
);
