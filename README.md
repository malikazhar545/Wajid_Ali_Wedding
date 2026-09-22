# Wajid Ali · A Wedding Celebration

A burgundy-and-ivory floral wedding invitation with a private organizer dashboard, personalized guest cards, and a persistent backend.

## Organizer guide

1. Open `/backend` and sign in with your username and password.
2. Click **Add new guest**. Enter a name and an optional label for matching names.
3. Tick **Mehndi**, **Baraat**, **Walima**, or all three. Choose **With family** or **Without family**, then click **Create invitation**.
4. Each guest row shows its **Personal invitation link**. Click **Copy link** and share that link with that guest. It opens only their card, without a guest list or name search.
5. Open **Dates & venues**. Pick each date from the calendar, enter its Pakistan time, venue and full address.
6. Click **Choose pin on map**. Paste a Google Maps link, a Plus Code such as **832G+9WX, District, Manga Mandi, Lahore, Pakistan**, coordinates, or a hall/landmark name with its area into the single input. The Google preview updates automatically after you finish typing; Enter or **Preview location** also works. Check the result, click **Use this pin** / **Use this location**, then **Save all details**. Coordinates are optional: Google listing, search, directions, and short Share links remain usable destinations without them. Your venue name and written address stay separate. **Pin picker** is an optional manual map for unlisted entrances; click or drag and the input fills with coordinates. It uses OpenStreetMap, which has fewer landmarks than Google. Changing areas clears the draft; **Cancel** keeps your saved destination.

Family members can open `/family`, sign in with the organizer credentials, and use the original main page to search names and view cards without using the dashboard. The dashboard?s **View guest cards** link opens this same main page. Use **Sign out of family view** when finished. The family view refreshes every 30 seconds and on window focus, including session expiry. Signed-out visitors see a personal-link message and a contact-family button instead of the list.

No JSON editing is needed. Dates can remain empty until confirmed. Guests see only their selected functions. Open cards refresh every 30 seconds and when their browser window regains focus; venue changes update the same way.

New personal links return a server-rendered preview with the title **Wajid Ali invites you, [Guest Name], to his wedding** and a burgundy-and-ivory wedding card image. The browser and native share sheet use the same personal title. Netlify serves these links through `netlify/functions/invitation.mjs`, with the built HTML bundled via `included_files`; the local Vite server uses the same metadata renderer. Preview generation reads only the linked guest and wedding settings. Messaging apps control whether and when previews appear and may cache previously shared links.

The share artwork is `public/wedding-share-card-v2.jpg` (1200 x 630), rendered from `design-assets/share-card.html`. The JPEG is about 67 KB instead of the original 268 KB PNG, which is retained for previously shared previews. Regenerate both with `node design-assets/render-share-card.mjs` after changing the artwork. Metadata follows the [Open Graph protocol](https://ogp.me/); HTML packaging uses [Netlify function configuration](https://docs.netlify.com/build/functions/configuration/).

For faster WhatsApp previews, guest and settings reads run concurrently, the function reuses its HTML template, and successful preview HTML uses [Netlify durable caching](https://docs.netlify.com/build/caching/caching-overview/) for up to 60 seconds per full invitation URL. Copying/sharing a link also warms its preview without sending organizer credentials or delaying the clipboard/share action. Preview text can take up to 60 seconds to reflect an edit or removal; invitation details and RSVP APIs remain uncached and check the current record. Errors and missing invitations are never cached. WhatsApp controls its own preview fetch and caching, so instantaneous previews cannot be guaranteed.

Guests can RSVP in English with **Joyfully accepts** or **Regretfully declines**, then click **Send RSVP**. They can revisit the same invitation and update their reply. A reply covers the named guest/family and the functions on that invitation; it is not a headcount. The dashboard shows **Accepted**, **Declined**, or **Awaiting reply**, the response time in Pakistan time, totals and an RSVP filter. The guest list refreshes replies every 30 seconds and on window focus while no guest is being edited. Editing a guest or changing wedding details preserves their reply.

**Contact family on WhatsApp** opens a chat to `+92 317 4539300` with an editable greeting. The guest chooses whether to send it. RSVP is saved directly to the backend and does not send a WhatsApp message.

Selecting a new pin clears the previous link; selecting a link or address search clears the previous pin. Guest directions and sharing use the selected destination. Unresolved links open directly without an unrelated address preview. Short links from `maps.app.goo.gl`, `goo.gl/maps`, `share.google`, `search.app`, and `g.co/kgs` can be saved immediately while the authenticated backend attempts bounded coordinate resolution through allowed Google hosts. Failed resolution keeps the usable original link. Full Plus Codes decode offline with [Google's Open Location Code library](https://github.com/google/open-location-code). Local shortened codes with Manga Mandi, Raiwind, or Bahria Town Lahore are recovered near the documented area centers. Short codes with other towns remain Google search destinations; very short codes require a street-level reference, and a short code without its town requests the missing area instead of guessing coordinates. Plain place names are labelled as address searches and need visual confirmation. Camera-only URLs can be saved as map links but never become exact coordinates. Native paste, mobile input and typing all use the same input-change flow. No map API key is required. The Google iframe is a preview and cannot send clicks back to the app. **Use my location** is optional, asks permission only on click, and is available in the manual **Pin picker**, along with keyboard panning and **Place pin at map center**.

Map references: [Leaflet interaction API](https://leafletjs.com/reference), [OpenStreetMap tile usage](https://operations.osmfoundation.org/policies/tiles/), [Google Maps links](https://developers.google.com/maps/documentation/urls/get-started).

**Invitation wording & family name** contains optional text customization. **Download backup** saves a copy of your data; it is optional and is not an import feature. `/admin` remains a compatible alias for `/backend`.

## Run locally

```powershell
npm.cmd install
npm.cmd run dev
```

Invitation: `http://127.0.0.1:5173/`
Dashboard: `http://127.0.0.1:5173/backend`

Configured credentials are in the local, git-ignored `.env` file. The server reads them; they are never bundled into the frontend. Without `.env`, local-only defaults are username `ma9440863` and password `wajid-local-only`. Restart the server after changing credentials.

Local changes persist in `.local-data/wedding.json`. Four example guests are created only on the first run. Browser tests use isolated data under `test-results/`; they do not edit the organizer's data. `npm run preview` serves static assets only; use `npm run dev` for the local backend.

## Publish on Netlify

1. Import this project through a Git repository. `netlify.toml` configures the build, functions and routes. Uploading `dist` alone does not deploy the backend.
2. Set `ADMIN_USERNAME` and `ADMIN_PASSWORD` in Netlify environment variables, available to Functions. Use the same organizer credentials if desired. The password must contain at least 10 characters. Do not prefix these names with `VITE_`.
3. Deploy, then sign in at `https://your-site.netlify.app/backend`.
4. Add actual guests and details. Local data is not automatically uploaded; production starts empty.

Netlify Functions use Netlify Blobs with strong consistency. Production data survives redeployment; deploy previews have isolated storage. The local `.env` is not deployed. No separate database account is needed.

## Design and data

Original watercolor floral artwork, lace borders, burgundy envelopes, ivory paper, a WA monogram, Arabic Bismillah and locally hosted calligraphy. Name selection in the signed-in family view opens an envelope animation; reduced-motion preferences skip it. Occasion previews, a live countdown, calendar downloads and personalized date cards make the invitation interactive. The existing organizer dashboard is preserved.

New installations use demonstration dates of 17, 18 and 20 December 2026. Replace these through **Dates & venues**. Existing saved dates, venues and guest records are preserved during deployment; dates are never hardcoded in the frontend. Calendar exports and countdowns use Pakistan time.

Invalid hand-edited dates appear unconfirmed until the organizer chooses a valid calendar date. Raw data is not silently rewritten. Fonts and their licenses are in `public/fonts/`. The image source and generation prompt are documented in `design-assets/ARTWORK.md`.

The name-selection screen and directory API return guest names, labels and links only to signed-in family. Guest links use existing random IDs and stay valid after edits or redeployment; anyone holding or receiving a forwarded personal link can open that one invitation. Previously shared links remain valid. Direct guest pages never fetch the directory and have no guest-list navigation. Private family previews use `?preview=`, while sharing produces a personal `/invite/guest-name/private-id` link. Existing `?invite=` links still work. Names in the URL are descriptive; the private ID selects the invitation, so old links still work after a name edit. The app does not send messages automatically.

Organizer changes require a signed HttpOnly session and server validation. Guests can submit only an accepted/declined RSVP using their invitation link; their replies are visible in the organizer dashboard. There is no public name directory. Sessions last eight hours; changing either credential invalidates existing sessions. The Netlify API is rate limited. Simultaneous edits use the last saved version. There are no trackers or analytics.

## Verification

```powershell
npm.cmd test
npm.cmd run test:browser
npm.cmd run build
```

Checks cover guest-directory privacy, family sign-in and main-page browsing, personal-link copying, direct guest access without list requests, username/password authentication, guest CRUD, function filtering, family options, validation, calendar dates, venues, open-card refresh, logout, envelope animation and mobile layouts. Browser checks require Chrome and use port 5174.
