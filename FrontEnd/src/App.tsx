import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { ErrorBoundary } from '@/components/ErrorBoundary';

import Home from '@/screens/home';

import '@/index.css';

const paths = [
    {
        path: '/',
        element: (
          <Home/>
        ),
    },
];

const BrowserRouter = createBrowserRouter(paths);

const App = () => {
    return (
        <ErrorBoundary>
            <MantineProvider>
                <RouterProvider router={BrowserRouter}/>
            </MantineProvider>
        </ErrorBoundary>
    );
};

export default App;
