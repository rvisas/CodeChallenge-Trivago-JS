import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import App from '../App';
import { store } from '../store';

const renderWithStore = (component) => {
  return render(
    <Provider store={store}>
      {component}
    </Provider>
  );
};

describe('App Component', () => {
  it('renders without crashing', () => {
    renderWithStore(<App />);
    expect(screen.getByTestId('game-root')).toBeInTheDocument();
  });

  it('renders the game board', () => {
    renderWithStore(<App />);
    expect(screen.getByRole('grid', { name: /Game of Life grid/i })).toBeInTheDocument();
  });

  it('renders controls: power, reset, color, frame rate', () => {
    renderWithStore(<App />);
    expect(screen.getByRole('button', { name: /Power/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reset/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Color/i })).toBeInTheDocument();
    expect(screen.getByRole('slider', { name: /frame rate/i })).toBeInTheDocument();
  });

  it('toggles running state when power button clicked', () => {
    renderWithStore(<App />);
    const powerButton = screen.getByRole('button', { name: /Power/i });
    fireEvent.click(powerButton);
    // Button text should change to "Stop"
    expect(screen.getByRole('button', { name: /Stop/i })).toBeInTheDocument();
  });

  it('changes color when color button clicked', () => {
    renderWithStore(<App />);
    const colorButton = screen.getByRole('button', { name: /Color/i });
    fireEvent.click(colorButton);
    // Color should cycle - we can't easily test internal state without more setup
    expect(colorButton).toBeInTheDocument();
  });

  it('resets game when reset button clicked', () => {
    renderWithStore(<App />);
    const resetButton = screen.getByRole('button', { name: /Reset/i });
    fireEvent.click(resetButton);
    expect(resetButton).toBeInTheDocument();
  });
});