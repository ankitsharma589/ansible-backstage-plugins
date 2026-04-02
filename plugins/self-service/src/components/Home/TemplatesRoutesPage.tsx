import { Route, Routes, Navigate } from 'react-router-dom';
import { RequirePermission } from '@backstage/plugin-permission-react';
import { templatesViewPermission } from '@ansible/backstage-rhaap-common/permissions';
import { HomeComponent } from './Home';
import { CatalogItemsDetails } from '../CatalogItemDetails';

/**
 * Standalone route wrapper used by the dynamic plugin mount at /self-service/catalog
 * so detail URLs like /self-service/catalog/:namespace/:templateName resolve correctly.
 */
export const TemplatesRoutesPage = () => {
  return (
    <RequirePermission permission={templatesViewPermission}>
      <Routes>
        <Route index element={<HomeComponent />} />
        <Route
          path=":namespace/:templateName"
          element={<CatalogItemsDetails />}
        />
        <Route path="*" element={<Navigate to="." replace />} />
      </Routes>
    </RequirePermission>
  );
};
