const { onDocumentCreated } = require('firebase-functions/v2/firestore')
const { setGlobalOptions } = require('firebase-functions/v2')
const admin = require('firebase-admin')
const nodemailer = require('nodemailer')

admin.initializeApp()
setGlobalOptions({ maxInstances: 5 })

const GMAIL_USER = process.env.GMAIL_USER
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD
const OWNER_EMAIL = process.env.OWNER_EMAIL || GMAIL_USER

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASSWORD,
  },
})

exports.sendOfferEmail = onDocumentCreated('offers/{offerId}', async (event) => {
  const offer = event.data.data()

  const subject = `New Offer: ${offer.dealAddress || 'Property'} - ${offer.offerAmount || ''}`
  const text = [
    `New offer received on You Win Estates`,
    ``,
    `Property: ${offer.dealAddress || ''}`,
    `Offer Amount: ${offer.offerAmount || ''}`,
    ``,
    `Buyer Name: ${offer.buyerName || ''}`,
    `Buyer Email: ${offer.buyerEmail || ''}`,
    `Buyer Phone: ${offer.buyerPhone || ''}`,
    ``,
    `Message: ${offer.message || '(none)'}`,
  ].join('\n')

  await transporter.sendMail({
    from: `You Win Estates <${GMAIL_USER}>`,
    to: OWNER_EMAIL,
    replyTo: offer.buyerEmail,
    subject,
    text,
  })
})
