/**
 * Service Layer - Mock API MYSTIK 🇹🇬
 * Simulation d'un backend asynchrone avec persistance LocalStorage.
 */

const DELAY = 300;

// Données réelles MYSTIK pour la démonstration
const INITIAL_PRODUCTS = [
  {
    id: 'm1',
    name: 'Mystik Ananas & Gingembre',
    description: 'L\'esprit authentique de nos terres. Une liqueur de Sodabi artisanale infusée à l\'ananas frais et au gingembre de pays. Made in TOGO.',
    price: 12500,
    category: 'Fruitée',
    image: '/images/mystik/liqueur_ananas.webp',
    stock: 24,
    vol: '20% Vol',
    size: '75cl'
  },
  {
    id: 'm2',
    name: 'Mystik Racines Tradition',
    description: 'La force de nos ancêtres. Un Sodabi premium infusé avec une sélection rigoureuse de racines et d\'écorces médicinales. Intense et boisé.',
    price: 15000,
    category: 'Authentique',
    image: '/images/mystik/liqueur_racines.webp',
    stock: 18,
    vol: '38% Vol',
    size: '75cl'
  },
  {
    id: 'm3',
    name: 'Mystik Banane & Ananas',
    description: 'Une douceur tropicale. L\'équilibre parfait entre la gourmandise de la banane mûre et l\'acidité de l\'ananas.',
    price: 12500,
    category: 'Fruitée',
    image: '/images/mystik/groupe de liqueurs 1.webp',
    stock: 30,
    vol: '20% Vol',
    size: '75cl'
  },
  {
    id: 'm4',
    name: 'Mystik Datte Cannelle Café',
    description: 'Une édition spéciale chaleureuse. Notes de café torréfié, douceur de la datte et parfum de cannelle.',
    price: 18000,
    category: 'Spéciale',
    image: '/images/mystik/groupe de liqueurs 3.jpeg',
    stock: 12,
    vol: '35% Vol',
    size: '75cl'
  }
];

// Utilitaires LocalStorage
const STORAGE_KEYS = {
  PRODUCTS: 'mystik_products_v1',
  ORDERS: 'mystik_orders_v1'
};

const getFromStorage = (key, initialValue) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : initialValue;
};

const saveToStorage = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// --- INITIALISATION ---
// On force la réinitialisation si c'est la première fois qu'on charge avec Mystik
if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
  saveToStorage(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
}
if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
  saveToStorage(STORAGE_KEYS.ORDERS, []);
}

// --- API FUNCTIONS ---

export const api = {
  // Produits
  getProducts: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(getFromStorage(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS));
      }, DELAY);
    });
  },

  getProductById: async (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const products = getFromStorage(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
        const product = products.find(p => p.id === id);
        product ? resolve(product) : reject(new Error('Produit non trouvé'));
      }, DELAY);
    });
  },

  updateProduct: async (updatedProduct) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const products = getFromStorage(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
        const index = products.findIndex(p => p.id === updatedProduct.id);
        if (index !== -1) {
          products[index] = updatedProduct;
          saveToStorage(STORAGE_KEYS.PRODUCTS, products);
        }
        resolve(updatedProduct);
      }, DELAY);
    });
  },

  // Commandes
  getOrders: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const orders = getFromStorage(STORAGE_KEYS.ORDERS, []);
        // Si vide, on crée quelques exemples
        if (orders.length === 0) {
          const mockupOrders = [
            {
              id: 'MTK-8821',
              customer: { firstName: 'Kodjo', lastName: 'Agbéyomé', city: 'Lomé' },
              items: [INITIAL_PRODUCTS[0], INITIAL_PRODUCTS[1]],
              total: 27500,
              status: 'Livrée',
              paymentStatus: 'Payé',
              date: new Date(Date.now() - 86400000 * 2).toISOString()
            },
            {
              id: 'MTK-4532',
              customer: { firstName: 'Afiwa', lastName: 'Mensah', city: 'Kpalimé' },
              items: [INITIAL_PRODUCTS[2]],
              total: 12500,
              status: 'En préparation',
              paymentStatus: 'Non payé',
              date: new Date(Date.now() - 86400000).toISOString()
            }
          ];
          saveToStorage(STORAGE_KEYS.ORDERS, mockupOrders);
          resolve(mockupOrders);
        } else {
          resolve(orders);
        }
      }, DELAY);
    });
  },

  createOrder: async (orderData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const orders = getFromStorage(STORAGE_KEYS.ORDERS, []);
        const newOrder = {
          ...orderData,
          id: `MTK-${Math.floor(1000 + Math.random() * 9000)}`,
          status: orderData.status || 'En attente',
          paymentStatus: orderData.paymentStatus || 'Non payé',
          date: new Date().toISOString()
        };
        orders.push(newOrder);
        saveToStorage(STORAGE_KEYS.ORDERS, orders);
        resolve(newOrder);
      }, DELAY);
    });
  },

  updateOrderStatus: async (orderId, status) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const orders = getFromStorage(STORAGE_KEYS.ORDERS, []);
        const index = orders.findIndex(o => o.id === orderId);
        if (index !== -1) {
          orders[index].status = status;
          saveToStorage(STORAGE_KEYS.ORDERS, orders);
          resolve(orders[index]);
        } else {
          reject(new Error('Commande non trouvée'));
        }
      }, DELAY);
    });
  }
};
