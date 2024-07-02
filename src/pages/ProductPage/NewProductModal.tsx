import { Button, ButtonCell, FileInput, FixedLayout, Info, Input, Modal, Placeholder, Section } from "@telegram-apps/telegram-ui";
import { SectionHeader } from "@telegram-apps/telegram-ui/dist/components/Blocks/Section/components/SectionHeader/SectionHeader";
import { ModalClose } from "@telegram-apps/telegram-ui/dist/components/Overlays/Modal/components/ModalClose/ModalClose";
import { ModalHeader } from "@telegram-apps/telegram-ui/dist/components/Overlays/Modal/components/ModalHeader/ModalHeader";
import { abi as ABI1 } from '../../Utils/DegenDealsERC721.json';
import { abi as ABI2 } from '../../Utils/IERC20.json';

import { ThirdwebStorage } from '@thirdweb-dev/storage';

import { FormEvent, useState } from "react";

import axios from 'axios';
import { useReadContract, useWriteContract } from "wagmi";
import { ZeroAddress } from "ethers";


export const NewProductModal = () => {
    const [imageUrl, setImageUrl] = useState('');

    const [productName, setProductName] = useState('');
    const [price, setPrice] = useState(1);
    const [productDescription, setProductDescription] = useState('');
    const [file, setFile] = useState<File>();
    const [uploading, setUploading] = useState(false);
    const {
        data: hash,
        error,
        isPending,
        writeContract
    } = useWriteContract();


    const { data: mintFee } = useReadContract({
        address: `0x${process.env.DEDEALS721!}`,
        abi: ABI1,
        functionName: 'calcMintFee',
        args: [1n * 10n ** 18n]
    });
    console.log(1n * 10n ** 18n / 1000n * 5n)
    console.log(5000000000000000n)
    const approveMint = () => {
        writeContract({
            abi: ABI2,
            address: `0x${process.env.DEDEALS20!}`,
            functionName: 'approve',
            args: ['0xAA45302106FfAa5D84c9AB05db688F877659fb1B', 1n * 10n ** 18n / 1000n * 5n * BigInt(price)],
        })
    }



    const handleProductNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setProductName(event.target.value);
    };

    const handleProductDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setProductDescription(event.target.value);
    };
    const handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPrice(Number(event.target.value));
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFile(event.target.files![0]);
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        console.log('file' + file)
        // if (!file) {
        //     alert('Please attach a photo of your product.');
        //     return;
        // }
        try {
            const formData = new FormData();
            formData.append("image", file!);

            setUploading(true);

            try {
                await axios.post('https://api.imgur.com/3/image', formData, {
                    headers: {
                        'Authorization': `Client-ID ${process.env.IMGUR}` // Replace YOUR_CLIENT_ID with the actual Client ID from Imgur
                    }
                }).then((resp) => {

                    let offerData = {
                        "name": productName,
                        "description": productDescription,
                        "image": resp.data.data.link
                    }

                    let offerHash = JSON.stringify(offerData);
                    let paymentToken = `0x${process.env.DEDEALS20}`;
                    let paymentAmount = 1n * 10n ** 18n * BigInt(price);
                    let period = 10_000;
                    let obligee = ZeroAddress;
                    let erc6551Account = ZeroAddress;

                    writeContract({
                        address: `0x${process.env.DEDEALS721!}`,
                        abi: ABI1,
                        functionName: 'mint',
                        args: [offerHash, paymentToken, paymentAmount, period, obligee, erc6551Account],
                    })
                });
                // setImageUrl(response.data.data.link);
            } catch (error) {
                console.error('Error uploading image:', error);
                alert('Failed to upload the image.');
            } finally {
                setUploading(false);
            }
            // setUploading(false);



            console.log(`Product Name: ${productName}`);
            console.log(`Product Description: ${productDescription}`);
            console.log(`Price: ${price}`);
            console.log(mintFee)

        } catch (error) {
            console.error('Error uploading file:', error);
            setUploading(false);
        }
    };

    return (
        <Modal
            header={<ModalHeader after={<ModalClose>
            </ModalClose>}></ModalHeader>}
            trigger={
                <Button style={{ background: '#9149f3', color: '#fbf807', }} size="l">Mint new deal</Button>
            }
            style={{ padding: '20px' }}
        >

            <SectionHeader style={{ color: '#fff' }}>
                Information about new deal:
            </SectionHeader>
            <form onSubmit={handleSubmit}>
                <Input header="Name" placeholder="Enter name of your product" onChange={handleProductNameChange} />

                <Input header="Description" placeholder="Enter description of your product" onChange={handleProductDescriptionChange} />
                <Input header="Price" placeholder="Enter price of your product in DeDEAL" onChange={handlePriceChange} />

                <FileInput
                    label='Attach photo of your product'
                    accept="image/*"
                    onChange={(e) => { handleFileChange(e) }}
                />
                <Section style={{ display: 'grid', width: '100%' }}>
                    <div style={{ justifyContent: 'space-between' }}>

                        <Button
                            onClick={approveMint}
                            size="m"
                            disabled={uploading}
                            style={{ background: '#9149f3', color: '#fbf807', marginRight: '10px' }}
                        >
                            Request Approval
                        </Button>

                        <Button type="submit"
                            size="m"
                            disabled={uploading}
                            style={{ background: '#9149f3', color: '#fbf807', }}
                        >
                            Mint product
                        </Button>
                    </div>
                    {uploading && <Info type={"text"}>Uploading...</Info>}
                </Section>
            </form>


            {/* <Placeholder
                description="Description"
                header="Title"
            >
                <img
                    alt="Telegram sticker"
                    src="https://xelene.me/telegram.gif"
                    style={{
                        display: 'block',
                        height: '144px',
                        width: '144px'
                    }}
                />
            </Placeholder> */}
        </Modal>
    )
}