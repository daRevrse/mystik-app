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
    description: 'Une création audacieuse où la douceur solaire de l\'ananas rencontre la chaleur intense du gingembre. Un équilibre maîtrisé, pensé pour les palais exigeants.',
    details: {
      subtitle: "Liqueur d'exception",
      madeIn: "Conçue et élaborée au Togo, MYSTIK célèbre le savoir-faire local, les saveurs authentiques et l'élégance des racines africaines.",
      taste: {
        attaque: "fraîcheur fruitée, ronde et lumineuse",
        coeur: "ananas juteux et naturel",
        finale: "montée progressive du gingembre, chaude et persistante"
      },
      caractere: ["Audacieuse", "Énergisante", "Élégante", "Inoubliable"],
      conseils: [
        "Pure, légèrement fraîche",
        "En cocktail signature",
        "En digestif"
      ]
    },
    price: 12000,
    category: 'Fruitée',
    image: '/images/mystik/ananas gingembre.jpeg',
    stock: 24,
    vol: '20% Vol',
    size: '75cl'
  },
  {
    id: 'm3',
    name: 'Mystik Banane & Ananas',
    description: 'Une création douce et raffinée où l\'ananas solaire s\'unit à la rondeur veloutée de la banane mûre. Un accord harmonieux, délicatement gourmand, pensé pour les palais en quête d\'élégance tropicale et de subtilité.',
    details: {
      subtitle: "Liqueur d'exception",
      madeIn: "Conçue et élaborée au Togo, MYSTIK met en lumière le savoir-faire local, la richesse des fruits tropicaux et l'expression raffinée des racines africaines.",
      taste: {
        attaque: "douceur fruitée, ronde et lumineuse",
        coeur: "ananas juteux sublimé par la banane soyeuse",
        finale: "gourmande, délicate et harmonieusement persistante"
      },
      caractere: [],
      conseils: [
        "Pure, légèrement fraîche",
        "En cocktail doux et exotique",
        "En digestif gourmand"
      ]
    },
    price: 12000,
    category: 'Fruitée',
    image: '/images/mystik/banane ananas.jpeg',
    stock: 30,
    vol: '20% Vol',
    size: '75cl'
  },
  {
    id: 'm4',
    name: 'Mystik Datte Cannelle Café',
    description: 'Une création profonde et envoûtante où la douceur naturelle de la datte s\'entrelace aux notes chaleureuses de la cannelle et à l\'intensité noble du café. Un assemblage racé et sophistiqué, pensé pour les palais en quête de caractère et de profondeur.',
    details: {
      subtitle: "Liqueur d'exception",
      madeIn: "Conçue et élaborée au Togo, MYSTIK sublime le savoir-faire local, les épices nobles et l'élégance intemporelle des racines africaines.",
      taste: {
        attaque: "douceur suave et naturellement sucrée",
        coeur: "datte fondante relevée par la cannelle épicée",
        finale: "café intense, profonde et longuement persistante"
      },
      caractere: ["Intense", "Chaleureuse", "Épicée", "Élégante"],
      conseils: [
        "Pure, à température ambiante",
        "En cocktail sophistiqué",
        "En digestif de caractère"
      ]
    },
    price: 12000,
    category: 'Spéciale',
    image: '/images/mystik/datte cannelle café.jpeg',
    stock: 12,
    vol: '35% Vol',
    size: '75cl'
  }
];

// Utilitaires LocalStorage
const STORAGE_KEYS = {
  PRODUCTS: 'mystik_products_v4',
  ORDERS: 'mystik_orders_v4'
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
