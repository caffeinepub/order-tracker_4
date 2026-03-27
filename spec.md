# MR Orders Dashboard

## Current State
- App has a read-only shared order link (`?order=<id>`) for clients via `SharedOrderView`
- Each order's `OrderView` has a Share button that copies the client link
- Title reads "MR Progress Platform" in the header

## Requested Changes (Diff)

### Add
- A "Vendor Link" button in `OrderView` (next to existing Share button) that copies a URL with `?vendor=<id>` param
- A new `VendorOrderView` component: shows a single order in editable mode (reuses OrderView logic), no access to order list, no back-to-app button
- Routing in `App.tsx` to render `VendorOrderView` when `?vendor=` param is present

### Modify
- Header title in `OrderTracker.tsx` from "MR Progress Platform" to "MR Orders Dashboard"

### Remove
- Nothing

## Implementation Plan
1. Update `OrderTracker.tsx` title text
2. Add "Vendor Link" button in `OrderView.tsx` that copies `?vendor=<id>` URL
3. Create `VendorOrderView.tsx` - fetches single order by id, renders it in editable mode, no navigation to order list
4. Update `App.tsx` to detect `?vendor=` param and render `VendorOrderView`
