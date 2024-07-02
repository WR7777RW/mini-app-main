import { Button, Cell, Image } from '@telegram-apps/telegram-ui'
import React from 'react'
import { useAccount, useDisconnect, useEnsAvatar, useEnsName } from 'wagmi'
import wallet from '../../../public/wallet.png'
export function Account() {
    const { address } = useAccount()
    const { disconnect } = useDisconnect()
    const { data: ensName } = useEnsName({ address })
    const { data: ensAvatar } = useEnsAvatar({ name: ensName! })

    return (


        <Cell onClick={() => disconnect()}
            before={<Image src={wallet} style={{ backgroundColor: '#007AFF' }} />}
            subtitle={address}
        >
            Disconnect
        </Cell>
    )
}