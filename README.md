# Boro

![Boro penguin wordmark](public/boro-wordmark.svg)

**Borrow More. Own Less.** A UIUC campus marketplace and community demo built with React, TypeScript, and Vite.

## Run

```bash
npm install
npm run dev
```
  
Open the URL shown by Vite. `npm run build` creates a production bundle in `dist/`.

## What We Showed

- **Explore:** search for “formal dress” and open Amina's free listing. The listing has a saved borrowing agreement, date checks, a simulated lender profile, and a free checkout path.
- **Groups:** open UIUC Fashion Exchange, browse its inventory, view member profiles, and create or join a public group. UIUC Women Borrowing stays hidden from the nonmember demo account.
- **Urgent Requests:** the **Try a scenario** buttons prefill a cookie catering request one week ahead, a digicam request for tomorrow, or a lighter request for today. Another demo account can comment, upvote, and offer a price with an attached listing. Choosing an offer starts a chat.
- **Messages:** negotiate in the item-specific chat. Price proposals can be accepted or countered; accepting updates a pending demo deal.
- **Other listing types:** create a sale, service, or lease-to-buy listing with **List an Item**. Add up to three listing photos. Lease-to-buy shows rental credit toward the buyout and a simulated refundable deposit.
- **My Boros:** follow loan pickup and return, or accept and complete a sale, service, or lease. Borrowers and lenders can add before-pickup and after-return condition photos; lease deals support the same record. The Demo clock shows late estimates. **Reset demo** returns both marketplace and social data to seeds.

Everything, including compressed uploaded photos, runs in this browser's localStorage. Uploaded photos are visible only in that browser and are not shared with other visitors. The four students, profile photos, reviews, reputation figures, membership counts, listings, and transactions are fictional demo content. Profile photos are stock images, not photos of these fictional students. Paid checkout, deposits, buyout, and email verification are simulated; no money is charged and no university credentials are collected.

The item and group photos are remotely served Pexels stock images; the campus photo comes from the University of Illinois. See [PHOTO_SOURCES.md](PHOTO_SOURCES.md) for source pages; an internet connection is needed for photos.

## Production integration points

`src/demoServices.ts` contains replaceable storage, demo account, and checkout functions. A real launch would require server authentication, Illinois email verification and approved student-affiliation checks, Stripe Connect or an equivalent regulated payments system, server-side group authorization, message moderation, and persistent database storage. Private-group membership in this prototype stands for self-identification plus moderator approval and is not a safety guarantee.

Campus Resources links to university pages. Their equipment remains under institutional booking and policy, separate from Boro checkout and late estimates.

## Campus level and marketplace filters

Boro is the turquoise platform layer. The current subcampus is UIUC, with a separate Illinois blue and orange visual treatment and Main Quad photo. Groups, including UIUC Women Borrowing, live inside the UIUC campus navigation beneath the campus header. Explore has Rent, Buy, and Rent + buy filters plus price sorting. Listings can be free/paid rentals, sales, services, or rent with a buyout option. New listings can specify a public campus spot, apartment lobby or entrance, or cafe meetup.

## Student services and urgent forum

The UIUC Services tab includes student storefronts, quick cookie boxes, cookie catering with seven-day notice, a barber, photo sessions, and moving help. Service requests collect a date, quantity, and order notes; the seller accepts before a simulated checkout. The UIUC Urgent Forum is a separate feed for time-sensitive requests, comments, offers, and item-specific chat.

The Boro header is platform-wide. Once inside UIUC, campus navigation contains Explore, Services, UIUC Groups, Urgent Forum, My Boros, and Messages.

The [tech stack](TECH_STACK.md) distinguishes this browser demo from the recommended production architecture.
