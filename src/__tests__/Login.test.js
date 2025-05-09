import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Login from '../Components/Pages/Login';
import { AuthContext } from '../Components/AppContext/AppContext';
import '@testing-library/jest-dom';

describe('Login Page', () => {
  const mockLoginWithEmailAndPassword = jest.fn();
  const mockSignInWithGoogle = jest.fn();

  const mockContext = {
    loginWithEmailAndPassword: mockLoginWithEmailAndPassword,
    signInWithGoogle: mockSignInWithGoogle,
  };

  const renderLogin = () => {
    render(
      <Router>
        <AuthContext.Provider value={mockContext}>
          <Login />
        </AuthContext.Provider>
      </Router>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders email and password inputs', () => {
    renderLogin();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  test('renders login button and Google sign-in', () => {
    renderLogin();
    expect(screen.getByRole('button', { name: /login as/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument();
  });

  test('submits email and password login', () => {
    renderLogin();

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /login as/i }));

    expect(mockLoginWithEmailAndPassword).toHaveBeenCalledWith(
      'test@example.com',
      'password123'
    );
  });

  test('calls Google sign-in function when Google button clicked', () => {
    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: /sign in with google/i }));
    expect(mockSignInWithGoogle).toHaveBeenCalled();
  });
});
