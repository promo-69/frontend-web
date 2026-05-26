import { useLocation, useNavigate } from 'react-router-dom'
import Step3Confectionery from '../../../components/buyTickets/Step3Confectionery'
import {
  getConcessionProducts,
  getConcessionCombos,
} from '../../../services/localStorage.service'

export default function Confectionery() {
  const { state } = useLocation()
  const navigate = useNavigate()

  const products = getConcessionProducts()
  const combos = getConcessionCombos()

  const handleNext = ({ concessionItems, concessionTotal }) => {
    navigate('../payment', {
      state: {
        ...state,
        concessionItems,
        concessionTotal,
      },
    })
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(to_bottom,#231640_0%,#7B1A82_18%,#231640_53%,#420946_79%,#231640_87%)] text-white font-montserrat pb-16">
      <div className="max-w-5xl mx-auto px-4 mt-8">
        <div className="bg-[rgba(29,20,48,0.85)] backdrop-blur-sm rounded-3xl border border-white/10 shadow-2xl p-6 md:p-8">
          <Step3Confectionery
            products={products}
            combos={combos}
            onNext={handleNext}
            onBack={() => navigate(-1)}
          />
        </div>
      </div>
    </div>
  )
}
