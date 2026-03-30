import Button from "../../components/ui/Button"
import { useNavigate } from 'react-router-dom'

function Home() {

    const navigate = useNavigate()

  return (
    <div>
      <h1 className="text-4xl font-bold text-center mt-10">
        Bienvenido a Cineflix
      </h1>
      <p className="text-center text-lg mt-4">Esto es el home</p>
      <Button
        onClick={() => navigate('/login')} text="Ingresar"
      >
        ingresar
      </Button>
    </div>
  )
}

export default Home