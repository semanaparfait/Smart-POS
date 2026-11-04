// What a role may do. Mirrors the SmartPOS app's config/permissions.ts: the keys
// are a contract with the server, so never rename one.

export interface PermissionDef {
  key: string;
  label: string;
  description: string;
  // Turning this on also turns these on; turning one of them off turns this off.
  requires?: string[];
  // Money or other people's work.
  sensitive?: boolean;
}

export interface PermissionGroup {
  title: string;
  permissions: PermissionDef[];
}

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    title: "Selling",
    permissions: [
      { key: "sales.create", label: "Make sales", description: "Add products to the cart and place orders." },
      { key: "sales.checkout", label: "Take payments", description: "Complete orders at checkout with cash, MoMo or card.", requires: ["sales.create"] },
      { key: "sales.split_payment", label: "Split payments", description: "Let a customer pay one order with two methods.", requires: ["sales.checkout"] },
      { key: "sales.credit", label: "Sell on credit", description: "Let customers take goods now and pay later.", requires: ["sales.checkout"], sensitive: true },
      { key: "sales.cancel", label: "Cancel orders", description: "Cancel orders that have not been paid.", requires: ["sales.create"], sensitive: true },
    ],
  },
  {
    title: "Orders",
    permissions: [
      { key: "orders.view_own", label: "See own orders", description: "Open the Orders tab and see orders they made." },
      { key: "orders.view_all", label: "See everyone's orders", description: "See orders made by all staff, not only their own.", requires: ["orders.view_own"] },
    ],
  },
  {
    title: "Tables & services",
    permissions: [
      { key: "tables.manage", label: "Tables", description: "Open the Tables tab, seat guests and serve tables." },
      { key: "services.manage", label: "Services & bookings", description: "Book, check in and out, and take payments for bookings." },
      { key: "services.setup", label: "Set up services", description: "Add services, change prices, add or remove rooms, tables and items.", requires: ["services.manage"], sensitive: true },
      { key: "services.refund", label: "Cancel and refund bookings", description: "Cancel a booking or give money back. A reason is always asked for.", requires: ["services.manage"], sensitive: true },
    ],
  },
  {
    title: "Products & stock",
    permissions: [
      { key: "inventory.view", label: "See stock", description: "Open the Inventory tab and see stock levels." },
      { key: "inventory.adjust", label: "Adjust stock", description: "Record stock received, damaged or counted.", requires: ["inventory.view"], sensitive: true },
      { key: "products.manage", label: "Manage products", description: "Add products, change prices and edit categories.", sensitive: true },
    ],
  },
  {
    title: "Money & reports",
    permissions: [
      { key: "reports.view", label: "See sales reports", description: "See the dashboard, sales totals and best sellers.", sensitive: true },
      { key: "finance.verify", label: "Verify takings", description: "Count each worker's money and verify or flag it.", requires: ["reports.view"], sensitive: true },
      { key: "expenses.submit", label: "Submit expenses", description: "Record a bill they paid, with a receipt photo. It waits for approval." },
      { key: "payroll.manage", label: "Salaries & staff debts", description: "Charge workers for what they owe, approve payments, take it from salaries.", requires: ["reports.view"], sensitive: true },
      { key: "expenses.manage", label: "Record expenses", description: "Add, change and stop the company's costs, like rent and bills.", requires: ["reports.view"], sensitive: true },
      { key: "credits.view", label: "See credits", description: "See customers who owe money and who served them.", sensitive: true },
    ],
  },
  {
    title: "Kitchen",
    permissions: [
      { key: "kitchen.prepare", label: "Kitchen screen", description: "Open only the kitchen screen and mark orders ready. Signs in straight to it.", requires: ["sales.create", "orders.view_all"] },
    ],
  },
  {
    title: "Delivery",
    permissions: [
      { key: "deliveries.ride", label: "Deliver orders", description: "Take deliveries to customers, mark them delivered, collect money at the door." },
      { key: "deliveries.manage", label: "Manage deliveries", description: "See every delivery, send them out and choose who takes them." },
    ],
  },
  {
    title: "Team & settings",
    permissions: [
      { key: "employees.manage", label: "Manage employees", description: "Add, edit and deactivate employees.", sensitive: true },
      { key: "roles.manage", label: "Manage roles", description: "Create roles and change what they can do.", sensitive: true },
      { key: "devices.manage", label: "Manage devices", description: "Approve, disable and remove devices.", sensitive: true },
      { key: "settings.manage", label: "Company settings", description: "Change the company profile and settings.", sensitive: true },
    ],
  },
];

const ALL = PERMISSION_GROUPS.flatMap((g) => g.permissions);
const BY_KEY = new Map(ALL.map((p) => [p.key, p]));

export const permissionLabel = (key: string) => BY_KEY.get(key)?.label ?? key;

// Turning a permission on also turns on what it requires.
export function withRequirements(keys: Iterable<string>): Set<string> {
  const out = new Set<string>();
  const add = (key: string) => {
    if (out.has(key) || !BY_KEY.has(key)) return;
    out.add(key);
    BY_KEY.get(key)!.requires?.forEach(add);
  };
  for (const key of keys) add(key);
  return out;
}

// Turning a permission off also turns off everything that depends on it.
export function withoutDependents(keys: Set<string>, removed: string): Set<string> {
  const out = new Set(keys);
  const drop = (key: string) => {
    if (!out.delete(key)) return;
    for (const p of ALL) if (p.requires?.includes(key)) drop(p.key);
  };
  drop(removed);
  return out;
}

// One-tap starting points; every switch can still be changed.
export const ROLE_PRESETS: { name: string; description: string; permissions: string[] }[] = [
  { name: "Cashier", description: "Sells and takes payments.", permissions: ["sales.create", "sales.checkout", "sales.split_payment", "orders.view_own"] },
  { name: "Waiter", description: "Serves tables and places orders.", permissions: ["sales.create", "orders.view_own", "tables.manage"] },
  { name: "Kitchen staff", description: "Prepares orders on the kitchen screen.", permissions: ["kitchen.prepare", "sales.create", "orders.view_all"] },
  { name: "Delivery rider", description: "Takes deliveries to customers and collects money at the door.", permissions: ["deliveries.ride"] },
  { name: "Stock keeper", description: "Looks after products and stock.", permissions: ["inventory.view", "inventory.adjust", "products.manage"] },
  {
    name: "Manager",
    description: "Runs the shop day to day.",
    permissions: ALL.map((p) => p.key).filter((k) => !["roles.manage", "settings.manage"].includes(k)),
  },
];
