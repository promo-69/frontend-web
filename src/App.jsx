import AppRoutes from './routes'
import { ToastProvider } from './context/ToastContext'
import ToastContainer from './components/ui/ToastContainer'

function App() {
  return (
    <ToastProvider>
      <AppRoutes />
      <ToastContainer />
    </ToastProvider>
  )
}

export default App
