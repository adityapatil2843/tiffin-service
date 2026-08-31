# TFNS Web Frontend Build Tasks

## Phase 0 — Discovery & Planning
- [x] Explore React Native screens, stores, and backend routes.
- [x] Propose Next.js routing structures and layout designs.
- [x] Create comprehensive implementation plan and verify project requirements.

## Phase 1 — Authentication & Global State
- [x] Set up shared type declarations in `client/types/` representing API models (User, Menu, Bill, TiffinRequest).
- [x] Implement typed API client (`client/lib/api/client.ts`) with interceptors handling `js-cookie` token injection.
- [x] Migrate Zustand `useAuthStore` to Next.js in `client/lib/store/authStore.ts`.
- [x] Design high-fidelity, premium web-native `/login` screen (supporting User ID & Email toggles).
- [x] Add Next.js Route Middleware (`middleware.ts`) to restrict unauthorized access to user/owner/super-admin sub-paths.

## Phase 2 — User Portal (Customer/Student)
- [x] Build `/user` routing segment with common responsive layout (top nav or sidebar).
- [x] Implement `user/home/page.tsx`: Today's menu card, special labels, veg/non-veg badges, and weekly menu preview.
- [x] Implement `user/tiffin/page.tsx`: Active tiffin request history list and modal/drawer form for new cancellation or extra request submission.
- [x] Implement `user/bills/page.tsx`: Detailed invoice list displaying status badge, total amount, and itemized delivery/deduction/addition summary.
- [x] Implement `user/profile/page.tsx`: Contact information, delivery address card, and active subscription details.

## Phase 3 — Owner Portal: Subscribers & Request Review
- [x] Build `/owner` layout with sidebar navigation.
- [x] Implement `owner/users/page.tsx`: Interactive users directory table with text search, active/inactive badge filters, and status toggles.
- [x] Implement `owner/users/new/page.tsx`: Subscriber registration form (Name, Phone, Email, Password, Address, initial Diet/Plan selection).
- [x] Implement `owner/users/[id]/page.tsx`: Client detail panel showing basic profile editor, pause/resume actions, billing records, and meal log charts.
- [x] Implement `owner/requests/page.tsx`: Unified review list containing pending cancellations and extra requests from students, with approve/reject actions.

## Phase 4 — Owner Portal: Menu Planner & Invoicing
- [ ] Implement `owner/menu/page.tsx`: Two tabs - "Daily Plan" (Date, Meal Type, multiselect dishes selector) and "Dishes" (recipe additions, list with category colors).
- [ ] Implement `owner/billing/page.tsx`: Billing grid showing client invoices, with monthly filters.
- [ ] Implement "Generate Monthly Bills" dialog/form calling `/api/bill/generate`.
- [ ] Implement "Record Payment Status" modal calling `/api/bill/:billId/payment`.
- [ ] Implement `owner/dashboard/page.tsx`: Rich dashboard stats (Total Users, Deliveries Today, Pending Requests, Revenue charts using Recharts).

## Phase 5 — Super Admin Portal
- [ ] Build `/super-admin` layout with sidebar.
- [ ] Implement `super-admin/dashboard/page.tsx`: Platform statistics summary (Registered owners, active subscription counts, global revenue stats).
- [ ] Implement `super-admin/owners/page.tsx`: Mess owners list displaying service prefix, owner name, and status.
- [ ] Implement `super-admin/owners/new/page.tsx`: Registration form for new owner account and mess service initialization.
- [ ] Implement `super-admin/settings/page.tsx`: Settings page with functional Sign Out and placeholder account modification actions.
