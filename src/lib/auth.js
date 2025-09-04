const AUTH_KEY = 'jainvest_auth';

export const roles = {
  LEARNER: 'learner',
  REVIEWER: 'reviewer',
  ADMIN: 'admin'
};

export const mockUsers = [
  { id: '1', email: 'learner@demo.com', password: 'demo123', role: roles.LEARNER, name: 'Demo Learner' },
  { id: '2', email: 'reviewer@demo.com', password: 'demo123', role: roles.REVIEWER, name: 'Demo Reviewer' },
  { id: '3', email: 'admin@demo.com', password: 'demo123', role: roles.ADMIN, name: 'Demo Admin' }
];

export const getCurrentUser = () => {
  try {
    const authData = localStorage.getItem(AUTH_KEY);
    return authData ? JSON.parse(authData) : null;
  } catch {
    return null;
  }
};

export const login = async (email, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = mockUsers.find(u => u.email === email && u.password === password);
      if (user) {
        const authData = {
          token: `jwt_${user.id}_${Date.now()}`,
          user: { id: user.id, email: user.email, role: user.role, name: user.name }
        };
        localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
        resolve(authData);
      } else {
        reject(new Error('Invalid credentials'));
      }
    }, 1000);
  });
};

export const signup = async (email, password, name, role) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const existingUser = mockUsers.find(u => u.email === email);
      if (existingUser) {
        reject(new Error('User already exists'));
        return;
      }
      
      const newUser = {
        id: Date.now().toString(),
        email,
        password,
        role,
        name
      };
      
      mockUsers.push(newUser);
      
      const authData = {
        token: `jwt_${newUser.id}_${Date.now()}`,
        user: { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name }
      };
      
      localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
      resolve(authData);
    }, 1000);
  });
};

export const logout = () => {
  localStorage.removeItem(AUTH_KEY);
};

export const hasRole = (requiredRole) => {
  const user = getCurrentUser();
  if (!user) return false;
  
  const roleHierarchy = {
    [roles.ADMIN]: [roles.ADMIN, roles.REVIEWER, roles.LEARNER],
    [roles.REVIEWER]: [roles.REVIEWER, roles.LEARNER],
    [roles.LEARNER]: [roles.LEARNER]
  };
  
  return roleHierarchy[user.user.role]?.includes(requiredRole) || false;
};