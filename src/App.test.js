import { render, screen } from '@testing-library/react';
import App from './App';

test('renders App heading', () => {
  render(<App />);
  const linkElement = screen.getByText('Chess Bitcoin wallet');
  expect(linkElement).toBeInTheDocument();
});
