import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { PageGame, PageHome } from '../pages';

export const router = createBrowserRouter([
    { path: '/', element: <PageHome /> },
    { path: '/game/:id', element: <PageGame /> },
]);