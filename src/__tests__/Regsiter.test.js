import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter as Router } from "react-router-dom";
import { AuthContext } from '../Components/AppContext/AppContext';
import Regsiter from "../Components/Pages/Regsiter";
import '@testing-library/jest-dom';

const mockContext = {
  registerWithEmailAndPassword: jest.fn(),
};

const renderRegsiter = () => {
  render(
    <Router>
      <AuthContext.Provider value={mockContext}>
        <Regsiter />
      </AuthContext.Provider>
    </Router>
  );
};

describe("Regsiter Page", () => {
  test("renders name, email, and password inputs", async () => {
    renderRegsiter();

    expect(await screen.findByLabelText(/name/i)).toBeInTheDocument();
    expect(await screen.findByLabelText(/email/i)).toBeInTheDocument();
    expect(await screen.findByLabelText(/password/i)).toBeInTheDocument();
  });

  test("renders register button and role selector", async () => {
    renderRegsiter();

    expect(await screen.findByRole("button", { name: /register as/i })).toBeInTheDocument();
    expect(await screen.findByLabelText(/register as/i)).toBeInTheDocument();
  });

  test("submits the form with valid data", async () => {
    renderRegsiter();

    fireEvent.change(await screen.findByLabelText(/name/i), {
      target: { value: "Ziyad" },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "123456" },
    });

    fireEvent.click(screen.getByRole("button", { name: /register as/i }));

    await waitFor(() => {
      expect(mockContext.registerWithEmailAndPassword).toHaveBeenCalledWith(
        "Ziyad",
        "test@example.com",
        "123456",
        "student"
      );
    });
  });
});
