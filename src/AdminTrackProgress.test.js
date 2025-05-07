import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import AdminTrackProgress from './Components/Pages/Admin/AdminTrackProgress.jsx';

// Mock Firebase
jest.mock('./Components/firebase/firebase.jsx', () => ({
  db: {},
}));

// Mock Material Tailwind components
jest.mock('@material-tailwind/react', () => ({
  Card: ({ children }) => <div>{children}</div>,
  Typography: ({ children }) => <div>{children}</div>,
  Select: ({ children, onChange }) => (
    <select onChange={(e) => onChange(e.target.value)}>{children}</select>
  ),
  Option: ({ children, value }) => <option value={value}>{children}</option>,
}));

// Mock Firestore methods
import { collection, getDocs } from 'firebase/firestore';
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  getDocs: jest.fn(),
}));

describe('AdminTrackProgress', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders semester dropdown options', async () => {
    const mockSemesterData = [
      { id: 's1', data: () => ({ semester: 'Semester 1', tasks: [{ name: 'Task A' }] }) },
      { id: 's2', data: () => ({ semester: 'Semester 2', tasks: [{ name: 'Task B' }] }) },
    ];

    console.log('Mocked semester data:', mockSemesterData.map(doc => doc.data()));

    getDocs.mockResolvedValueOnce({ docs: mockSemesterData });

    render(<AdminTrackProgress />);

    await waitFor(() => {
      console.log('Rendered Semester 1:', screen.queryByText('Semester 1') !== null);
      console.log('Rendered Semester 2:', screen.queryByText('Semester 2') !== null);
      expect(screen.getByText('Semester 1')).toBeInTheDocument();
      expect(screen.getByText('Semester 2')).toBeInTheDocument();
    });
  });

  test('displays groups and tasks when a semester is selected', async () => {
    const mockSemesterDocs = [
      {
        id: 's1',
        data: () => ({
          semester: 'Semester 1',
          tasks: [{ name: 'Proposal' }, { name: 'Report' }],
        }),
      },
    ];

    const mockGroupDocs = [
      {
        id: 'g1',
        data: () => ({
          name: 'Group Alpha',
          progress: {
            'Semester 1': {
              task1: {
                fileUrl: 'http://example.com/file.pdf',
                uploadedAt: new Date().toISOString(),
              },
              task2: {},
            },
          },
        }),
      },
    ];

    console.log('Mocked semester tasks:', mockSemesterDocs.map(doc => doc.data()));
    getDocs.mockResolvedValueOnce({ docs: mockSemesterDocs });

    console.log('Mocked group data:', mockGroupDocs.map(doc => doc.data()));
    getDocs.mockResolvedValueOnce({ docs: mockGroupDocs });

    render(<AdminTrackProgress />);

    await waitFor(() => {
      expect(screen.getByText('Semester 1')).toBeInTheDocument();
      console.log('Semester dropdown rendered');
    });

    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'Semester 1' },
    });

    console.log('Changed semester selection to: Semester 1');

    await waitFor(() => {
      expect(screen.getByText(/Group: Group Alpha/)).toBeInTheDocument();
      expect(screen.getByText(/Proposal/)).toBeInTheDocument();
      expect(screen.getByText(/Report/)).toBeInTheDocument();
      console.log('Group and tasks rendered');
    });

    expect(screen.getByText(/View File/)).toBeInTheDocument();
    expect(screen.getByText(/Uploaded:/)).toBeInTheDocument();
    expect(screen.getByText(/No file uploaded/)).toBeInTheDocument();
    console.log('File upload statuses rendered');
  });
});
