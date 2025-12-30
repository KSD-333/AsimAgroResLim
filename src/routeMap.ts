export const routeMap = {
  // Admin
  adminDashboard: "admin/dashboard",
  adminUsers: "admin/users",
  adminOrders: "admin/orders",
  adminProducts: "admin/products",
  adminForms: "admin/forms",
  adminDealers: "admin/dealers",
  adminMessages: "admin/messages",
  adminFeedback: "admin/feedback",
  adminProductsNew: "admin/products/new",
  adminAnalytics: "admin/analytics",
  // Public & Protected
  products: "products",
  productDetail: "products",
  about: "about",
  contact: "contact",
  login: "login",
  cart: "cart",
  profile: "profile",
  dealers: "dealers",
  home: "" // Root path
};

export const reverseRouteMap = Object.fromEntries(
  Object.entries(routeMap).map(([k, v]) => [v, k])
); 