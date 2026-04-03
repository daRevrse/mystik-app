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
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Only POST requests allowed' });
    }

    try {
        const { title, body } = req.body;
        
        // 1. Récupération de TOUS les tokens actifs dans Firestore
        const adminDevicesSnap = await admin.firestore().collection('admin_devices').get();
        let tokens = [];
        let tokenDocIds = [];

        adminDevicesSnap.forEach(doc => {
            const data = doc.data();
            if (data.token) {
                tokens.push(data.token);
                tokenDocIds.push(doc.id);
            }
        });

        // Backward compatibility (fallback sur l'ancien champ unique)
        if (tokens.length === 0) {
            const settingsDoc = await admin.firestore().doc('settings/notifications').get();
            if (settingsDoc.exists && settingsDoc.data().adminToken) {
                const oldToken = settingsDoc.data().adminToken;
                tokens.push(oldToken);
                tokenDocIds.push('legacy');
            }
        }

        // Fallback .env
        if (tokens.length === 0 && process.env.ADMIN_DEVICE_TOKEN) {
            tokens.push(process.env.ADMIN_DEVICE_TOKEN);
            tokenDocIds.push('env');
        }

        if (tokens.length === 0) {
            return res.status(200).json({ success: true, message: "Aucun récepteur configuré." });
        }

        // 2. Envoi via messaging().sendEach()
        const messages = tokens.map(token => ({
            notification: {
                title: title || 'Nouvelle Alerte Mystik',
                body: body || 'Une action nécessite votre attention.',
            },
            token: token,
        }));

        const response = await admin.messaging().sendEach(messages);
        
        // 3. Nettoyage automatique des tokens expirés
        const cleanupPromises = [];
        response.responses.forEach((resp, idx) => {
            if (!resp.success) {
                const errorCode = resp.error?.code;
                const docId = tokenDocIds[idx];
                
                // Si le token est invalide ou n'est plus enregistré, on le supprime de Firestore
                if (errorCode === 'messaging/registration-token-not-registered' || 
                    errorCode === 'messaging/invalid-registration-token') {
                    
                    if (docId && docId !== 'legacy' && docId !== 'env') {
                        cleanupPromises.push(
                            admin.firestore().collection('admin_devices').doc(docId).delete()
                        );
                        console.log(`[CLEANUP] Supression token invalide : ${docId}`);
                    }
                }
            }
        });
        
        if (cleanupPromises.length > 0) await Promise.all(cleanupPromises);

        console.log(`✅ Résultat Push : ${response.successCount} succès, ${response.failureCount} échecs.`);
        return res.status(200).json({ 
            success: true, 
            successCount: response.successCount, 
            failureCount: response.failureCount 
        });

    } catch (error) {
        console.error('❌ Erreur Envoi Multi-Push:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}
