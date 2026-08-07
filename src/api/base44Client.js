// Dummy Base44 Client to prevent build errors and allow static hosting
// This replaces the proprietary Base44 backend with static/mock responses.

const mockData = {
    announcements: [],
    status: [],
    freebies: [],
    prices: [],
    communityLinks: [],
    discounts: []
};

const createMockProxy = () => {
    return new Proxy(function() {}, {
        get: (target, prop) => {
            if (prop === 'get') {
                return async (collection) => {
                    return mockData[collection] || [];
                };
            }
            if (prop === 'insert' || prop === 'update' || prop === 'delete') {
                return async () => ({ success: true });
            }
            if (prop === 'me') {
                return async () => ({ role: 'user', id: 'local-user' });
            }
            return createMockProxy();
        },
        apply: async () => {
            return [];
        }
    });
};

export const base44 = {
    db: createMockProxy(),
    auth: {
        me: async () => {
            const user = localStorage.getItem('auth_user');
            return user ? JSON.parse(user) : null;
        }
    },
    storage: {
        getUrl: () => ''
    },
    functions: createMockProxy()
};
