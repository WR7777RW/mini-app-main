import type { ComponentType, JSX } from 'react';

import { ProductPage } from '../pages/ProductPage/ProductPage';
import { IndexPage } from '../pages/IndexPage/IndexPage';
import React from 'react';

interface Route {
  path: string;
  Component: ComponentType;
  title?: string;
  icon?: JSX.Element;
}

export const routes: Route[] = [
  { path: '/', Component: IndexPage },

  {
    path: '/products',
    Component: ProductPage,
    title: 'Products'

  }
];
