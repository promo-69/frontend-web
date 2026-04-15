function SendMailForm({ onNext }) {
  const handleSubmit = () => {
    // llamar backend para enviar código
    onNext()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
      <input type="email" placeholder="Correo" className="input" />
      <button className="btn-primary">Enviar código</button>
    </form>
  )
}

export default SendMailForm
