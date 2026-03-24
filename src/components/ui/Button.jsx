function Button({ text, onClick, type = 'button', className = '' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`bg-[#D9982F] text-white px-8 py-4 rounded-full hover:opacity-90 transition ${className}`}
    >
      {text}
    </button>
  )
}

export default Button
