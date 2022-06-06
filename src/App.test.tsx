import { render, screen } from '@testing-library/react'
import App from './App'

describe('<Balance />', () => {
  it('should render an App heading', () => {
    render(<App />)

    const headingElement = screen.getByText('Bitcoin Chess Wallet')
    expect(headingElement).toBeInTheDocument()

    const newButton = screen.getByText('New')
    expect(newButton).toBeInTheDocument()
    expect(newButton.tagName.toLowerCase()).toBe('button')

    const startButton = screen.getByText('Start')
    expect(startButton).toBeInTheDocument()
    expect(startButton.tagName.toLowerCase()).toBe('button')
  })
})
