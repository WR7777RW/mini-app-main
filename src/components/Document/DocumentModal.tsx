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
import { Document, Page, pdfjs } from 'react-pdf';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

type Props = {
    product: NFTProduct
}

export const DocumentModal = ({ product }: Props) => {
    const pdfURL = 'src/components/Document/test_document.pdf';
    const defaultLayoutPluginInstance = defaultLayoutPlugin();

    return (
        <Modal
            header={<ModalHeader after={<ModalClose>
                {/* <Icon28Close style={{ color: 'var(--tgui--plain_foreground)' }} /> */}
            </ModalClose>}></ModalHeader>}
            trigger={
                <Button size="m" style={{ background: '#9149f3', color: '#fbf807', marginRight: '10px' }} >Check Agreement</Button>
            }
        >
            {/* <Worker workerUrl={`https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`}>
                <Viewer
                    fileUrl={pdfURL}
                    plugins={[defaultLayoutPluginInstance]}
                />
            </Worker> */}
        </Modal >
    )
}
