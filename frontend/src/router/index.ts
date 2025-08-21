import { createRouter, createWebHistory } from 'vue-router'
import { requireAuth, requireAdmin, requireGuest } from './guards'
import HomeView from '../views/HomeView.vue'
import AdminClientsView from '../views/AdminClientsView.vue'
import AdminEmployeesView from '../views/AdminEmployeesView.vue'
import AdminReservationsView from '../views/AdminReservationsView.vue'
import AdminMembershipsView from '../views/AdminMembershipsView.vue'
import AdminClassesView from '../views/AdminClassesView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
      beforeEnter: requireAuth,
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/admin-clients',
      name: 'admin-clients',
      component: AdminClientsView,
      beforeEnter: requireAdmin,
    },
    {
      path: '/admin-employees',
      name: 'admin-employees',
      component: AdminEmployeesView,
      beforeEnter: requireAdmin,
    },
    {
      path: '/admin-reservations',
      name: 'admin-reservations',
      component: AdminReservationsView,
      beforeEnter: requireAdmin,
    },
    {
      path: '/admin-memberships',
      name: 'admin-memberships',
      component: AdminMembershipsView,
      beforeEnter: requireAdmin,
    },
    {
      path: '/admin-classes',
      name: 'admin-classes',
      component: AdminClassesView,
      beforeEnter: requireAdmin,
    },
    {
      path: '/classes',
      name: 'classes',
      component: () => import('../views/ClassesView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      beforeEnter: requireGuest,
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
      beforeEnter: requireGuest,
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      beforeEnter: requireAuth,
    },
    {
      path: '/reservations',
      name: 'reservations',
      component: () => import('../views/ReservationsView.vue'),
      beforeEnter: requireAuth,
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/AdminDashboardView.vue'),
      beforeEnter: requireAdmin,
    },
    {
      path: '/admin-dashboard',
      name: 'admin-dashboard',
      component: () => import('../views/AdminDashboardView.vue'),
      beforeEnter: requireAdmin,
    },
    {
      path: '/admin-users',
      name: 'admin-users',
      component: () => import('../views/AdminUsersView.vue'),
      beforeEnter: requireAdmin,
    },
    {
      path: '/admin-reports',
      name: 'admin-reports',
      component: () => import('../views/AdminReportsView.vue'),
      beforeEnter: requireAdmin,
    },
    {
      path: '/admin-inventory',
      name: 'admin-inventory',
      component: () => import('../views/AdminInventoryView.vue'),
      beforeEnter: requireAdmin,
    },
    {
      path: '/admin-payments',
      name: 'admin-payments',
      component: () => import('../views/AdminPaymentsView.vue'),
      beforeEnter: requireAdmin,
    },
    {
      path: '/instructor-classes',
      name: 'instructor-classes',
      component: () => import('../views/InstructorClassesView.vue'),
    },
    {
      path: '/instructor-reports',
      name: 'instructor-reports',
      component: () => import('../views/InstructorReportsView.vue'),
    },
    {
      path: '/chat',
      name: 'chat',
      component: () => import('../views/ChatView.vue'),
    },
    {
      path: '/faq',
      name: 'faq',
      component: () => import('../views/FAQView.vue'),
    },
    {
      path: '/membership',
      name: 'membership',
      component: () => import('../views/MembershipView.vue'),
    },
    {
      path: '/history',
      name: 'history',
      component: () => import('../views/HistoryView.vue'),
    },
    {
      path: '/support',
      name: 'support',
      component: () => import('../views/SupportView.vue'),
    },
  ],
})

export default router
