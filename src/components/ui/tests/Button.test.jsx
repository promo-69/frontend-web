import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Button from '../Button'

describe('Button', () => {
  it('debe renderizar texto y responder clic', async () => {
    const handleClick = vi.fn()
    render(<Button text="Click me" onClick={handleClick} />)

    const button = screen.getByRole('button', { name: /Click me/i })
    expect(button).toBeInTheDocument()

    await userEvent.click(button)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
