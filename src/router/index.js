import { createRouter, createWebHistory } from "vue-router";
import Cookies from "js-cookie";
import i18n from "../core/plugins/i18n";
import { useAuthStore } from "@/stores/auth";

import { MASLUtility } from "@/utils/masl_utility";

const helpCenterRoutes = [
  {
    path: "/help-center",
    component: () => import("../components/HelpCenterLayout.vue"),
    children: [
      {
        path: "",
        name: "HelpCenterHome",
        component: () => import("../views/help-center/HelpCenterHome.vue"),
      },
      {
        path: "quick-start",
        name: "QuickStart",
        component: () => import("../views/help-center/QuickStart.vue"),
      },
      {
        path: "tutorials",
        name: "Tutorials",
        component: () => import("../views/help-center/Tutorials.vue"),
      },
      {
        path: "best-practices",
        name: "BestPractices",
        component: () => import("../views/help-center/BestPractices.vue"),
      },
      {
        path: "faqs",
        name: "FAQs",
        component: () => import("../views/help-center/FAQs.vue"),
      },
      {
        path: "book-call",
        name: "BookCall",
        component: () => import("../views/help-center/BookCall.vue"),
      },
      {
        path: "contact-support",
        name: "ContactSupport",
        component: () => import("../views/help-center/ContactSupport.vue"),
      },
    ],
  },
];

const publicShareRoutes = [
  {
    path: "/share",
    component: () => import("../views/share_center/links/ShareLayout.vue"),
    children: [
      {
        path: "map",
        name: "PublicMapShare",
        component: () => import("../views/share_center/links/MapShare.vue"),
        meta: {
          pageTitle: "sharedMap",
        },
      },
      {
        path: "report",
        name: "PublicReportShare",
        component: () => import("../views/share_center/links/ReportShare.vue"),
        meta: {
          pageTitle: "sharedReport",
        },
      },
      {
        path: "route",
        name: "PublicRouteShare",
        component: () => import("../views/share_center/links/RouteShare.vue"),
        meta: {
          pageTitle: "sharedRoute",
        },
      },
      {
        path: "data",
        name: "PublicDataShare",
        component: () => import("../views/share_center/links/DataShare.vue"),
        meta: {
          pageTitle: "sharedData",
        },
      },
      {
        path: "photos",
        name: "PublicPhotosShare",
        component: () => import("../views/share_center/links/PhotosShare.vue"),
        meta: {
          pageTitle: "sharedPhotos",
        },
      },
      {
        path: ":pathMatch(.*)*",
        name: "PublicShareNotFound",
        component: () => import("../views/generic/NotFound.vue"),
        meta: {
          pageTitle: "notFound",
        },
      },
    ],
  },
];

const permitsRoutes = [
  {
    path: '/permits',
    name: 'PermitsHome',
    component: () => import('@/views/permits/PermitsHome.vue'),
    meta: {
      pageTitle: 'Permits'
    }
  },
  // New FastAPI-powered routes
  {
    path: '/permits/list/:projectId',
    name: 'permits-list',
    component: () => import('@/views/permits/ListPermits.vue'),
    props: true,
    meta: {
      pageTitle: 'Permit Cases'
    }
  },
  {
    path: '/permits/:id',
    name: 'permit-detail',
    component: () => import('@/views/permits/ViewPermit.vue'),
    meta: {
      pageTitle: 'Permit Details'
    }
  },
  // Original routes
  {
    path: '/projects/:projectId/permits',
    name: 'ProjectPermits',
    component: () => import('@/views/permits/PermitsHome.vue'),
    meta: {
      pageTitle: 'Project Permits'
    }
  },
  {
    path: '/projects/:projectId/permits/us',
    name: 'USPermitsOverview',
    component: () => import('@/views/permits/us/USPermitsOverview.vue'),
    meta: {
      pageTitle: 'US DOT & State Permits'
    }
  },
  {
    path: '/projects/:projectId/permits/us/:caseId',
    name: 'USPermitCase',
    component: () => import('@/views/permits/us/USPermitCaseWorkspace.vue'),
    meta: {
      pageTitle: 'US Permit Case'
    }
  }
];

const testingRoutes = [
  {
    path: '/testing',
    name: 'TestingDashboard',
    component: () => import('@/views/testing/TestingDashboard.vue'),
    meta: {
      pageTitle: 'Testing & QA',
      requiresAdmin: true
    }
  },
  {
    path: '/testing/e2e',
    name: 'E2ETestManager',
    component: () => import('@/views/testing/E2ETestManager.vue'),
    meta: {
      pageTitle: 'E2E Test Manager',
      requiresAdmin: true
    }
  },
  {
    path: '/testing/visual-regression',
    name: 'VisualRegressionView',
    component: () => import('@/views/testing/VisualRegressionView.vue'),
    meta: {
      pageTitle: 'Visual Regression',
      requiresAdmin: true
    }
  }
];

const engineeringRoutes = [
  {
    path: '/engineering',
    name: 'EngineeringDashboard',
    component: () => import('@/views/engineering/EngineeringDashboard.vue'),
    meta: {
      pageTitle: 'Engineering Dashboard'
    }
  },
  {
    path: '/engineering/calculator',
    name: 'CalculationValidator',
    component: () => import('@/views/engineering/CalculationValidator.vue'),
    meta: {
      pageTitle: 'Calculation Validator'
    }
  },
  {
    path: '/engineering/permits',
    name: 'PermitsEngineering',
    component: () => import('@/views/engineering/PermitsEngineering.vue'),
    meta: {
      pageTitle: 'Permits Engineering'
    }
  }
];

const mainRoutes = [

  {
    path: "/dashboard",
    name: "Dashboard",
    component: () => import("@/views/Dashboard.vue"),
    meta: {
      pageTitle: "dashboard",
    },
  },
  {
    path: "/routes",
    name: "Routes",
    component: () => import("@/views/routes/Routes.vue"),
    meta: {
      pageTitle: "routes",
    },
  },
  {
    path: "/routes/:id",
    name: "RouteViewer",
    component: () => import("@/views/routes/RouteViewer.vue"),
    meta: {
      pageTitle: "routeViewer",
    },
  },
  {
    path: "/admin/users",
    name: "UsersAdmin",
    component: () => import("@/views/users_admin/UsersAdmin.vue"),
    meta: {
      pageTitle: "usersAdmin",
    },
  },
  {
    path: "/reporting",
    name: "Reporting",
    component: () => import("@/views/reports/Reporting.vue"),
    meta: {
      pageTitle: "reporting",
    },
  },
  {
    path: "/report-legacy/:id",
    name: "LegacyReport",
    component: () => import("@/views/reports/LegacyReport.vue"),
    meta: {
      pageTitle: "legacyReport",
    },
  },
  {
    path: "/admin/templates",
    name: "TemplatesList",
    component: () => import("@/views/templates/admin/TemplatesListPage.vue"),
    meta: {
      pageTitle: "Templates",
    },
  },
  {
    path: "/admin/templates/:id",
    name: "TemplateBuilder",
    component: () => import("@/views/templates/builder/TemplateBuilder.vue"),
    meta: {
      pageTitle: "Template Builder",
      layout: "blank" // If you want to hide the main sidebar/nav, otherwise standard
    },
  },
  {
    path: "/browse-templates",
    name: "BrowseTemplates",
    component: () => import("@/views/reports/BrowseTemplates.vue"),
    meta: {
      pageTitle: "browseTemplates",
    },
  },

  {
    path: "/admin/templates",
    name: "ManageTemplates",
    component: () =>
      import("@/views/templates/admin/ManageTemplatesSections.vue"),
    meta: {
      pageTitle: "manageTemplates",
    },
  },
  {
    path: "/admin/templates/add",
    name: "AddTemplate",
    component: () => import("@/views/templates/admin/AddTemplate.vue"),
    meta: {
      pageTitle: "addTemplate",
    },
  },
  {
    path: "/admin/templates/:id/edit",
    name: "EditTemplate",
    component: () => import("@/views/templates/admin/EditTemplate.vue"),
    meta: {
      pageTitle: "editTemplate",
    },
  },
  {
    path: "/admin/account-requests",
    name: "AccountRequestsAdmin",
    component: () =>
      import("@/views/account_requests/AccountRequestsAdmin.vue"),
    meta: {
      pageTitle: "accountRequests",
    },
  },
  {
    path: "/notifications",
    name: "Notifications",
    component: () => import("@/views/notifications/Notifications.vue"),
    meta: {
      pageTitle: "notifications",
    },
  },
  {
    path: "/admin/notifications",
    name: "AdminNotifications",
    component: () => import("@/views/notifications/AdminNotifications.vue"),
    meta: {
      pageTitle: "sendNotifications",
    },
  },
  {
    path: "/admin/organizations",
    name: "OrganizationsAdmin",
    component: () =>
      import("@/views/organizations_admin/OrganizationsAdmin.vue"),
    meta: {
      pageTitle: "organizationManagement",
    },
  },
  {
    path: "/admin/organizations/:id",
    name: "OrganizationDetails",
    component: () =>
      import("@/views/organizations_admin/OrganizationDetails.vue"),
    meta: {
      pageTitle: "organizationDetails",
    },
  },
  {
    path: "/admin/organizations/:id/users",
    name: "OrganizationUserManagement",
    component: () =>
      import("@/views/organizations_admin/OrganizationUserManagement.vue"),
    meta: {
      pageTitle: "organizationUsers",
    },
  },
  {
    path: "/organization/manage",
    name: "OrganizationManage",
    component: () => import("@/views/organization/OrganizationManage.vue"),
    meta: {
      pageTitle: "myOrganization",
    },
  },
  {
    path: "/organization/users",
    name: "OrganizationUsers",
    component: () => import("@/views/organization/OrganizationUsers.vue"),
    meta: {
      pageTitle: "organizationUsers",
    },
  },
  {
    path: "/pdf-viewer",
    name: "PdfViewer",
    component: () => import("@/views/pdf/PdfViewer.vue"),
    meta: { pageTitle: "pdfViewer" },
  },
  {
    path: "/admin/subscription",
    name: "SubscriptionPlansAdmin",
    component: () => import("@/views/subscription_plans/admin/SubscriptionPlansAdmin.vue"),
    meta: {
      pageTitle: "subscriptionPlans",
    },
  },
  {
    path: "/admin/tools",
    name: "AdminTools",
    component: () => import("@/views/admin/tools/AdminTools.vue"),
    meta: {
      pageTitle: "adminTools",
    },
  },
  {
    path: "/route-manager",
    redirect: { name: "Routes" }
  },
  // {
  //   path: "/transport-engineering",
  //   name: "TransportEngineering",
  //   component: () => import("@/views/planning/TransportEngineeringView.vue"),
  //   meta: {
  //     pageTitle: "Transport Engineering",
  //   },
  // },
];

const plannedRoutes = [
  {
    path: "/planned-routes",
    name: "PlannedRoutes",
    component: () => import("@/views/planned_routes/PlannedRoutes.vue"),
    meta: {
      pageTitle: "plannedRoutes",
    },
  },
  {
    path: "/planned-routes/add",
    name: "AddPlannedRoute",
    component: () => import("@/views/planned_routes/AddPlannedRoute.vue"),
    meta: {
      pageTitle: "addPlannedRoute",
    },
  },
  {
    path: "/planned-routes/:id",
    name: "ViewPlannedRoute",
    component: () => import("@/views/planned_routes/ViewPlannedRoute.vue"),
    meta: {
      pageTitle: "viewPlannedRoute",
    },
  },
  {
    path: "/planned-routes/:id/edit",
    name: "EditPlannedRoute",
    component: () => import("@/views/planned_routes/EditPlannedRoute.vue"),
    meta: {
      pageTitle: "editPlannedRoute",
    },
  },
];

const userRoutes = [
  {
    path: "/user/profile",
    name: "user_profile",
    component: () => import("@/views/profile/MyProfile.vue"),
    meta: {
      pageTitle: "myProfile",
    },
  },
  {
    path: "/user/settings",
    name: "user_settings",
    component: () => import("@/views/settings/UserSettings.vue"),
    meta: {
      pageTitle: "userSettings",
    },
  },
  {
    path: "/user/mfa-settings",
    name: "mfa_settings",
    component: () => import("@/views/settings/MfaSettings.vue"),
    meta: {
      pageTitle: "MFA Settings",
    },
  },
  {
    path: "/user/subscription",
    name: "UserSubscription",
    component: () => import("@/views/subscription_plans/user/UserSubscription.vue"),
    meta: {
      pageTitle: "subscription",
    },
  },
  {
    path: "/user/share_center",
    name: "UserShareCenter",
    component: () => import("@/views/share_center/ShareCenter.vue"),
    meta: {
      pageTitle: "shareCenter",
    },
  },
];

const surveyRoutes = [
  {
    path: "/surveys/:id",
    component: () => import("@/views/layouts/SurveyContextLayout.vue"),
    children: [
      {
        path: "",
        redirect: { name: "SurveyExecution" },
      },
      {
        path: "overview",
        name: "SurveyExecution",
        component: () => import("@/views/survey/SurveyExecution.vue"),
        meta: {
          pageTitle: "routeViewer", // Keep title or update? "Survey Execution"
        },
      },
      {
        path: "report",
        name: "SurveyReport",
        component: () => import("@/views/reports/RouteReport.vue"),
        meta: {
          pageTitle: "reportDetails",
        },
      },
      {
        path: "share",
        name: "SurveyShare",
        component: () => import("@/views/share_center/ShareCenter.vue"),
        props: (route) => ({ routeId: route.params.id }),
        meta: {
          pageTitle: "shareCenter",
        },
      },
    ],
  },
  {
    path: "/routes/:routeId/survey-review",
    name: "SurveyReview",
    component: () => import("@/views/survey/SurveyReviewPage.vue"),
    meta: {
      pageTitle: "Survey Review",
    },
  },
];

const routes = [
  {
    path: "/",
    name: "home",
    component: () => import("@/views/layouts/MainLayout.vue"),
    redirect: "/dashboard",
    children: [...mainRoutes, ...userRoutes, ...plannedRoutes, ...surveyRoutes, ...testingRoutes, ...permitsRoutes, ...engineeringRoutes],
  },
  {
    path: "/login",
    name: "login",
    component: () => import("@/views/authentication/Login.vue"),
    meta: {
      pageTitle: "login",
    },
  },
  {
    path: "/mfa-setup",
    name: "mfa-setup",
    component: () => import("@/views/authentication/MfaSetup.vue"),
    meta: {
      pageTitle: "MFA Setup",
    },
  },
  {
    path: "/mfa-verification",
    name: "mfa-verification",
    component: () => import("@/views/authentication/MfaVerification.vue"),
    meta: {
      pageTitle: "MFA Verification",
    },
  },
  {
    path: "/forgot_password",
    name: "ForgotPassword",
    component: () => import("@/views/forgot_password/ForgotPassword.vue"),
  },
  {
    path: "/signup",
    name: "Signup",
    component: () => import("@/views/authentication/Signup.vue"),
    meta: {
      pageTitle: "Create Account",
    },
  },
  {
    path: "/onboarding",
    name: "Onboarding",
    component: () => import("@/views/onboarding/Onboarding.vue"),
    meta: {
      pageTitle: "Welcome",
      requiresAuth: true
    }
  },
  {
    path: "/disclaimer",
    name: "Disclaimer",
    component: () => import("@/views/legal/DisclaimerScreen.vue"),
    meta: {
      pageTitle: "Disclaimer",
      requiresAuth: true
    }
  },
  {
    path: "/request-account",
    name: "RequestAccount",
    component: () => import("@/views/account_requests/AddAccountRequest.vue"),
    meta: {
      pageTitle: "requestAccount",
    },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/views/generic/NotFound.vue"),
  },
  ...helpCenterRoutes,
  ...publicShareRoutes,
  {
    path: "/planning",
    name: "Planning",
    component: () => import("@/views/planning/PlanningView.vue"),
    meta: {
      pageTitle: "Planning Tool",
    },
  },

];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach(async (to, from, next) => {
  // Reset MASL utility data when navigating to a different route
  if (to.path !== from.path) {
    MASLUtility.resetData();
  }

  if (to.meta) {
    if (to.meta.pageTitle) {
      document.title =
        i18n.global.t(to.meta.pageTitle) +
        " - " +
        import.meta.env.VITE_APP_NAME;
    }
  }

  const token = Cookies.get("l_t");
  const authStore = useAuthStore();

  // Public allowed routes
  const publicRoutes = [
    'login', 'mfa-setup', 'mfa-verification', 'FawaterkPublicInvoice',
    'deletion_request', 'RequestAccount', 'ForgotPassword', 'Signup',
    'HelpCenterHome', 'QuickStart', 'Tutorials', 'BestPractices', 'FAQs', 'BookCall', 'ContactSupport',
    'PublicMapShare', 'PublicReportShare', 'PublicRouteShare', 'PublicDataShare', 'PublicPhotosShare', 'PublicShareNotFound'
  ];

  // Helper to check if route is public
  const isPublic = publicRoutes.includes(to.name) ||
    to.path === '/forgot_password' ||
    to.path.startsWith('/share') ||
    to.path.startsWith('/help-center');

  if (token) {
    // User is authenticated
    if (!authStore.user) {
      await authStore.fetchUserProfile();
    }

    // Onboarding Check - DEPRECATED: New lightweight onboarding uses Dashboard tour
    // if (authStore.user && !authStore.user.onboarding_completed_at) {
    //   if (to.name !== 'Onboarding') {
    //     next({ name: 'Onboarding' });
    //     return;
    //   }
    // } else if (authStore.user && authStore.user.onboarding_completed_at) {
    //   if (to.name === 'Onboarding') {
    //     next({ name: 'Dashboard' }); // Prevent re-entry to onboarding
    //     return;
    //   }
    // }

    // Disclaimer Check
    if (!authStore.isDisclaimerAccepted) {
      if (to.name !== 'Disclaimer' && to.name !== 'Onboarding') {
        next({ name: 'Disclaimer' });
        return;
      }
    } else {
      if (to.name === 'Disclaimer') {
        next({ name: 'Dashboard' });
        return;
      }
    }

    // Check for admin-only routes
    if (to.meta.requiresAdmin) {
      const userRole = authStore.user?.role || authStore.user?.type;
      if (userRole !== 'Admin') {
        // Redirect non-admin users to dashboard
        next({ name: 'Dashboard' });
        return;
      }
    }

    if (to.name === 'login' || to.name === 'Signup') {
      next({ name: 'Dashboard' });
    } else {
      next();
    }
  } else {
    // User is not authenticated
    if (isPublic) {
      next();
    } else {
      next({ name: 'login' });
    }
  }
});

export default router;
