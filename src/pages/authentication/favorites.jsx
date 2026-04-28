import { useState } from 'react'
import registerImage from '../../assets/images/register.png'
import logotipo from '../../assets/images/logotype/logoCiineflix.png'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'

const GENRES = [
  'Acción',
  'Aventura',
  'Comedia',
  'Drama',
  'Terror',
  'Suspenso',
  'Fantasía',
  'Romance',
  'Musical',
  'Misterio',
  'Documental',
  'Crimen',
  'Ciencia Ficción',
  'Bélico',
]

function Favorites() {
  const navigate = useNavigate()
  const [selectedGenres, setSelectedGenres] = useState([])

  const toggleGenre = (genre) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter((g) => g !== genre))
    } else {
      setSelectedGenres([...selectedGenres, genre])
    }
  }

  const handleSubmit = () => {
    console.log('Géneros seleccionados:', selectedGenres)
    navigate('/login') 
  }

  return (
    <div className="bg-[linear-gradient(to_bottom,#231640_0%,#7B1A82_50%,#231640_100%)] min-h-screen flex">
      {/* Imagen izquierda */}
      <div className="hidden lg:block lg:w-1/2 lg:h-screen lg:sticky lg:top-0 overflow-hidden">
        <img
          src={registerImage}
          className="w-full h-full object-cover"
          alt="register imagen"
        />
      </div>

      {/* Contenido derecho */}
      <div className="w-full lg:w-1/2 min-h-screen flex items-center justify-center py-12 px-6 lg:px-0">
        <div className="flex flex-col items-center space-y-6 w-full max-w-md">
          {/* Logo */}
          <img
            src={logotipo}
            className="w-48 md:w-60 h-auto cursor-pointer hover:scale-105 transition-transform"
            alt="logotipo"
            onClick={() => navigate('/')}
          />

          {/* Título */}
          <h1 className="text-center text-[#D9982F] text-2xl leading-tight font-montserrat font-bold">
            ¿Cuáles son tus géneros favoritos?
          </h1>

          <p className="text-center text-white text-4lg leading-relaxed font-montserrat max-w-md">
            Selecciona mínimo{' '}
            <span className="text-[#D9982F] font-bold">3 géneros</span> para
            continuar.
          </p>

          {/* Lista de géneros */}
          <div className="grid grid-cols-2 gap-4 w-full mt-4">
            {GENRES.map((genre) => {
              const isSelected = selectedGenres.includes(genre)
              return (
                <button
                  key={genre}
                  onClick={() => toggleGenre(genre)}
                  className={`py-2 px-4 rounded-lg border font-semibold transition-all
                    ${
                      isSelected
                        ? 'bg-[#D9982F] text-[#231640] border-[#D9982F] shadow-lg scale-105'
                        : 'bg-transparent text-white border-white/40 hover:border-[#D9982F]'
                    }
                  `}
                >
                  {genre}
                </button>
              )
            })}
          </div>

          {/* Botones */}
          <div className="w-full flex items-center justify-center gap-3 pt-4">
            <Button
              text="Cancelar"
              type="button"
              className="bg-gray-500 text-white"
              onClick={() => window.history.back()}
            />
            <Button
              text="Culminar"
              type="submit"
              onClick={handleSubmit}
              className="text-lg font-montserrat font-semibold"
            />
          </div>

          <p className="text-[#D9982F] text-sm opacity-80 hover:opacity-100">
            2026. Todos los derechos reservados. Compañía Cineflix.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Favorites
