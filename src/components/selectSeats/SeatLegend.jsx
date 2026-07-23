export default function SeatLegend() {
  return (
    <div className="flex gap-6 text-sm text-gray-300 mt-5">
      <div className="flex items-center gap-2">
        <span className="w-4 h-4 bg-[#713182] rounded-sm" />
        Disponible
      </div>

      <div className="flex items-center gap-2">
        <span className="w-4 h-4 bg-[#F6AD38] rounded-sm" />
        Seleccionado
      </div>

      <div className="flex items-center gap-2">
        <span className="w-4 h-4 bg-[#9ca3af] rounded-sm" />
        Ocupado
      </div>
    </div>
  )
}
