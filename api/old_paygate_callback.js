import admin from 'firebase-admin';

// Initialisation globale de Firebase Admin pour les fonctions serverless
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : '',
            }),
        });
        console.log("🔥 Firebase Admin Initialisé (Callback PayGate)");
    } catch (error) {
        console.error('Erreur initialisation Firebase Admin', error.stack);
    }
}

/**
 * Endpoint Callback pour PayGate Global
 * Reçoit les notifications POST de PayGate une fois le paiement traité.
 */
export default async function handler(req, res) {
    // PayGate envoie généralement une requête POST
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Only POST requests allowed' });
    }

    try {
        // Log des données reçues pour débogage (Utile en production via Vercel Logs)
        console.log("PayGate Callback Received:", JSON.stringify(req.body));

        // Extraction des paramètres (Standard PayGate Global)
        // identifier: Notre ID de commande (ex: MTK-123456)
        // status: 0 = Succès, tout autre chose = Échec/Annulation
        // tx_reference: Référence interne PayGate
        const { identifier, status, tx_reference, amount } = req.body;

        if (!identifier) {
            console.error("Callback PayGate sans identifiant de commande.");
            return res.status(400).json({ success: false, message: "Identifiant manquant" });
        }

        const db = admin.firestore();
        const orderRef = db.collection('orders').doc(identifier);
        
        // Vérification si la commande existe
        const orderSnap = await orderRef.get();
        if (!orderSnap.exists) {
            console.error(`Commande ${identifier} introuvable dans Firestore.`);
            return res.status(404).json({ success: false, message: "Commande introuvable" });
        }

        // Mise à jour du statut en fonction du résultat de PayGate
        // status 0 = Succès chez PayGate Global
        if (parseInt(status) === 0) {
            await orderRef.update({
                paymentStatus: 'Payé',
                status: 'En préparation', // Optionnel: passer la commande en préparation automatiquement
                paygateReference: tx_reference || 'N/A',
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            console.log(`✅ Commande ${identifier} marquée comme PAYÉE.`);
        } else {
            // On peut marquer comme Échec ou laisser "Non payé"
            await orderRef.update({
                paymentStatus: 'Échec de paiement',
                paygateErrorStatus: status,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            console.log(`❌ Commande ${identifier} mise à jour avec statut ÉCHEC (${status}).`);
        }

        // PayGate attend une réponse 200 OK pour arrêter de renvoyer la notification
        return res.status(200).send("OK");

    } catch (error) {
        console.error('❌ Erreur Callback PayGate:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}
