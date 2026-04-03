import { 
  collection, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  setDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../utils/firebase';

/**
 * Service Layer - API MYSTIK 🇹🇬
 * Migration vers Firebase Firestore pour la persistance réelle.
 */

// Données réelles MYSTIK pour l'initialisation si Firestore est vide
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

const INITIAL_ORDERS = [
  {
    id: 'MTK-8821',
    customer: { firstName: 'Kodjo', lastName: 'Agbéyomé', city: 'Lomé' },
    items: [INITIAL_PRODUCTS[0]],
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

// --- API FUNCTIONS ---

export const api = {
  // Produits
  getProducts: async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      let products = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      
      if (products.length === 0) {
        for (const p of INITIAL_PRODUCTS) {
          const { id, ...data } = p;
          await setDoc(doc(db, 'products', id), data);
        }
        return INITIAL_PRODUCTS;
      }
      return products;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },

  getProductById: async (id) => {
    try {
      const docRef = doc(db, 'products', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { ...docSnap.data(), id: docSnap.id };
      } else {
        throw new Error('Produit non trouvé');
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      throw error;
    }
  },

  updateProduct: async (updatedProduct) => {
    try {
      const { id, ...data } = updatedProduct;
      const docRef = doc(db, 'products', id);
      await updateDoc(docRef, data);
      return updatedProduct;
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  },

  createProduct: async (productData) => {
    try {
      // Si l'ID n'est pas fourni (ex: nouveau produit), on utilise son nom nettoyé ou un ID auto
      const productId = productData.id || productData.name.toLowerCase().replace(/\s+/g, '-');
      const newProduct = {
        ...productData,
        id: productId,
        isActive: true, // Par défaut actif
        createdAt: serverTimestamp()
      };
      await setDoc(doc(db, 'products', productId), newProduct);
      return newProduct;
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  },

  uploadProductImage: async (file) => {
    try {
      const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  },

  // Commandes
  getOrders: async () => {
    try {
      const q = query(collection(db, 'orders'), orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      let orders = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return { 
          ...data, 
          id: doc.id,
          // Normalisation pour l'interface admin
          paymentStatus: data.paymentStatus || data.payment_status || 'Non payé'
        };
      });

      if (orders.length === 0) {
        for (const o of INITIAL_ORDERS) {
          const { id, ...data } = o;
          await setDoc(doc(db, 'orders', id), data);
        }
        return INITIAL_ORDERS;
      }
      return orders;
    } catch (error) {
      console.error("Error fetching orders:", error);
      throw error;
    }
  },

  createOrder: async (orderData) => {
    try {
      // On utilise l'ID déjà généré par le Checkout si présent, sinon on en crée un
      const orderId = orderData.id || `MTK-${Math.floor(100000 + Math.random() * 900000)}`;
      
      const newOrder = {
        ...orderData,
        id: orderId, // On force la cohérence
        status: orderData.status || 'En attente',
        paymentStatus: orderData.paymentStatus || orderData.payment_status || 'Non payé',
        date: orderData.date || new Date().toISOString(),
        createdAt: serverTimestamp()
      };
      
      await setDoc(doc(db, 'orders', orderId), newOrder);
      return newOrder;
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  },

  updateOrderStatus: async (orderId, status) => {
    try {
      const docRef = doc(db, 'orders', orderId);
      await updateDoc(docRef, { status });
      const updatedSnap = await getDoc(docRef);
      return { ...updatedSnap.data(), id: updatedSnap.id };
    } catch (error) {
      console.error("Error updating order status:", error);
      throw error;
    }
  },

  updateOrderPaymentStatus: async (orderId, paymentStatus) => {
    try {
      const docRef = doc(db, 'orders', orderId);
      await updateDoc(docRef, { paymentStatus });
      const updatedSnap = await getDoc(docRef);
      return { ...updatedSnap.data(), id: updatedSnap.id };
    } catch (error) {
      console.error("Error updating order payment status:", error);
      throw error;
    }
  },

  // Codes Promo
  getPromoCodes: async () => {
    try {
      const q = query(collection(db, 'promo_codes'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    } catch (error) {
      console.error("Error fetching promo codes:", error);
      throw error;
    }
  },

  updatePromoCode: async (promoData) => {
    try {
      const { id, ...data } = promoData;
      const docRef = doc(db, 'promo_codes', id.toUpperCase());
      await setDoc(docRef, {
        ...data,
        code: id.toUpperCase(),
        updatedAt: serverTimestamp(),
        createdAt: data.createdAt || serverTimestamp()
      }, { merge: true });
      return { ...data, id: id.toUpperCase() };
    } catch (error) {
      console.error("Error updating promo code:", error);
      throw error;
    }
  },

  deletePromoCode: async (id) => {
    try {
      const { deleteDoc } = await import('firebase/firestore');
      await deleteDoc(doc(db, 'promo_codes', id));
      return true;
    } catch (error) {
      console.error("Error deleting promo code:", error);
      throw error;
    }
  },

  validatePromoCode: async (code) => {
    try {
      const docRef = doc(db, 'promo_codes', code.toUpperCase());
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.isActive) {
          return { ...data, id: docSnap.id };
        }
        throw new Error('Ce code promo n\'est plus actif');
      } else {
        throw new Error('Code promo invalide');
      }
    } catch (error) {
      console.error("Error validating promo code:", error);
      throw error;
    }
  }
};
