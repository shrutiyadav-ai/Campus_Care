export const CATEGORIES = [
  'Hostel',
  'Water Supply',
  'Cleaning',
  'Pest Control',
  'Electricity',
  'Wi-Fi & Internet',
  'Canteen',
  'Classroom',
  'Transport',
  'Maintenance',
  'Other',
];

export const PRIORITIES = [
  { value: 'low', label: 'Low', color: '#64748B' },
  { value: 'medium', label: 'Medium', color: '#F59E0B' },
  { value: 'high', label: 'High', color: '#EA580C' },
  { value: 'urgent', label: 'Urgent', color: '#DC2626' },
];

export const STATUSES = [
  { value: 'submitted', label: 'Submitted', color: '#64748B' },
  { value: 'under_review', label: 'Under Review', color: '#2563EB' },
  { value: 'in_progress', label: 'In Progress', color: '#F59E0B' },
  { value: 'resolved', label: 'Resolved', color: '#16A34A' },
];

export const STATUS_FLOW = ['submitted', 'under_review', 'in_progress', 'resolved'];

export const ACADEMIC_YEARS = [
  '1st Year',
  '2nd Year',
  '3rd Year',
  '4th Year',
  '5th Year',
];

export const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getStatusInfo = (status) => {
  return STATUSES.find(s => s.value === status) || STATUSES[0];
};

export const getPriorityInfo = (priority) => {
  return PRIORITIES.find(p => p.value === priority) || PRIORITIES[1];
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  const errors = [];
  if (password.length < 8) errors.push('Password must be at least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('Password must contain an uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('Password must contain a lowercase letter');
  if (!/[0-9]/.test(password)) errors.push('Password must contain a number');
  return errors;
};

export const getCategoryIcon = (category) => {
  const icons = {
    'Hostel': 'Building2',
    'Water Supply': 'Droplets',
    'Cleaning': 'Sparkles',
    'Pest Control': 'Bug',
    'Electricity': 'Zap',
    'Wi-Fi & Internet': 'Wifi',
    'Canteen': 'UtensilsCrossed',
    'Classroom': 'BookOpen',
    'Transport': 'Bus',
    'Maintenance': 'Wrench',
    'Other': 'MoreHorizontal',
  };
  return icons[category] || 'MoreHorizontal';
};

