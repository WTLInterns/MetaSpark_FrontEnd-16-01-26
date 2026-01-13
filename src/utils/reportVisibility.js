export const REPORTS_BY_ROLE = {
  ADMIN: ['DESIGN', 'PRODUCTION', 'MACHINISTS', 'INSPECTION'],
  DESIGN: ['DESIGN'],
  PRODUCTION: ['PRODUCTION'],
  MACHINISTS: ['MACHINISTS'],
  INSPECTION: ['INSPECTION'],
};

export const REPORT_DEFS = [
  { key: 'DESIGN', label: 'Design Report', type: 'design' },
  { key: 'PRODUCTION', label: 'Production Report', type: 'production' },
  { key: 'MACHINISTS', label: 'Machinists Report', type: 'machinists' },
  { key: 'INSPECTION', label: 'Inspection Report', type: 'inspection' },
];

export const normalizeRole = (rawRole) => {
  const base = (rawRole || '').toString().split(',')[0].trim().toUpperCase();
  if (!base) return '';
  if (base === 'MACHINING') return 'MACHINISTS';
  if (base === 'MECHANIST') return 'MACHINISTS';
  if (base === 'MECHANIC') return 'MACHINISTS';
  if (base === 'MACHINIST') return 'MACHINISTS';
  return base;
};

export const getVisibleReportDefsForRole = (role) => {
  const normalizedRole = normalizeRole(role);
  const allowed = REPORTS_BY_ROLE[normalizedRole] || [];
  return REPORT_DEFS.filter((d) => allowed.includes(d.key));
};

export const getVisibleReportDefsForCurrentUser = () => {
  if (typeof window === 'undefined') return [];
  try {
    const authData = JSON.parse(localStorage.getItem('swiftflow-user'));
    const role = authData?.roles;
    return getVisibleReportDefsForRole(role);
  } catch (_) {
    return [];
  }
};
