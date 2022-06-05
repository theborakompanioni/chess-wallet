import { render, screen } from '@testing-library/react'
import App from './App'

describe('<Balance />', () => {
  it('should render an App heading', () => {
    render(<App />)

    const linkElement = screen.getByText('Bitcoin Chess Wallet')
    expect(linkElement).toBeInTheDocument()
  })
})
