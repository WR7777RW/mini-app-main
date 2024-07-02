// import { useUtils } from '@tma.js/sdk-react';
import {
    // Avatar,
    Cell,
    List,
    ButtonCell,
    // Navigation,
    Placeholder,
    // Section,
    Text,
    Modal,
    // Title,
} from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import { Product } from '../../components/Product/Product';
import React, { useEffect, useState } from 'react';
import { useWalletInfo } from '@web3modal/wagmi/react'
import { useAccount, useBalance } from 'wagmi';

import { useSendTransaction, useWaitForTransactionReceipt, type BaseError, useWriteContract } from 'wagmi'
import { parseEther } from 'viem'

import { ZeroAddress } from "ethers";
import { } from 'wagmi';
import { useReadContract } from 'wagmi'
// import { Abi } from 'viem';
import { abi as ABI1 } from '../../Utils/DegenDealsERC721.json';
import { abi as ABI2 } from '../../Utils/IERC20.json';
import { App } from '../../Components/App';
import { NewProductModal } from './NewProductModal';
import { SectionHeader } from '@telegram-apps/telegram-ui/dist/components/Blocks/Section/components/SectionHeader/SectionHeader';

export type NFTProduct = {
    arbitrator: string,
    deadline: BigInt,
    dealAccount: string,
    minter: string,
    obligee: string,
    obligeeDeal: boolean,
    obligor: string,
    obligorDeal: boolean,
    offerHash: string,
    paymentAmount: BigInt,
    paymentToken: string,
    period: BigInt,
    status: number
}
export function ListProducts() {
    const { data: nftAmount, isError, isLoading } = useReadContract({
        address: `0x${process.env.DEDEALS721!}`,
        abi: ABI1,
        functionName: 'totalDeals',
        args: [],
    });

    const { data: dealData } = useReadContract({
        address: `0x${process.env.DEDEALS721!}`,
        abi: ABI1,
        functionName: 'getDeals',
        args: [0n, Number(nftAmount) - 1]
    }) as any;

    const fetchedDeals: NFTProduct[] = [];
    if (dealData) {
        dealData.map((deal: NFTProduct) => (fetchedDeals.push(deal)))
        console.log(fetchedDeals)

    }
    return (
        <>

            {fetchedDeals.map((product, index) => {
                if (index >= 7)
                    return <Product id={index} product={product} />
            })}
        </>
    )
}


export const ProductPage: FC = () => {

    return (

        <>
            <div style={{ height: '100vh', display: 'grid', gridTemplateRows: '1fr 8fr' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <SectionHeader style={{ color: '#fff', }}>
                        Degen Deals products:
                    </SectionHeader>
                    <ButtonCell
                        style={{ display: 'flex', marginTop: '2vh', width: 'max-content', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', textAlign: 'center', color: '#fff' }}>
                        <NewProductModal />
                    </ButtonCell>
                </div>
                <List style={{ maxHeight: '88vh', overflowX: 'scroll' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr', columnGap: '20px', rowGap: '20px', padding: '5px' }}>

                        <ListProducts />
                    </div>
                </List >

            </div>
        </>

    );
};
