"use client"

import { wagmiAdapter, projectId } from "@/config"
import { createAppKit } from "@reown/appkit"
import { sepolia } from "@reown/appkit/networks"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { type ReactNode } from "react";
import { cookieToInitialState, WagmiProvider, type Config } from "wagmi";


const queryClient = new QueryClient();

if (!projectId) {
    throw new Error('Project ID is not defined');
}

const metadata = {
    name: "KLEROS-RPSLS-TASK",
    description: "Rock, Paper, Scissors, Lizard, Spock",
    url: "",
    icons: [""]
}

const modal = createAppKit({
    adapters: [wagmiAdapter],
    projectId,
    networks: [sepolia],
    defaultNetwork: sepolia,
    features: {
        analytics: true,
        email: true,
        socials: ['google', 'x', 'github', 'discord', 'farcaster'],
        emailShowWallets: true
    },
    themeMode: 'light'
})

function ContextProvider({ children, cookies } : { children: ReactNode; cookies: string | null }) {
    const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies)

    return (
        <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </WagmiProvider>
    )
}

export default ContextProvider