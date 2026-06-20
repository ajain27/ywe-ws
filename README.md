# You Win Estates

A real estate wholesale website. Visitors can browse available deals, view
photos and the Zillow listing, and submit an offer. Offers land in your email
with the buyer's contact info so you can call them back.

Stack: React (Vite) frontend + Firebase (Firestore for data, Cloud Functions
+ Nodemailer for offer emails).

## How it works

- **Add a Deal** (homepage, open to anyone right now — see "Locking it down"
  below): address, city/state/zip, price, description, a photos link, and a
  Zillow link. Saves to the `deals` collection in Firestore.
- **Available Deals to Purchase**: a live grid of thumbnails (first image
  from the photos link), pulled from Firestore in real time.
- **Deal detail page**: click a thumbnail to see the full listing with three
  buttons — *View on Zillow*, *View Photos* (opens the photos link), and
  *Make Offer*.
- **Make an Offer**: buyer fills in name, email, phone, offer amount, and an
  optional message. Saves to the `offers` collection, which triggers a Cloud
  Function that emails you the offer + buyer contact info via Gmail.

## One-time setup

### 1. Create a Firebase project

1. Go to the [Firebase console](https://console.firebase.google.com/) and
   create a new project.
2. Enable **Firestore Database** (Build → Firestore Database → Create
   database, start in production mode).
3. Enable **Cloud Functions**, which requires upgrading to the **Blaze**
   (pay-as-you-go) plan — outbound network calls (sending email) aren't
   available on the free Spark plan. Usage at this scale (a wholesale
   site's offer volume) will stay well within the free tier limits, so
   you're unlikely to actually be billed.
4. In Project Settings → General, scroll to "Your apps" and add a **Web
   app**. Copy the `firebaseConfig` values it gives you.

### 2. Configure the frontend

```bash
cp .env.example .env
```

Fill in `.env` with the values from your Firebase web app config:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Install dependencies and run locally:

```bash
npm install
npm run dev
```

### 3. Set up the Firebase CLI and link the project

```bash
npm install -g firebase-tools
firebase login
```

Edit `.firebaserc` and replace `REPLACE_WITH_YOUR_FIREBASE_PROJECT_ID` with
your actual Firebase project ID (find it in Project Settings).

### 4. Configure the offer-email Cloud Function

The function uses Gmail + an [App Password](https://myaccount.google.com/apppasswords)
(requires 2-Step Verification enabled on the Gmail account):

```bash
cd functions
npm install
cp .env.example .env
```

Fill in `functions/.env`:

```
GMAIL_USER=your-gmail-address@gmail.com
GMAIL_APP_PASSWORD=your-16-char-app-password
OWNER_EMAIL=where-you-want-offers-sent@gmail.com
```

`OWNER_EMAIL` is where every new-offer email is sent — set it to your own
inbox so you can call buyers back. `functions/.env` is gitignored; never
commit it.

### 5. Deploy

```bash
# from the project root
firebase deploy --only firestore:rules,functions
npm run build
firebase deploy --only hosting
```

After this, `firebase deploy --only functions` will pick up new versions of
`functions/index.js`, and `npm run build && firebase deploy --only hosting`
publishes frontend changes.

## Locking it down before going fully public

Right now anyone who finds the site can add a deal (you asked for this to
stay open for now). Before sharing the link widely, consider adding a simple
password gate on the "Add a Deal" form so random visitors can't post listings
as you — ask me to add that whenever you're ready.

## Project structure

```
src/
  api/deals.js          Firestore reads/writes (deals + offers)
  components/           Header, Footer, AddDealForm, DealCard
  pages/                HomePage, DealDetailPage, MakeOfferPage
  firebase.js           Firebase app/Firestore init from .env
functions/
  index.js              Cloud Function: emails you on new offer
firestore.rules         Firestore security rules
```
# ywe-ws
