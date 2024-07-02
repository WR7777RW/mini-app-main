import { Badge, Button, ButtonCell, Cell, Divider, FileInput, FixedLayout, Info, Input, Modal, Placeholder, Section } from "@telegram-apps/telegram-ui";
import { CardCell } from "@telegram-apps/telegram-ui/dist/components/Blocks/Card/components/CardCell/CardCell";
import { SectionHeader } from "@telegram-apps/telegram-ui/dist/components/Blocks/Section/components/SectionHeader/SectionHeader";
import { ModalClose } from "@telegram-apps/telegram-ui/dist/components/Overlays/Modal/components/ModalClose/ModalClose";
import { ModalHeader } from "@telegram-apps/telegram-ui/dist/components/Overlays/Modal/components/ModalHeader/ModalHeader";
import React from "react";
import { NFTProduct } from "../../pages/ProductPage/ProductPage";
import { abi as ABI1 } from '../../Utils/DegenDealsERC721.json';
import { abi as ABI2 } from '../../Utils/IERC20.json';
import { useWriteContract } from "wagmi";
import { DocumentModal } from "../Document/DocumentModal";

type Props = {
    id: number
    product: NFTProduct
}
export const DetailedInfoModal = ({ id, product }: Props) => {
    const {
        data: hash,
        error,
        isPending,
        writeContract
    } = useWriteContract();

    const handleApprove = () => {

        writeContract({
            abi: ABI2,
            address: `0x${process.env.DEDEALS20!}`,
            functionName: 'approve',
            args: ['0xAA45302106FfAa5D84c9AB05db688F877659fb1B', Number(product.paymentAmount) + 5_000_000_000_000_000_000],
        });
    }
    const handleBuy = () => {
        writeContract({
            abi: ABI1,
            address: `0x${process.env.DEDEALS721!}`,
            functionName: 'pay',
            args: [id, '0x']
        });

    }
    return (
        <Modal
            header={<ModalHeader after={<ModalClose>
            </ModalClose>}></ModalHeader>}
            trigger={
                <CardCell
                    readOnly
                    subtitle={JSON.parse(product.offerHash)['description']}
                    style={{ cursor: 'pointer' }
                    }
                >

                    {JSON.parse(product.offerHash)['name']}
                </CardCell >}
            style={{ padding: '20px' }}
        >
            <Info
                type="text"
                style={{ padding: '5px', overflowY: 'scroll' }}

            >
                ID:
            </Info>
            <Info
                subtitle={id.toString()}
                type="text"
                style={{ padding: '5px', overflowY: 'scroll' }}
            >
            </Info>
            <Divider />
            <Info
                type="text"
                style={{ padding: '5px', overflowY: 'scroll' }}

            >
                Name:
            </Info>
            <Info
                subtitle={JSON.parse(product.offerHash)['name']}
                type="text"
                style={{ padding: '5px', overflowY: 'scroll' }}
            >
            </Info>
            <Divider />

            <Info
                type="text"
                style={{ padding: '5px', overflowY: 'scroll' }}

            >
                Description:
            </Info>
            <Info
                subtitle={JSON.parse(product.offerHash)['description']}
                type="text"
                style={{ padding: '5px', overflowY: 'scroll' }}
            >
            </Info>
            <Divider />

            <Info
                type="text"
                style={{ padding: '5px', overflowY: 'scroll' }}

            >
                Arbitrator:
            </Info>
            <Info
                subtitle={product.minter}
                type="text"
                style={{ padding: '5px', overflowY: 'scroll' }}
            >
            </Info>
            <Divider />
            <Info
                type="text"
                style={{ padding: '5px', overflowY: 'scroll' }}

            >
                Obligor:
            </Info>
            <Info
                subtitle={product.obligor}
                type="text"
                style={{ padding: '5px', overflowY: 'scroll' }}
            >
            </Info>
            <Divider />
            <Info
                type="text"
                style={{ padding: '5px', overflowY: 'scroll' }}

            >
                Deal account:
            </Info>
            <Info
                subtitle={product.dealAccount}
                type="text"
                style={{ padding: '5px', overflowY: 'scroll' }}
            >
            </Info>
            <Divider />
            <Info
                type="text"
                style={{ padding: '5px', overflowY: 'scroll' }}

            >
                Payment token:
            </Info>
            <Info
                subtitle={product.paymentToken}
                type="text"
                style={{ padding: '5px', overflowY: 'scroll' }}
            >
            </Info>
            <Divider />
            <Info
                type="text"
                style={{ padding: '5px', overflowY: 'scroll' }}

            >
                Payment status:
            </Info>
            <Info
                subtitle={product.status.toString()}
                type="text"
                style={{ padding: '5px', overflowY: 'scroll' }}
            >
            </Info>
            <Divider />
            <Info
                type="text"
                style={{ padding: '5px', overflowY: 'scroll' }}

            >
                Payment amount:
            </Info>

            <Info
                subtitle={`${(Number(product.paymentAmount) / 10 ** 18)} DeDEAL`}
                type="text"
                style={{ padding: '5px', overflowY: 'scroll' }}
            >
            </Info>
            <Divider />
            {product.status != 1 ? (<div style={{ justifyContent: 'space-between', marginTop: '2vh', width: '100%' }}>
                <Button size="m" style={{ background: '#9149f3', color: '#fbf807', marginRight: '10px' }} onClick={handleApprove}>Request Approval</Button>
                <Button size="m" style={{ background: '#9149f3', color: '#fbf807', }} onClick={handleBuy}>Deal with merchant</Button>
            </div>) : (
                <><Cell type={"text"} style={{ color: '#fbf807', }}>Sorry, somebody bought it already.</Cell>
                    <DocumentModal product={product} /></>
            )
            }
        </Modal >
    )
}