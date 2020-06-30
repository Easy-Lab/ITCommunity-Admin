const routes = [
  {path: '/', component: () => import('pages/login.vue')},
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {path: '/dashboard', component: () => import('pages/dashboard.vue')},
      {path: '/reviews', component: () => import('pages/reviews.vue')},
      {path: '/contact_form', component: () => import('pages/contact_form.vue')},
      {path: '/my_profile', component: () => import('pages/my_profile.vue')},
      {path: '/bug_report', component: () => import('pages/bug_report.vue')},
      {path: '/users', component: () => import('pages/users.vue')},
    ]
  }
]

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
  routes.push({
    path: '*',
    component: () => import('pages/Error404.vue')
  })
}

export default routes
