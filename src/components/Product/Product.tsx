import { Button, Card, Cell, Image } from '@telegram-apps/telegram-ui';
import type { FC } from 'react';

import React from 'react';
import { NFTProduct } from '../../pages/ProductPage/ProductPage';
import { CardChip } from '@telegram-apps/telegram-ui/dist/components/Blocks/Card/components/CardChip/CardChip';
import { DetailedInfoModal } from './DetailedInfoModal';

interface Props {
    id: number,
    product: NFTProduct
}


export const Product = ({ id, product }: Props) => {

    return (
        <Card key={id}>
            <React.Fragment key=".0">
                <CardChip readOnly>
                    {`Price: ${Number(product.paymentAmount) / (10 ** 18)} DeDEAL`}
                </CardChip>
                <img
                    alt="Dog"
                    width={'100%'}
                    src={JSON.parse(product.offerHash)['image']}
                />

                <DetailedInfoModal id={id} product={product} />

            </React.Fragment>
        </Card>
    );
};
