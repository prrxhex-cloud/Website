// Dummy Base44 Client to prevent build errors and allow static hosting
// This replaces the proprietary Base44 backend with static/mock responses.

const mockEntity = {
    list: async () => [],
    filter: async () => [],
    create: async () => ({ id: '1', success: true }),
    update: async () => ({ id: '1', success: true }),
    delete: async () => ({ success: true }),
    subscribe: () => { 
        return () => {}; // return dummy unsubscribe function
    }
};

export const base44 = {
    auth: {
        me: async () => {
            const user = localStorage.getItem('prrx_keyauth_user');
            return user ? JSON.parse(user) : { role: 'guest' };
        },
        updateMe: async () => ({ success: true }),
        logout: () => { localStorage.removeItem('prrx_keyauth_user'); },
        redirectToLogin: () => {}
    },
    integrations: {
        Core: {
            UploadFile: async () => ({ file_url: '' }),
            InvokeLLM: async () => ({})
        }
    },
    entities: new Proxy({}, {
        get: () => mockEntity
    }),
    db: new Proxy({}, {
        get: () => mockEntity
    }),
    storage: {
        getUrl: () => ''
    }
};
