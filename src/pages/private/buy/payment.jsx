import { useLocation, useNavigate } from 'react-router-dom'
import Step4Payment from '../../../components/buyTickets/Step4Payment'
import { confirmSeats, saveOrder } from '../../../services/localStorage.service'

export default function Payment() {
  const { state } = useLocation()
  const navigate = useNavigate()

  const handleConfirm = ({ paymentMethod, paymentFields, grandTotal }) => {
    confirmSeats(
      state.showtime.id,
      state.selectedSeats.map((s) => s.id),
    )

    saveOrder({
      movie: state.movie,
      showtime: state.showtime,
      seats: state.selectedSeats.map((s) => s.id),
      tickets: state.ticketsNeeded,
      tickets_total: state.totalTickets,
      concession_items: state.concessionItems.map((e) => ({
        name: e.item.name,
        qty: e.qty,
        unit_price: e.item.price,
        subtotal: e.item.price * e.qty,
      })),
      concession_total: state.concessionTotal,
      payment_method: paymentMethod,
      payment_fields: paymentFields,
      grand_total: grandTotal,
    })

    navigate('/buy/success')
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(to_bottom,#231640_0%,#7B1A82_18%,#231640_53%,#420946_79%,#231640_87%)] text-white font-montserrat pb-16">
      <div className="max-w-5xl mx-auto px-4 mt-8">
        <div className="bg-[rgba(29,20,48,0.85)] backdrop-blur-sm rounded-3xl border border-white/10 shadow-2xl p-6 md:p-8">
          <Step4Payment
            {...state}
            onConfirm={handleConfirm}
            onBack={() => navigate(-1)}
          />
        </div>
      </div>
    </div>
  )
}
