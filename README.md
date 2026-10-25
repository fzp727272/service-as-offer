# service-as-offer

Static interactive prototype. Open `index.html` to browse the pages.

Cards use square corners. In order details, the arrival QR code for booked orders
and the queue number for queued orders appear directly below the order status,
above the appointment information.

The homepage service directory uses compact rows and brand-blue prices while
keeping service descriptions and tags visible.
The directory groups 15 service options into six entries: safety inspection,
bicycle maintenance (standard/full/deep), badminton stringing, tennis stringing,
ski waxing (regular/end-of-season), and ski maintenance (snowboard/skis).
`service-catalog.js` shares these groups between the directory and detail page.
Grouped entries show the lowest reference price; the detail page selects the
lowest-priced option initially and carries the selected option and price to checkout.

Rescheduling and service-order cancellation are state-specific actions in order
details, not a separate journey-navigation group. Booked orders before check-in
offer rescheduling and appointment cancellation; unpaid orders offer service-order
cancellation. These actions open dialogs. Rescheduling keeps the original booking
until a new slot is confirmed.
The legacy 10/13 URLs redirect to order details and open the corresponding dialog.
