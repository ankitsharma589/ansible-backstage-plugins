import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TemplatesRoutesPage } from './TemplatesRoutesPage';

jest.mock('./Home', () => ({
  HomeComponent: () => <div data-testid="home">Home</div>,
}));
jest.mock('../CatalogItemDetails', () => ({
  CatalogItemsDetails: () => (
    <div data-testid="catalog-details">CatalogDetails</div>
  ),
}));

jest.mock('@ansible/backstage-rhaap-common/permissions', () => ({
  templatesViewPermission: {
    type: 'basic',
    name: 'templates.view',
    attributes: {},
  },
}));

const mockRequirePermission = jest.fn();

jest.mock('@backstage/plugin-permission-react', () => ({
  RequirePermission: (props: any) => mockRequirePermission(props),
}));

describe('TemplatesRoutesPage', () => {
  beforeEach(() => {
    mockRequirePermission.mockReset();
    mockRequirePermission.mockImplementation(({ children }: any) => (
      <>{children}</>
    ));
  });

  it('renders HomeComponent at the index route', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <TemplatesRoutesPage />
      </MemoryRouter>,
    );

    expect(screen.getByTestId('home')).toBeInTheDocument();
  });

  it('renders CatalogItemsDetails at /:namespace/:templateName', () => {
    render(
      <MemoryRouter initialEntries={['/default/my-template']}>
        <TemplatesRoutesPage />
      </MemoryRouter>,
    );

    expect(screen.getByTestId('catalog-details')).toBeInTheDocument();
  });

  it('redirects unknown paths back to index', () => {
    render(
      <MemoryRouter initialEntries={['/some/unknown/deep/path']}>
        <TemplatesRoutesPage />
      </MemoryRouter>,
    );

    expect(screen.getByTestId('home')).toBeInTheDocument();
  });

  it('wraps content with templatesViewPermission', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <TemplatesRoutesPage />
      </MemoryRouter>,
    );

    expect(mockRequirePermission).toHaveBeenCalledWith(
      expect.objectContaining({
        permission: expect.objectContaining({ name: 'templates.view' }),
      }),
    );
  });

  describe('when permission is denied', () => {
    beforeEach(() => {
      mockRequirePermission.mockImplementation(() => (
        <div data-testid="permission-denied" />
      ));
    });

    it('blocks HomeComponent at index', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <TemplatesRoutesPage />
        </MemoryRouter>,
      );

      expect(screen.queryByTestId('home')).not.toBeInTheDocument();
      expect(screen.getByTestId('permission-denied')).toBeInTheDocument();
    });

    it('blocks CatalogItemsDetails at /:namespace/:templateName', () => {
      render(
        <MemoryRouter initialEntries={['/default/my-template']}>
          <TemplatesRoutesPage />
        </MemoryRouter>,
      );

      expect(screen.queryByTestId('catalog-details')).not.toBeInTheDocument();
      expect(screen.getByTestId('permission-denied')).toBeInTheDocument();
    });
  });
});
