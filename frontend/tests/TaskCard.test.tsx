import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';

import TaskCard from '../src/components/TaskCard';
import { Task } from '../src/types';

describe('TaskCard', () => {
  it('renders task details', () => {
    const task: Task = {
      _id: '1',
      title: 'Ship UI',
      description: 'Finalize the dashboard',
      status: 'in_progress',
      priority: 'high',
      assignedTo: { _id: 'u1', name: 'Ava', email: 'ava@example.com' },
      teamId: { _id: 't1', name: 'Core' },
      dueDate: '2026-01-10T00:00:00.000Z',
      createdBy: 'u2',
    };

    render(<TaskCard task={task} showActions={false} />);

    expect(screen.getByText('Ship UI')).toBeInTheDocument();
    expect(screen.getByText('Finalize the dashboard')).toBeInTheDocument();
    expect(screen.getByText(/in_progress/i)).toBeInTheDocument();
    expect(screen.getByText(/Priority: high/i)).toBeInTheDocument();
    expect(screen.getByText(/Assignee: Ava/i)).toBeInTheDocument();
    expect(screen.getByText(/Team: Core/i)).toBeInTheDocument();
  });
});
