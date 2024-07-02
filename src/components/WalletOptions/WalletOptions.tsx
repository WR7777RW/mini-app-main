import { Button, Cell, Image } from '@telegram-apps/telegram-ui'
import * as React from 'react'
import { Connector, useConnect } from 'wagmi'
import wallet from '../../../public/wallet.png'

export function WalletOptions() {
    const { connectors, connect } = useConnect()

    return connectors.map((connector) => (
        <><Cell before={
            <Image src={wallet} style={{ backgroundColor: '#007AFF' }} />}
            key={connector.uid} onClick={() => connect({ connector })}>
            Connect Wallet
        </Cell></>
    ))
}