import Register2 from './pages/authentication/register2'
import Header from './components/ui/Header'

function App() {
  return (
    <div className="min-h-screen bg-[#1B0F2E]">

      {/* Header fijo */}
      <Header isLoggedIn={false} />

      {/* Contenido */}
      <div className="flex items-center justify-center mt-24">
        <Register2 />
      </div>

    </div>
  )
}

export default App