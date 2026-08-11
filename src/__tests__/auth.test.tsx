import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { SignupPage } from '../pages/SignupPage';
import { LoginPage } from '../pages/LoginPage';
import { PasswordInput } from '../components/ui/PasswordInput';
import { AuthProvider } from '../context/AuthContext';

describe('Stage 11J Frontend Auth & Password Component Tests', () => {
  it('1. PasswordInput toggles password visibility independently without submitting form', () => {
    render(
      <PasswordInput
        label="Test Password"
        id="test-pass"
        value="Secret123!"
        onChange={() => {}}
      />
    );

    const input = screen.getByLabelText('Test Password') as HTMLInputElement;
    expect(input.type).toBe('password');

    const toggleButton = screen.getByLabelText('Show password');
    expect(toggleButton.getAttribute('type')).toBe('button');

    fireEvent.click(toggleButton);

    expect(input.type).toBe('text');
    expect(screen.getByLabelText('Hide password')).toBeDefined();
  });

  it('2. SignupPage renders field validation errors on invalid submit', async () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <SignupPage />
        </BrowserRouter>
      </AuthProvider>
    );

    const submitBtn = screen.getByRole('button', { name: /Create Farmer Account/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Full name is required.')).toBeDefined();
      expect(screen.getByText('Email address is required.')).toBeDefined();
      expect(screen.getByText('Password is required.')).toBeDefined();
    });
  });

  it('3. SignupPage detects password mismatch', async () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <SignupPage />
        </BrowserRouter>
      </AuthProvider>
    );

    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Vihari Kalla' } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'vihari@agripulse.io' } });

    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Password123!' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'WrongPassword123!' } });

    fireEvent.click(screen.getByRole('button', { name: /Create Farmer Account/i }));

    await waitFor(() => {
      expect(screen.getByText('Confirm password must match password.')).toBeDefined();
    });
  });

  it('4. LoginPage validates email and password requirements', async () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </AuthProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: /Sign In to Dashboard/i }));

    await waitFor(() => {
      expect(screen.getByText('Email address is required.')).toBeDefined();
      expect(screen.getByText('Password is required.')).toBeDefined();
    });
  });
});
