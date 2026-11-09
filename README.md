# service-as-offer

Static interactive prototype. Open `index.html` to browse the pages.

## File layout

Each HTML page references its page stylesheet, `{page}.css` (e.g.
`02-service-detail.css`). Shared interactive components load their own stylesheet
where needed, such as `store-time-picker.css`, keeping component presentation in
one reusable source. The numbered extracted fragments (`*-2.css`, `*-3.css`) have
been removed.
Page-specific JavaScript remains in external `{page}.js` files. Shared behavior lives in
`service-journey.js`, `service-catalog.js`, `booking-fixtures.js`,
`store-time-picker.js` and `figma-copy.js`. Tests are in `tests/`
(run with `node tests/checkout.test.cjs` and
`node tests/store-time-picker.test.cjs` from this folder).

Service detail now previews available stores plus date/time options before purchase.
`store-time-picker.js` and `store-time-picker.css` own the shared store/date/time
picker behavior and presentation used by service details, checkout,
payment-result booking and order booking.
`StoreTimePicker.open({root, value, mode, trigger})` resolves a confirmed selection
with city key, store ID/name, ISO date and time, or null on dismissal. Modes are
`preview` (time optional), `checkout` (complete selection, no submission) and
`order` (complete selection handed back to the order flow). Drafts are discarded
on close; the nested city/store list commits only on its own confirmation.
Use `10-service-order-detail.html?selectBooking=1` to enter the shared selector;
existing bookings and unknown results cannot use it to bypass booking safeguards.
Checkout supports two modes: book now (select store/date/time in checkout) or
book later (pay first, keep the service order in pending-booking state). Payment
and booking are rendered as separate confirmations in the payment-result page.

Cards use square corners. In order details, the arrival QR code for booked orders
and the queue number for queued orders appear directly below the order status,
above the appointment information.
Store information in service details (including the store sheet) and order
details pairs navigation and message icons, each with a 44px tap target.
Navigation opens the store map; messaging opens the existing store-contact dialog.
These 18px icons use black inline SVG strokes, not external CSS
masks, so they remain visible when opening the prototype as local files.

The homepage service directory uses compact rows and brand-blue prices while
keeping service descriptions and tags visible.
The Figma 1126:16388-based homepage defaults to benefits and offers four
preview scenarios for orders, benefits, and fixed example recommendations.
The directory groups 15 service options into six entries: safety inspection,
bicycle maintenance (standard/full/deep), badminton stringing, tennis stringing,
ski waxing (regular/end-of-season), and ski maintenance (snowboard/skis).
`service-catalog.js` shares these groups between the directory and detail page.
Grouped entries show the lowest reference price; the detail page selects the
lowest-priced option initially and carries the selected option and price to checkout.

Appointments are time arrangements on a service order, not independent orders.
Rescheduling is not offered. Booked orders before check-in offer appointment
cancellation with a confirmation dialog; unpaid orders offer service-order
cancellation. Cancelling the appointment retains the service order.
Existing booked orders cannot enter store/date selection to bypass the
no-rescheduling rule.

## Spec v0.18 alignment

- The homepage previews example orders, benefits and recommendations; the
  previous entry-specific homepage is archived separately in `draft/`.
- Unknown payment results show a loading toast. A local timer polls a mock result
  every 1.5 seconds; success/failure controls supply that result for the next tick.
  Unknown never automatically becomes success. No payment API is called.
- Refused location defaults to Shanghai and opens a notice. Preview via
  `10-service-order-detail.html?selectBooking=1&location=denied`, which opens
  the shared selector on the order with the default-city notice.
- The shared calendar shows 7 consecutive sample dates, November 3–9, 2026.
  This fixed review fixture is not a decision about production inclusion of today,
  endpoint dates, timezone or cutoff algorithms. Resource availability is mocked.
- Schedule controls cover normal success, conflict and three no-response query
  outcomes. All return to the same service order; result dialogs are feedback
  within the order's status, not a separate flow node. The unknown-result message
  stays in the order status bar, with no QR code or repeat submission.
- The order's 23:59 controls simulate the appointment day's no-update rule:
  no updates cancel only the appointment and return the order to pending booking;
  an updated appointment stays booked. These controls do not run a real scheduler
  or determine the production definition of a record update.
- The message page previews the six confirmed WeChat events, including the queue
  number and estimated waiting time. It sends no notifications; reminder timing,
  subscription, delivery recovery, refunds and final verification remain deferred.

White page-level navigation bars follow the shared Figma mini-program header:
system status, centered title, back control, and the top-right capsule.

Mobile artboards use the Figma 375px viewport and shared Vitamin C colors,
typography, and mini-program navigation. The bicycle service-detail hero image
uses the local Figma asset in `assets/figma/service-detail-bike-hero.png`.
