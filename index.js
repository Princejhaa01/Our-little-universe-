const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getMessaging } = require('firebase-admin/messaging');

initializeApp();
const db = getFirestore();

// Keep this allowlist identical to the two accounts allowed by the app.
const ALLOWED_EMAILS = new Set([
  'antragond40@gmail.com',
  'jhap20046@gmail.com'
]);

exports.sendChatPush = onDocumentCreated(
  { document: 'messages/{messageId}', region: 'us-central1' },
  async event => {
    const data = event.data?.data();
    if (!data) return;

    const senderEmail = String(data.senderEmail || '').toLowerCase();
    if (!ALLOWED_EMAILS.has(senderEmail)) {
      console.warn('Ignoring message from an unapproved sender.');
      return;
    }

    const tokenSnapshot = await db.collection('pushTokens').get();
    const recipients = tokenSnapshot.docs.filter(doc =>
      String(doc.data().email || '').toLowerCase() !== senderEmail &&
      typeof doc.data().token === 'string' && doc.data().token.length > 0
    );
    if (!recipients.length) return;

    const message = data.customSticker
      ? `${data.customSticker.emoji || '💗'} ${data.customSticker.caption || ''}`.trim()
      : data.stickerKey
        ? '🧸 Sticker'
        : data.audio
          ? '🎤 Voice message'
          : String(data.text || 'Aapke liye ek naya message hai.').slice(0, 140);

    const response = await getMessaging().sendEachForMulticast({
      tokens: recipients.map(doc => doc.data().token),
      notification: {
        title: String(data.name || 'New message').slice(0, 60),
        body: message
      },
      data: {
        type: 'chat',
        messageId: event.params.messageId,
        senderEmail
      },
      webpush: {
        headers: { TTL: '86400', Urgency: 'high' }
      }
    });

    const invalidCodes = new Set([
      'messaging/invalid-registration-token',
      'messaging/registration-token-not-registered'
    ]);
    const cleanup = [];
    response.responses.forEach((result, index) => {
      if (!result.success && invalidCodes.has(result.error?.code)) {
        cleanup.push(recipients[index].ref.delete());
      }
    });
    if (cleanup.length) await Promise.all(cleanup);
    console.log(`Chat push: ${response.successCount} sent, ${response.failureCount} failed.`);
  }
);
