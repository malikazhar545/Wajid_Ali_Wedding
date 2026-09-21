# Wajid Ali · A Wedding Celebration

A burgundy-and-ivory floral wedding invitation with a private organizer dashboard, personalized guest cards, and a persistent backend.

## Organizer guide

1. Open `/backend` and sign in with your username and password.
2. Click **Add new guest**. Enter a name and an optional label for matching names.
3. Tick **Mehndi**, **Baraat**, **Walima**, or all three. Choose **With family** or **Without family**, then click **Create invitation**.
4. Click **Copy link** beside the guest and share it, or share the homepage so guests can select their name.
5. Open **Dates & venues**. Pick each date from the calendar, enter its Pakistan time, venue and full address.
6. Click **Choose pin on map**, jump to a nearby city, zoom in and click the exact venue entrance. Drag the pin to adjust it, then click **Use this pin** and **Save all details**. Guests see your address, a Google Map, directions and a share-location button.

No JSON editing is needed. Dates can remain empty until confirmed. Guests see only their selected functions. Open cards refresh every 30 seconds and when their browser window regains focus; venue changes update the same way.

Guests can RSVP in English with **Joyfully accepts** or **Regretfully declines**, then click **Send RSVP**. They can revisit the same invitation and update their reply. A reply covers the named guest/family and the functions on that invitation; it is not a headcount. The dashboard shows **Accepted**, **Declined**, or **Awaiting reply**, the response time in Pakistan time, totals and an RSVP filter. The guest list refreshes replies every 30 seconds and on window focus while no guest is being edited. Editing a guest or changing wedding details preserves their reply.

**Contact family on WhatsApp** opens a chat to `+92 317 4539300` with an editable greeting. The guest chooses whether to send it. RSVP is saved directly to the backend and does not send a WhatsApp message.

The saved pin takes priority over address searches and pasted map links, so directions lead to the exact coordinates you choose. **Use my location** is optional and asks your browser for permission only when clicked. The organizer's pin picker uses OpenStreetMap; guest maps, directions and shared links use Google Maps. No map API key is required. Internet access is needed for map tiles and embedded maps. The interactive picker supports keyboard panning and **Place pin at map center**.

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

Original watercolor floral artwork, lace borders, burgundy envelopes, ivory paper, a WA monogram, Arabic Bismillah and locally hosted calligraphy. Name selection opens an envelope animation; reduced-motion preferences skip it. Occasion previews, a live countdown, calendar downloads and personalized date cards make the invitation interactive. The existing organizer dashboard is preserved.

New installations use demonstration dates of 17, 18 and 20 December 2026. Replace these through **Dates & venues**. Existing saved dates, venues and guest records are preserved during deployment; dates are never hardcoded in the frontend. Calendar exports and countdowns use Pakistan time.

Invalid hand-edited dates appear unconfirmed until the organizer chooses a valid calendar date. Raw data is not silently rewritten. Fonts and their licenses are in `public/fonts/`. The image source and generation prompt are documented in `design-assets/ARTWORK.md`.

The name-selection screen exposes guest names and optional labels. Selecting a name is not identity verification; anyone with the link can open a listed invitation. Do not put private contact details in public labels. The app does not send messages automatically.

Organizer changes require a signed HttpOnly session and server validation. Guests can submit only an accepted/declined RSVP using their invitation link; their replies are excluded from the public name directory. Sessions last eight hours; changing either credential invalidates existing sessions. The Netlify API is rate limited. Simultaneous edits use the last saved version. There are no trackers or analytics.

## Verification

```powershell
npm.cmd test
npm.cmd run test:browser
npm.cmd run build
```

Checks cover username/password authentication, guest CRUD, function filtering, family options, validation, calendar dates, venues, open-card refresh, logout, envelope animation and mobile layouts. Browser checks require Chrome and use port 5174.
