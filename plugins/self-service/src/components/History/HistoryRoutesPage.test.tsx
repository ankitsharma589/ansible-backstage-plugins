import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HistoryRoutesPage } from './HistoryRoutesPage';

jest.mock('../TaskList', () => ({
  TaskList: () => <div data-testid="task-list">TaskList</div>,
}));
jest.mock('../RunTask', () => ({
  RunTask: () => <div data-testid="run-task">RunTask</div>,
}));

jest.mock('@ansible/backstage-rhaap-common/permissions', () => ({
  historyViewPermission: {
    type: 'basic',
    name: 'history.view',
    attributes: {},
  },
}));

const mockRequirePermission = jest.fn();

jest.mock('@backstage/plugin-permission-react', () => ({
  RequirePermission: (props: any) => mockRequirePermission(props),
}));

describe('HistoryRoutesPage', () => {
  beforeEach(() => {
    mockRequirePermission.mockReset();
    mockRequirePermission.mockImplementation(({ children }: any) => (
      <>{children}</>
    ));
  });

  it('redirects index to tasks', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <HistoryRoutesPage />
      </MemoryRouter>,
    );

    expect(screen.getByTestId('task-list')).toBeInTheDocument();
  });

  it('renders TaskList at /tasks', () => {
    render(
      <MemoryRouter initialEntries={['/tasks']}>
        <HistoryRoutesPage />
      </MemoryRouter>,
    );

    expect(screen.getByTestId('task-list')).toBeInTheDocument();
  });

  it('renders RunTask at /tasks/:taskId', () => {
    render(
      <MemoryRouter initialEntries={['/tasks/abc-123']}>
        <HistoryRoutesPage />
      </MemoryRouter>,
    );

    expect(screen.getByTestId('run-task')).toBeInTheDocument();
  });

  it('redirects unknown paths to tasks', () => {
    render(
      <MemoryRouter initialEntries={['/unknown']}>
        <HistoryRoutesPage />
      </MemoryRouter>,
    );

    expect(screen.getByTestId('task-list')).toBeInTheDocument();
  });

  it('wraps content with historyViewPermission at the top level', () => {
    render(
      <MemoryRouter initialEntries={['/tasks']}>
        <HistoryRoutesPage />
      </MemoryRouter>,
    );

    expect(mockRequirePermission).toHaveBeenCalledWith(
      expect.objectContaining({
        permission: expect.objectContaining({ name: 'history.view' }),
      }),
    );
  });

  it('wraps TaskList with taskReadPermission and resourceRef', () => {
    render(
      <MemoryRouter initialEntries={['/tasks']}>
        <HistoryRoutesPage />
      </MemoryRouter>,
    );

    expect(mockRequirePermission).toHaveBeenCalledWith(
      expect.objectContaining({
        permission: expect.objectContaining({ name: 'scaffolder.task.read' }),
        resourceRef: 'scaffolder-task',
      }),
    );
  });

  it('wraps RunTask with taskReadPermission and resourceRef', () => {
    render(
      <MemoryRouter initialEntries={['/tasks/abc-123']}>
        <HistoryRoutesPage />
      </MemoryRouter>,
    );

    expect(mockRequirePermission).toHaveBeenCalledWith(
      expect.objectContaining({
        permission: expect.objectContaining({ name: 'scaffolder.task.read' }),
        resourceRef: 'scaffolder-task',
      }),
    );
  });

  describe('when permission is denied', () => {
    beforeEach(() => {
      mockRequirePermission.mockImplementation(() => (
        <div data-testid="permission-denied" />
      ));
    });

    it('blocks TaskList at /tasks', () => {
      render(
        <MemoryRouter initialEntries={['/tasks']}>
          <HistoryRoutesPage />
        </MemoryRouter>,
      );

      expect(screen.queryByTestId('task-list')).not.toBeInTheDocument();
      expect(screen.getByTestId('permission-denied')).toBeInTheDocument();
    });

    it('blocks RunTask at /tasks/:taskId', () => {
      render(
        <MemoryRouter initialEntries={['/tasks/abc-123']}>
          <HistoryRoutesPage />
        </MemoryRouter>,
      );

      expect(screen.queryByTestId('run-task')).not.toBeInTheDocument();
      expect(screen.getByTestId('permission-denied')).toBeInTheDocument();
    });
  });
});
