function Button({ text, onClick, type = 'button', className = '' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`bg-[#D9982F] text-white px-5 py-2.5 rounded-full 
                  text-sm font-montserrat font-medium
                  hover:opacity-80 transition ${className}`}
    >
      {text}
    </button>
  )
}

export default Button
