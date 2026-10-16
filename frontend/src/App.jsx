import { AppProvider } from './context/AppContext'
import AppRoutes from './routes/AppRoutes'
import './App.css'

export default function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  )
}
