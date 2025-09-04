const CONTENT_KEY = 'jainvest_content';
const AUDIT_KEY = 'jainvest_audit';

export const getContentItems = () => {
  try {
    const data = localStorage.getItem(CONTENT_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const addContentItem = (item) => {
  const items = getContentItems();
  const newItem = {
    ...item,
    id: Date.now(),
    status: 'pending',
    createdAt: new Date().toISOString(),
    createdBy: 'current_user'
  };
  
  items.push(newItem);
  localStorage.setItem(CONTENT_KEY, JSON.stringify(items));
  
  // Add audit log
  addAuditEntry('CREATE', `Created content: ${item.title}`);
  
  return newItem;
};

export const updateContentStatus = (id, status, reviewedBy) => {
  const items = getContentItems();
  const item = items.find(i => i.id === id);
  
  if (item) {
    item.status = status;
    item.reviewedBy = reviewedBy;
    item.reviewedAt = new Date().toISOString();
    
    localStorage.setItem(CONTENT_KEY, JSON.stringify(items));
    addAuditEntry(status.toUpperCase(), `${status} content: ${item.title}`);
  }
  
  return item;
};

export const getAuditLog = () => {
  try {
    const data = localStorage.getItem(AUDIT_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const addAuditEntry = (action, description) => {
  const auditLog = getAuditLog();
  const entry = {
    id: Date.now(),
    action,
    description,
    timestamp: new Date().toISOString(),
    user: 'current_user' // In real app, get from auth
  };
  
  auditLog.unshift(entry); // Add to beginning
  
  // Keep only last 100 entries
  if (auditLog.length > 100) {
    auditLog.splice(100);
  }
  
  localStorage.setItem(AUDIT_KEY, JSON.stringify(auditLog));
};