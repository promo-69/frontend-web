import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'

function App() {

  return (
    <>
      <div className="flex justify-center items-center gap-4 mb-8">
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo w-32 h-32" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react w-32 h-32" alt="React logo" />
        </a>
      </div>
      <h1 className="text-center text-red-800 text-6xl mb-4">PROMO 69</h1>
      <p className="read-the-docs text-center text-black-700 text-xl space-x-3">
        Pagina web principal  
      </p>
    </>
  )
}

export default App
