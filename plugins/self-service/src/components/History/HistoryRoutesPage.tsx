import { Route, Routes, Navigate } from 'react-router-dom';
import { RequirePermission } from '@backstage/plugin-permission-react';
import { taskReadPermission } from '@backstage/plugin-scaffolder-common/alpha';
import { historyViewPermission } from '@ansible/backstage-rhaap-common/permissions';
import { TaskList } from '../TaskList';
import { RunTask } from '../RunTask';

/**
 * Standalone route wrapper used by the dynamic plugin mount at /self-service/create
 * so detail URLs like /self-service/create/tasks/:taskId resolve correctly.
 */
export const HistoryRoutesPage = () => {
  return (
    <RequirePermission permission={historyViewPermission}>
      <Routes>
        <Route index element={<Navigate to="tasks" replace />} />
        <Route
          path="tasks"
          element={
            <RequirePermission
              permission={taskReadPermission}
              resourceRef="scaffolder-task"
            >
              <TaskList />
            </RequirePermission>
          }
        />
        <Route
          path="tasks/:taskId"
          element={
            <RequirePermission
              permission={taskReadPermission}
              resourceRef="scaffolder-task"
            >
              <RunTask />
            </RequirePermission>
          }
        />
        <Route path="*" element={<Navigate to="tasks" replace />} />
      </Routes>
    </RequirePermission>
  );
};
