import { useQuery } from '@tanstack/react-query';
import {
  HiOutlineCube, HiOutlineSquares2X2, HiOutlineTag,
  HiOutlineUserGroup, HiOutlineDocumentText, HiOutlinePhoto,
} from 'react-icons/hi2';
import { fetchDashboardStats } from '../../api/services';

const STAT_CARDS = [
  { key: 'products', label: 'Products', icon: HiOutlineCube, color: 'var(--color-primary)' },
  { key: 'categories', label: 'Categories', icon: HiOutlineSquares2X2, color: 'var(--color-accent)' },
  { key: 'brands', label: 'Brands', icon: HiOutlineTag, color: 'var(--color-mint-dark)' },
  { key: 'partners', label: 'Partners', icon: HiOutlineUserGroup, color: 'var(--color-gold-dark)' },
  { key: 'documents', label: 'Documents', icon: HiOutlineDocumentText, color: 'var(--color-success)' },
  { key: 'media', label: 'Media Files', icon: HiOutlinePhoto, color: 'var(--color-warning)' },
];

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard-stats'],
    queryFn: fetchDashboardStats,
  });

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Dashboard</h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
        Overview of your content management system.
      </p>

      <div className="admin-stats-grid">
        {STAT_CARDS.map((card) => (
          <div key={card.key} className="admin-stat-card glass-card-light">
            <div className="admin-stat-icon-wrapper" style={{ '--stat-color': card.color }}>
              <card.icon className="admin-stat-icon" />
            </div>
            <div>
              <p className="admin-stat-value">
                {isLoading ? '–' : (stats?.data?.[card.key] ?? 0)}
              </p>
              <p className="admin-stat-label">{card.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
