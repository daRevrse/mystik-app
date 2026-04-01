import admin from 'firebase-admin';

// L'initialisation doit être globale pour éviter l'erreur "App already exists"
// en environnement serverless (Vercel).
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                // On s'assure que les retours à la ligne de la clé privée sont bien interprétés
                privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : '',
            }),
        });
        console.log("🔥 Firebase Admin Initialisé avec succès !");
    } catch (error) {
        console.error('Erreur initialisation Firebase Admin', error.stack);
    }
}

export default async function handler(req, res) {
    // Sécurité: accepter uniquement du POST
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Only POST requests allowed' });
    }

    try {
        const { title, body } = req.body;
        
        // 1. Récupération du Token Cible
        // Par défaut, on cherche dans la requête (si test local). 
        // Sinon, on cherche sur le Serveur Vercel (si en Prod).
        const targetToken = req.body.token || process.env.ADMIN_DEVICE_TOKEN;

        if (!targetToken) {
            console.error("Aucun Token FCM (Device) trouvé. Impossible d'envoyer la notification.");
            return res.status(400).json({ success: false, message: "Token (ADMIN_DEVICE_TOKEN) manquant." });
        }

        if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY) {
            console.error("Les credentials Firebase Admin ne sont pas configurés sur ce serveur.");
            return res.status(500).json({ success: false, message: "Compte de Service Firebase manquant coté serveur." });
        }

        // 2. Fabrication du message Push V1
        const message = {
            notification: {
                title: title || 'Nouvelle Alerte Mystik',
                body: body || 'Une action nécessite votre attention.',
            },
            // Options supplémentaires pour Web/Android/iOS si besoin
            token: targetToken,
        };

        // 3. Envoi via FCM v1
        const response = await admin.messaging().send(message);
        
        console.log('✅ Push envoyé avec succès ! MessageID:', response);
        return res.status(200).json({ success: true, messageId: response });

    } catch (error) {
        console.error('❌ Erreur Envoi Firebase Push:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}
