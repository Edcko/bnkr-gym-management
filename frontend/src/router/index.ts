import { createRouter, createWebHistory } from 'vue-router'
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
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/admin/clients',
      name: 'admin-clients',
      component: AdminClientsView,
    },
    {
      path: '/admin/employees',
      name: 'admin-employees',
      component: AdminEmployeesView,
    },
    {
      path: '/admin/reservations',
      name: 'admin-reservations',
      component: AdminReservationsView,
    },
    {
      path: '/admin/memberships',
      name: 'admin-memberships',
      component: AdminMembershipsView,
    },
    {
      path: '/admin/classes',
      name: 'admin-classes',
      component: AdminClassesView,
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
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
    },
    {
      path: '/reservations',
      name: 'reservations',
      component: () => import('../views/ReservationsView.vue'),
    },
    {
      path: '/admin-dashboard',
      name: 'admin-dashboard',
      component: () => import('../views/AdminDashboardView.vue'),
    },
    {
      path: '/admin-users',
      name: 'admin-users',
      component: () => import('../views/AdminUsersView.vue'),
    },
    {
      path: '/admin-reports',
      name: 'admin-reports',
      component: () => import('../views/AdminReportsView.vue'),
    },
    {
      path: '/admin-inventory',
      name: 'admin-inventory',
      component: () => import('../views/AdminInventoryView.vue'),
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
