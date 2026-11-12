import { RouterProvider } from 'react-router/dom'
import { AppDataProvider } from '../data/store/AppDataProvider'
import { createAppRouter } from './router'

const router = createAppRouter()

export default function App() {
  return (
    <AppDataProvider>
      <RouterProvider router={router} />
    </AppDataProvider>
  )
}
