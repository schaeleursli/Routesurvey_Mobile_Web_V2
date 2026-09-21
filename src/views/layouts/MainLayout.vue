<template>
    <!-- Skip Links for Keyboard Navigation (WCAG 2.1 Requirement) -->
    <div class="skip-links">
        <a href="#main-content" class="skip-link">Skip to main content</a>
        <a href="#sidebar-nav" class="skip-link">Skip to navigation</a>
    </div>

    <div class="layout-wrapper" :data-bs-theme="currentTheme" :dir="locale === 'ar' ? 'rtl' : 'ltr'">

        <div v-if="globalLoading" class="global-loading-overlay">
            <BaseLoadingIndicator size="xlarge" variant="primary" />
        </div>
        <transition name="fade">
            <div v-if="messageBox.visible" :class="['global-message-box', messageBox.status]">
                <PhCheckCircle v-if="messageBox.status === 'success'" :size="20" weight="fill" class="text-success" />
                <PhXCircle v-else-if="messageBox.status === 'error'" :size="20" weight="fill" class="text-danger" />
                <PhInfo v-else-if="messageBox.status === 'info'" :size="20" weight="fill" class="text-info" />
                <PhWarning v-else-if="messageBox.status === 'warning'" :size="20" weight="fill" class="text-warning" />
                <span>{{ messageBox.message }}</span>
            </div>
        </transition>
        <!-- Sidebar -->
        <aside class="sidebar" :class="{ 'collapsed': isSidebarCollapsed, 'show': isMobileMenuOpen }">
            <div class="sidebar-header">
                <div class="sidebar-brand" @click="isSidebarCollapsed ? toggleSidebar() : null"
                    :class="{ 'clickable': isSidebarCollapsed }">
                    <img src="@/assets/logo.png" alt="RouteSurvey Logo" class="logo" />
                    <span class="sidebar-title" :class="{ 'hidden': isSidebarCollapsed }">RouteSurvey</span>
                </div>
                <button class="collapse-btn" @click="toggleSidebar">
                    <PhCaretRight v-if="isSidebarCollapsed" :size="16" />
                    <PhCaretLeft v-else :size="16" />
                </button>
            </div>

            <nav id="sidebar-nav" class="sidebar-nav" data-tour="sidebar-nav">
                <!-- Dashboard -->
                <router-link to="/dashboard" class="nav-item" :class="{ active: isNavItemActive('/dashboard') }" :title="isSidebarCollapsed ? $t('dashboard') : ''">
                    <PhHouse :size="20" :weight="isNavItemActive('/dashboard') ? 'fill' : 'duotone'" />
                    <span>{{ $t('dashboard') }}</span>
                </router-link>

                <!-- Plan Section -->
                <router-link 
                    :to="routeContextStore.hasSelectedRoute ? routeContextStore.getContextLink('planned') : '/planned-routes'" 
                    class="nav-item" :class="{ active: isNavItemActive('/planned-routes') }" 
                    :title="isSidebarCollapsed ? $t('planned') : ''">
                    <PhMapTrifold :size="20" :weight="isNavItemActive('/planned-routes') ? 'fill' : 'duotone'" />
                    <span>{{ $t('planned') }}</span>
                </router-link>


                <!-- Survey Section -->
                <router-link 
                    :to="routeContextStore.hasSelectedRoute ? routeContextStore.getContextLink('surveyed') : '/route-manager'" 
                    class="nav-item"
                    :class="{ active: isNavItemActive('/route-manager') }"
                    :title="isSidebarCollapsed ? $t('surveyed') : ''">
                    <PhClipboardText :size="20" :weight="isNavItemActive('/route-manager') ? 'fill' : 'duotone'" />
                    <span>{{ $t('surveyed') }}</span>
                </router-link>

                <!-- Engineering & Planning -->
                <div class="nav-divider"></div>
                
                <router-link to="/planning" class="nav-item" :class="{ active: isNavItemActive('/planning') }" :title="isSidebarCollapsed ? 'Planning' : ''">
                    <PhGridFour :size="20" :weight="isNavItemActive('/planning') ? 'fill' : 'duotone'" />
                    <span>Planning</span>
                </router-link>

                <router-link to="/engineering" class="nav-item" :class="{ active: isNavItemActive('/engineering') }" :title="isSidebarCollapsed ? 'Engineering' : ''">
                    <PhRuler :size="20" :weight="isNavItemActive('/engineering') ? 'fill' : 'duotone'" />
                    <span>Engineering</span>
                </router-link>

                <router-link to="/permits" class="nav-item" :class="{ active: isNavItemActive('/permits') }" :title="isSidebarCollapsed ? 'Permits' : ''">
                    <PhFileText :size="20" :weight="isNavItemActive('/permits') ? 'fill' : 'duotone'" />
                    <span>Permits</span>
                </router-link>

                <!-- Report -->
                <router-link 
                    :to="routeContextStore.hasSelectedRoute ? routeContextStore.getContextLink('report') : (surveyId ? { name: 'SurveyReport', params: { id: surveyId } } : '/reporting')" 
                    class="nav-item" :class="{ active: isNavItemActive('/reporting') }" 
                    :title="isSidebarCollapsed ? 'Report' : ''">
                    <PhFileText :size="20" :weight="isNavItemActive('/reporting') ? 'fill' : 'duotone'" />
                    <span>{{ $t('report') || 'Report' }}</span>
                </router-link>

                <!-- Share -->
                <router-link 
                    :to="routeContextStore.hasSelectedRoute ? routeContextStore.getContextLink('share') : (surveyId ? { name: 'SurveyShare', params: { id: surveyId } } : '/user/share_center')" 
                    class="nav-item"
                    :class="{ active: isNavItemActive('/user/share_center') }"
                    :title="isSidebarCollapsed ? 'Share' : ''">
                    <PhShareNetwork :size="20" :weight="isNavItemActive('/user/share_center') ? 'fill' : 'duotone'" />
                    <span>{{ $t('share') || 'Share' }}</span>
                </router-link>


                <!-- Browse Templates -->
                <router-link to="/browse-templates" class="nav-item"
                    :class="{ active: isNavItemActive('/browse-templates') }"
                    v-if="checkFeatureAccess('template_library')"
                    :title="isSidebarCollapsed ? $t('marketplace') : ''">
                    <PhStorefront :size="20" :weight="isNavItemActive('/browse-templates') ? 'fill' : 'duotone'" />
                    <span>{{ $t('marketplace') }}</span>
                </router-link>

                <!-- Admin Sections -->
                <template v-if="userType === 'Admin'">
                    <div class="nav-divider"></div>
                    <div class="nav-section-title admin-title" data-tour="admin-section">
                        <span>Admin</span>
                    </div>

                    <router-link to="/admin/subscription" class="nav-item"
                        :class="{ active: isNavItemActive('/admin/subscription') }"
                        :title="isSidebarCollapsed ? $t('subscriptionPlans') : ''">
                        <PhGear :size="20" :weight="isNavItemActive('/admin/subscription') ? 'fill' : 'duotone'" />
                        <span>{{ $t('subscriptionPlans') }}</span>
                        <PhShieldCheck class="admin-shield" :size="16" weight="fill" />
                    </router-link>

                    <router-link to="/admin/users" class="nav-item"
                        :class="{ active: isNavItemActive('/admin/users') }"
                        :title="isSidebarCollapsed ? $t('users') : ''">
                        <PhUsers :size="20" :weight="isNavItemActive('/admin/users') ? 'fill' : 'duotone'" />
                        <span>{{ $t('users') }}</span>
                        <PhShield class="admin-shield" :size="16" weight="fill" />
                    </router-link>

                    <router-link to="/admin/crm" class="nav-item"
                        :class="{ active: isNavItemActive('/admin/crm') }"
                        :title="isSidebarCollapsed ? 'CRM' : ''">
                        <PhUsers :size="20" :weight="isNavItemActive('/admin/crm') ? 'fill' : 'duotone'" />
                        <span>CRM</span>
                        <PhShieldCheck class="admin-shield" :size="16" weight="fill" />
                    </router-link>

                    <router-link to="/admin/templates" class="nav-item"
                        :class="{ active: isNavItemActive('/admin/templates') }"
                        :title="isSidebarCollapsed ? $t('templates') : ''">
                        <PhFileText :size="20" :weight="isNavItemActive('/admin/templates') ? 'fill' : 'duotone'" />
                        <span>{{ $t('templates') }}</span>
                        <PhShieldCheck class="admin-shield" :size="16" weight="fill" />
                    </router-link>

                    <router-link to="/admin/account-requests" class="nav-item"
                        :class="{ active: isNavItemActive('/admin/account-requests') }"
                        :title="isSidebarCollapsed ? $t('accountRequests') : ''">
                        <PhUserPlus :size="20" :weight="isNavItemActive('/admin/account-requests') ? 'fill' : 'duotone'" />
                        <span>{{ $t('accountRequests') }}</span>
                        <PhShieldCheck class="admin-shield" :size="16" weight="fill" />
                    </router-link>

                    <router-link to="/admin/notifications" class="nav-item"
                        :class="{ active: isNavItemActive('/admin/notifications') }"
                        :title="isSidebarCollapsed ? $t('sendNotifications') : ''">
                        <PhBell :size="20" :weight="isNavItemActive('/admin/notifications') ? 'fill' : 'duotone'" />
                        <span>{{ $t('sendNotifications') }}</span>
                        
                        <PhShieldCheck class="admin-shield" :size="16" weight="fill" />
                    </router-link>

                    <router-link to="/admin/tools" class="nav-item"
                        :class="{ active: isNavItemActive('/admin/tools') }"
                        :title="isSidebarCollapsed ? 'Tools' : ''">
                        <PhToolbox :size="20" :weight="isNavItemActive('/admin/tools') ? 'fill' : 'duotone'" />
                        <span>Tools</span>
                        <PhShieldCheck class="admin-shield" :size="16" weight="fill" />
                    </router-link>

                    <router-link to="/testing" class="nav-item"
                        :class="{ active: isNavItemActive('/testing') }"
                        :title="isSidebarCollapsed ? 'Testing & QA' : ''">
                        <PhBug :size="20" :weight="isNavItemActive('/testing') ? 'fill' : 'duotone'" />
                        <span>Testing & QA</span>
                        <PhShieldCheck class="admin-shield" :size="16" weight="fill" />
                    </router-link>

                    <a href="#" class="nav-item" @click.prevent="showImportModal = true"
                        :title="isSidebarCollapsed ? 'Import KML' : ''">
                        <PhUpload :size="20" weight="duotone" />
                        <span>Import KML</span>
                        <PhShieldCheck class="admin-shield" :size="16" weight="fill" />
                    </a>

                    <router-link to="/admin/organizations" class="nav-item"
                        :class="{ active: isNavItemActive('/admin/organizations') }"
                        :title="isSidebarCollapsed ? $t('organizations') : ''">
                        <PhBuildings :size="20" :weight="isNavItemActive('/admin/organizations') ? 'fill' : 'duotone'" />
                        <span>{{ $t('organizations') }}</span>
                        <PhShieldCheck class="admin-shield" :size="16" weight="fill" />
                    </router-link>
                </template>

                <!-- Restricted Admin Sections -->
                <template v-if="userType === 'RestrictedAdmin'">
                    <div class="nav-divider"></div>
                    <div class="nav-section-title admin-title">
                        <span>Admin</span>
                    </div>

                    <router-link to="/admin/users" class="nav-item"
                        :class="{ active: isNavItemActive('/admin/users') }"
                        :title="isSidebarCollapsed ? $t('users') : ''">
                        <PhUsers :size="20" :weight="isNavItemActive('/admin/users') ? 'fill' : 'duotone'" />
                        <span>{{ $t('users') }}</span>
                        <PhShield class="admin-shield" :size="16" weight="fill" />
                    </router-link>
                </template>

                <!-- Organization Manager Sections -->
                <template v-if="userType === 'OrgManager' || userType === 'OrgAdmin'">
                    <div class="nav-divider"></div>
                    <div class="nav-section-title admin-title">
                        <span>{{ $t('organizationManagement') }}</span>
                    </div>

                    <router-link to="/organization/manage" class="nav-item"
                        :class="{ active: isNavItemActive('/organization/manage') }"
                        :title="isSidebarCollapsed ? $t('myOrganization') : ''">
                        <PhBuildings :size="20" :weight="isNavItemActive('/organization/manage') ? 'fill' : 'duotone'" />
                        <span>{{ $t('myOrganization') }}</span>
                    </router-link>

                    <router-link to="/organization/users" class="nav-item"
                        :class="{ active: isNavItemActive('/organization/users') }"
                        :title="isSidebarCollapsed ? $t('organizationUsers') : ''">
                        <PhUsers :size="20" :weight="isNavItemActive('/organization/users') ? 'fill' : 'duotone'" />
                        <span>{{ $t('organizationUsers') }}</span>
                    </router-link>
                </template>
            </nav>

            <!-- Version Info -->
            <div class="sidebar-footer">
                <span class="version-text">RouteSurvey v1.0</span>
            </div>
        </aside>

        <!-- Mobile Overlay -->
        <div class="mobile-overlay" v-if="isMobileMenuOpen" @click="closeMobileMenu"></div>

        <!-- Main Content -->
        <div class="main-content">
            <!-- Navbar -->
            <nav class="navbar" :class="{ 'context-active': routeContextStore.hasSelectedRoute }">
                <div class="navbar-left">
                    <button class="menu-toggle" @click="toggleMobileMenu">
                        <PhList :size="24" />
                    </button>
                    <!-- Global Back Button -->
                    <BaseButton v-if="canGoBack" variant="secondary" size="small" @click="goBack"
                        title="Go back">
                        <template #icon-left>
                            <PhArrowLeft :size="16" />
                        </template>
                        Back
                    </BaseButton>
                    <!-- Dashboard Search Bar -->
                    <div class="dashboard-search-container" v-click-outside="closeSearchResults">
                        <PhMagnifyingGlass :size="16" class="search-icon-ph" />
                        <input type="text" placeholder="Search routes, planned routes, pages..."
                            class="dashboard-search-input" v-model="searchQuery" @input="handleSearchInput"
                            @focus="showSearchResults = true" ref="searchInput">

                        <!-- Search Results Dropdown -->
                        <div v-if="showSearchResults && (searchResults.length > 0 || getPageSuggestions().length > 0)"
                            class="search-results-dropdown">
                            <div class="search-results-header">
                                <div class="search-results-title-section">
                                    <span class="search-results-title">Search Results</span>
                                    <span class="search-results-count">({{ searchResults.length +
                                        getPageSuggestions().length
                                    }})</span>
                                </div>
                                <button @click="closeSearchResults" class="close-search-btn">
                                    <PhX :size="20" />
                                </button>
                            </div>

                            <!-- Tabs Navigation -->
                            <div v-if="availableTabs.length > 0 && contextResults.length === 0" class="search-results-tabs">
                                <button v-for="tab in availableTabs" :key="tab.id" @click="activeSearchTab = tab.id"
                                    :class="['search-tab', { active: activeSearchTab === tab.id }]">
                                    <span>{{ tab.label }}</span>
                                    <span class="tab-count">{{ tab.count }}</span>
                                </button>
                            </div>

                            <!-- Tab Content -->
                            <div class="search-results-content">
                                
                                <!-- 1. Context Results (Always First) -->
                                <div v-if="contextResults.length > 0" class="search-results-section">
                                    <div class="search-results-section-title highlight">
                                         <component :is="contextIcon" v-if="typeof contextIcon === 'object'" size="16" class="me-2" />
                                        <i v-else :class="['bi', contextIcon]"></i>
                                        On this page ({{ contextName }})
                                    </div>
                                    <div v-for="(result, index) in contextResults" :key="`ctx-${index}`"
                                        class="search-result-item context-item" @click="result.action ? result.action() : null">
                                        <div class="search-result-content">
                                            <div class="search-result-title">{{ result.title }}</div>
                                            <div class="search-result-meta">
                                                <span class="search-result-description">{{ result.description }}</span>
                                            </div>
                                        </div>
                                        <div class="search-result-action">
                                            <PhArrowUUpLeft :size="16" />
                                        </div>
                                    </div>
                                </div>

                                <!-- 2. Smart Actions -->
                                <div v-if="smartActions.length > 0" class="search-results-section">
                                    <div class="search-results-section-title">
                                        <PhSparkle :size="16" weight="duotone" class="me-1" />
                                        Suggestions
                                    </div>
                                    <div v-for="(action, index) in smartActions" :key="`act-${index}`"
                                        class="search-result-item smart-action-item" @click="() => { action.action(); closeSearchResults(); }">
                                        <div class="search-result-icon">
                                             <PhLightning :size="16" v-if="action.icon === 'bi-lightning-charge'" />
                                             <PhStar :size="16" v-else />
                                        </div>
                                        <div class="search-result-content">
                                            <div class="search-result-title">{{ action.title }}</div>
                                            <div class="search-result-meta">
                                                <span class="search-result-description">{{ action.subtitle }}</span>
                                            </div>
                                        </div>
                                        <div class="search-result-action">
                                            <PhCaretRight :size="16" />
                                        </div>
                                    </div>
                                </div>

                                <!-- Routes Tab -->
                                <div v-if="activeSearchTab === 'routes' || (activeSearchTab === 'all' && routesResults.length > 0)"
                                    class="search-results-list">
                                     <div v-if="activeSearchTab === 'all'" class="search-results-section-title">Global Results</div>
                                    <div v-for="(route, index) in routesResults" :key="`route-${route.id}`"
                                        class="search-result-item" :style="{ 'animation-delay': `${index * 50}ms` }"
                                        @click="navigateToRoute(route)">
                                        <div class="search-result-content">
                                            <div class="search-result-title text-left">{{ route.title }}</div>
                                            <div class="search-result-meta">
                                                <span class="search-result-date">
                                                    Updated: {{ formatDate(route.dateUpdated) }}
                                                </span>
                                            </div>
                                        </div>
                                        <div class="search-result-action"></div>
                                    </div>
                                </div>

                                <!-- Planned Routes Tab -->
                                <div v-if="activeSearchTab === 'planned' || (activeSearchTab === 'all' && plannedRoutesResults.length > 0)"
                                    class="search-results-list">
                                    <div v-for="(plannedRoute, index) in plannedRoutesResults"
                                        :key="`planned-${plannedRoute.id}`" class="search-result-item"
                                        :style="{ 'animation-delay': `${index * 50}ms` }"
                                        @click="navigateToPlannedRoute(plannedRoute)">
                                        <div class="search-result-content">
                                            <div class="search-result-title text-left">{{ plannedRoute.title }}</div>
                                            <div class="search-result-meta">
                                                <span class="search-result-date">
                                                    Updated: {{ formatDate(plannedRoute.dateUpdated) }}
                                                </span>
                                            </div>
                                        </div>
                                        <div class="search-result-action"></div>
                                    </div>
                                </div>

                                <!-- Pages Tab -->
                                <div v-if="activeSearchTab === 'pages' || (activeSearchTab === 'all' && pagesResults.length > 0)"
                                    class="search-results-list">
                                    <div v-for="(page, index) in pagesResults" :key="`page-${page.route}`"
                                        class="search-result-item" :style="{ 'animation-delay': `${index * 50}ms` }"
                                        @click="navigateToPage(page.route)">
                                        <div class="search-result-content">
                                            <div class="search-result-title text-left">{{ page.title }}</div>
                                            <div class="search-result-meta">
                                                <span class="search-result-description">{{ page.description }}</span>
                                            </div>
                                        </div>
                                        <div class="search-result-action"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Page Suggestions Only (when no API results) -->
                        <div v-if="showSearchResults && searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && getPageSuggestions().length > 0"
                            class="search-results-dropdown">
                            <div class="search-results-header">
                                <span class="search-results-title">Page Suggestions</span>
                                <button @click="closeSearchResults" class="close-search-btn">
                                    <PhX :size="20" />
                                </button>
                            </div>

                            <!-- Pages Suggestions -->
                            <div class="search-results-section">
                                <div class="search-results-section-title">
                                    <PhGridFour :size="16" weight="fill" class="me-1" />
                                    Pages
                                </div>
                                <div v-for="page in getPageSuggestions()" :key="`page-${page.route}`"
                                    class="search-result-item" @click="navigateToPage(page.route)">
                                    <div class="search-result-content">
                                        <div class="search-result-title">{{ page.title }}</div>
                                        <div class="search-result-meta">
                                            <span class="search-result-description">{{ page.description }}</span>
                                        </div>
                                    </div>
                                    <div class="search-result-action">
                                        <PhArrowRight :size="16" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- No Results -->
                        <div v-if="showSearchResults && searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && getPageSuggestions().length === 0"
                            class="search-results-dropdown">
                            <div class="no-results">
                                <PhMagnifyingGlass :size="24" weight="duotone" />
                                <span class="text-muted">No results found for "{{ searchQuery }}"</span>
                            </div>
                        </div>

                        <!-- Loading State -->
                        <div v-if="isSearching" class="search-results-dropdown">
                            <div class="search-loading">
                                <div class="search-loading-content">
                                    <div class="search-spinner"></div>
                                    <div class="search-loading-text">
                                        <span class="loading-title">Searching...</span>
                                        <span class="loading-subtitle">Finding routes and pages</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="navbar-right">
                    <!-- New Survey Button (Dashboard only) -->
                    <!-- <button v-if="$route.name === 'Dashboard'" class="new-survey-btn">
                        <PhPlus :size="16" />
                        New Survey
                    </button> -->
                    <!-- Language Switcher -->
                    <!-- <select v-model="locale" class="lang-switcher">
                        <option value="en">🇺🇸 English</option>
                        <option value="de">🇩🇪 Deutsch</option>
                        <option value="ar">🇸🇦 العربية</option>
                    </select> -->

                    <!-- Dashboard Icons (Dashboard only) -->
                    <div class="dashboard-icons">
                        <button class="icon-btn" @click="helpStore.toggle()"
                            title="Help Assistant">
                            <PhSparkle :size="20" weight="duotone" />
                        </button>
                        <div class="notifications-menu" v-click-outside="closeNotificationsMenu">
                            <button class="icon-btn" @click="toggleNotificationsMenu" title="Notifications">
                                <PhBell :size="20" weight="duotone" />
                            </button>

                            <div class="notifications-dropdown" v-show="isNotificationsMenuOpen">
                                <div class="notifications-dropdown-header">
                                    <h4>Notifications</h4>
                                    <router-link to="/notifications" class="view-all-link"
                                        @click="closeNotificationsMenu">
                                        View All
                                    </router-link>
                                </div>

                                <div class="notifications-dropdown-content" v-if="!notificationsLoading">
                                    <div v-if="displayedNotifications.length > 0" class="notifications-list">
                                        <div v-for="notification in displayedNotifications" :key="notification.id"
                                            class="notification-item" :class="{ 'unread': notification.active }"
                                            @click="handleNotificationClick(notification)">
                                            <div class="notification-item-content">
                                                <div class="notification-item-title">{{ notification.title }}</div>
                                                <div class="notification-item-body">{{ notification.body }}</div>
                                            </div>
                                            <div class="notification-item-date">{{
                                                formatNotificationDate(notification.dateAdded) }}</div>
                                        </div>
                                    </div>
                                    <div v-else class="notifications-empty">
                                        <PhBell :size="32" weight="duotone" class="text-muted" />
                                        <span>No notifications</span>
                                    </div>
                                </div>

                                <div v-else class="notifications-loading">
                                    <div class="loading-spinner"></div>
                                    <span>Loading...</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="user-menu" v-click-outside="closeUserMenu">
                        <button class="user-menu-btn" @click="toggleUserMenu">
                            <img :src="userAvatar" alt="User Avatar" class="user-avatar" />
                            <!-- <span class="user-name">{{ userType === 'Admin' ? 'Admin User' : userName }}</span> -->
                            <PhCaretDown :size="16" />
                        </button>

                        <div class="user-dropdown" v-show="isUserMenuOpen">
                            <router-link to="/user/profile" class="dropdown-item">
                                <PhPerson :size="18" weight="duotone" />
                                {{ $t('profile') }}
                            </router-link>
                            <router-link to="/user/subscription" class="dropdown-item">
                                <PhGear :size="18" weight="duotone" />
                                {{ $t('subscription') }}
                            </router-link>
                            <router-link to="/help-center" class="dropdown-item">
                                <PhQuestion :size="18" weight="duotone" />
                                <span>Help Center</span>
                            </router-link>
                            <div class="dropdown-divider"></div>
                            <!-- <div class="language-dropdown" v-click-outside="closeLanguageDropdown">
                                <button class="language-dropdown-btn" @click="toggleLanguageDropdown">
                                    <span class="current-language">
                                        <span v-if="locale === 'en'">🇺🇸 English</span>
                                        <span v-else-if="locale === 'de'">🇩🇪 Deutsch</span>
                                        <span v-else-if="locale === 'ar'">🇸🇦 العربية</span>
                                    </span>
                                    <i class="bi bi-chevron-down" :class="{ 'rotated': isLanguageDropdownOpen }"></i>
                                </button>
                                <div class="language-dropdown-menu" v-show="isLanguageDropdownOpen">
                                    <button @click="setLocale('en')" :class="{ active: locale === 'en' }"
                                        class="language-option">
                                        <span class="flag">🇺🇸</span>
                                        <span class="language-name">English</span>
                                        <span class="language-code">EN</span>
                                    </button>
                                    <button @click="setLocale('de')" :class="{ active: locale === 'de' }"
                                        class="language-option">
                                        <span class="flag">🇩🇪</span>
                                        <span class="language-name">Deutsch</span>
                                        <span class="language-code">DE</span>
                                    </button>
                                    <button @click="setLocale('ar')" :class="{ active: locale === 'ar' }"
                                        class="language-option">
                                        <span class="flag">🇸🇦</span>
                                        <span class="language-name">العربية</span>
                                        <span class="language-code">AR</span>
                                    </button>
                                </div>
                            </div> -->
                            <!-- <div class="dropdown-divider"></div> -->
                            <div class="unit-selection-section">
                                <div class="unit-selection-container">
                                    <button class="unit-selection-btn" @click="setUnit('metric')"
                                        :class="{ active: selectedUnit === 'metric' }" title="Metric Units">
                                        <PhRuler :size="16" weight="duotone" />
                                        <span>Metric</span>
                                    </button>
                                    <button class="unit-selection-btn" @click="setUnit('imperial')"
                                        :class="{ active: selectedUnit === 'imperial' }" title="Imperial Units">
                                        <PhFlag :size="16" weight="fill" />
                                        <span>Imperial</span>
                                    </button>
                                </div>
                            </div>
                            <div class="theme-toggle-section">
                                <!-- <span class="theme-label">{{ $t('theme') }}:</span> -->
                                <div class="theme-toggle-container">
                                    <button class="theme-toggle-btn" @click="setTheme('light')"
                                        :class="{ active: currentTheme === 'light' }" title="Light Mode">
                                        <PhSun :size="18" weight="duotone" />
                                        <!-- <span>Light</span> -->
                                    </button>
                                    <button class="theme-toggle-btn" @click="setTheme('dark')"
                                        :class="{ active: currentTheme === 'dark' }" title="Dark Mode">
                                        <PhMoon :size="18" weight="duotone" />
                                        <!-- <span>Dark</span> -->
                                    </button>
                                </div>
                            </div>
                            <!-- <div class="dropdown-divider"></div> -->
                            <button class="dropdown-item" @click="handleLogout">
                                <PhSignOut :size="18" weight="duotone" />
                                {{ $t('logout') }}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <!-- Page Content -->
            <main id="main-content" class="content" tabindex="-1">
                <router-view v-slot="{ Component }">
                    <transition name="page-fade" mode="out-in">
                        <component :is="Component" />
                    </transition>
                </router-view>
            </main>
        </div>
    </div>

    <!-- Context Selection Bar (When route is selected) -->
    <div v-if="routeContextStore.hasSelectedRoute" class="context-bar">
        <div class="context-bar-content">
            <div class="context-info">
                <span class="context-label">Active Route:</span>
                <span class="context-value">{{ routeContextStore.selectedRouteName }}</span>
            </div>
            <button class="context-close-btn" @click="routeContextStore.clearRoute()" title="Clear Selection">
                <PhX :size="16" />
            </button>
        </div>
    </div>

    <!-- Security Status Component (Development Only) -->
    <!-- <SecurityStatus :show-security-status="isDevelopment" /> -->

    <!-- Tips & Tricks Modal -->
    <TipsAndTricksModal :visible="showTipsModal" :context="tipsContext" @close="showTipsModal = false" />
    
    <!-- KML Import Modal -->
    <KMLImportModal :show="showImportModal" @close="showImportModal = false" @imported="handleRouteImported" />

    <!-- Smart Help Drawer -->
    <HelpDrawer />

    <!-- Onboarding Tour -->
    <OnboardingModal />
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRouter, useRoute } from 'vue-router';
// import Cookies from 'js-cookie';
import { useAuthStore } from "@/stores/auth";
import { useOnboardingStore } from "@/stores/onboarding";
import SubscriptionPlansController from "@/controllers/subscription_plans/subscription_plans_controller";
import { useI18n } from 'vue-i18n';
import { useSubscription } from "@/composables/subscription/useSubscription";
import { useGlobalState } from "@/composables/useGlobalState";
import SecurityStatus from "@/components/SecurityStatus.vue";
import { BaseLoadingIndicator, BaseButton } from '@/components/ui';
import routes_controller from "@/controllers/routes/routes_controller";
import { useNotifications } from "@/composables/useNotifications";
import TipsAndTricksModal from "@/components/planned_routes/TipsAndTricksModal.vue";
import { useSearchContext } from "@/composables/useSearchContext";
import HelpDrawer from "@/components/help/HelpDrawer.vue";
import OnboardingModal from "@/components/onboarding/OnboardingModal.vue";
import { useHelpStore } from "@/stores/help";
import { useRouteContextStore } from "@/stores/routeContext";
import KMLImportModal from "@/components/routes/KMLImportModal.vue";
import { 
    PhHouse, PhMapTrifold, PhClipboardText, PhGridFour, PhRuler, PhFileText, 
    PhShareNetwork, PhStorefront, PhGear, PhUsers, PhUserPlus, PhBell, 
    PhToolbox, PhBug, PhUpload, PhBuildings, PhList, PhArrowLeft, PhMagnifyingGlass, 
    PhX, PhSparkle, PhCaretDown, PhSignOut, PhQuestion, PhSun, PhMoon, PhFlag, 
    PhCheckCircle, PhWarning, PhInfo, PhXCircle, PhCaretRight, PhCaretLeft, 
    PhPerson, PhShieldCheck, PhShield, PhPlus, PhArrowUUpLeft, PhArrowRight,
    PhLightning, PhStar
} from "@phosphor-icons/vue";

const router = useRouter();
const route = useRoute();
const { locale, t } = useI18n();
const authStore = useAuthStore();
const routeContextStore = useRouteContextStore();
const onboardingStore = useOnboardingStore();

// Back button functionality
const canGoBack = computed(() => {
    // Don't show back button on dashboard or home
    return route.name !== 'Dashboard' && route.name !== 'home';
});

const goBack = () => {
    // If on report builder page, dispatch event to clear selected route
    if (route.name === 'Reporting') {
        window.dispatchEvent(new CustomEvent('report-builder-back', {
            detail: { action: 'clear-route' }
        }));
        return;
    } 

    // Check for explicit back route in meta
    if (route.meta.backRoute) {
        router.push(route.meta.backRoute);
        return;
    }

    // Check history length to decide if we can go back
    if (window.history.length > 2) {
        router.back();
    } else {
        // Fallback to Dashboard if no history
        router.push({ name: 'Dashboard' });
    }
};

const { globalLoading, messageBox, setGlobalLoading, showMessage } = useGlobalState();
const { subscription, getData: getSubscriptionData, isTrailExpired, remainingDays, expireDate, checkFeatureAccess } = useSubscription();
const { notifications, loading: notificationsLoading, fetchNotifications: fetchNotificationsData } = useNotifications();

// State
const isSidebarCollapsed = ref(false);
const isUserMenuOpen = ref(false);
const isMobileMenuOpen = ref(false);
const isMobile = ref(false);
const currentTheme = ref(localStorage.getItem('theme') || 'light');
const selectedUnit = ref(localStorage.getItem('unit') || 'metric');
const isLanguageDropdownOpen = ref(false);
const isNotificationsMenuOpen = ref(false);
const viewedNotificationIds = ref(new Set());
const showTipsModal = ref(false);
const showImportModal = ref(false);

const handleRouteImported = () => {
    // Show success message and reload or Navigate
    showMessage({ status: 'success', message: t('routeImportedSuccessfully') });
    
    // Slight delay to allow modal to close smoothly
    setTimeout(() => {
        window.location.reload();
    }, 500);
};

// Search functionality
const searchQuery = ref('');
const searchResults = ref([]);
const showSearchResults = ref(false);
const isSearching = ref(false);
const searchTimeout = ref(null);
const searchInput = ref(null);
const activeSearchTab = ref('all');
const { contextName, contextIcon, executeContextSearch } = useSearchContext();
const contextResults = ref([]);
const smartActions = ref([]);

// Sidebar expandable sections
const expandedSections = ref({
    plan: false,
    survey: false,
    crm: true  // Temporarily set to true for debugging
});

// User data (replace with actual user data from your auth system)
const userName = ref('Account');
const userAvatar = ref('https://ui-avatars.com/api/?name=User+Account&background=random');
const userType = ref('User');
const currentUserData = ref(null);

// Computed
const currentPageTitle = computed(() => {
    return t(route.meta.pageTitle) || t('dashboard');
});

// Development mode check
const isDevelopment = computed(() => {
    return import.meta.env.DEV;
});

// Determine tips context based on current route
const tipsContext = computed(() => {
    const routeName = route.name;

    // Planned routes context
    if (routeName && (
        routeName.includes('planned-route') ||
        routeName === 'PlanRoute' ||
        routeName === 'PlannedRoutes'
    )) {
        return 'planned-routes';
    }

    // Route viewer context
    if (routeName && (
        routeName === 'RouteViewer' ||
        routeName === 'RouteViewOnly' ||
        routeName === 'EditRoute' ||
        routeName === 'Routes'
    )) {
        return 'route-viewer';
    }

    // Default context
    return 'default';
});

// Methods
const toggleTheme = () => {
    currentTheme.value = currentTheme.value === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', currentTheme.value);
};

const setTheme = (theme) => {
    currentTheme.value = theme;
    localStorage.setItem('theme', theme);
};

const setUnit = async (unit) => {
    const isImperial = unit === 'imperial';
    selectedUnit.value = unit;
    localStorage.setItem('unit', unit);

    // Update backend if user data is available
    if (currentUserData.value) {
        try {
            setGlobalLoading(true);
            const res = await authStore.updateUserInfo({
                FirstName: currentUserData.value.firstName,
                LastName: currentUserData.value.lastName,
                MobilePhone: currentUserData.value.mobilePhone || '',
                OfficePhone: currentUserData.value.officePhone || '',
                PhotoUrl: currentUserData.value.photoUrl || '',
                Imperial: isImperial,
            });

            if (res.success) {
                // Update local user data
                currentUserData.value.imperial = isImperial;
                showMessage({ status: 'success', message: t('savedSuccessfully') });
            } else {
                showMessage({ status: 'error', message: res.message || t('somethingWentWrong') });
            }
        } catch (error) {
            console.error('Error updating unit preference:', error);
            showMessage({ status: 'error', message: t('somethingWentWrong') });
        } finally {
            setGlobalLoading(false);
        }
    }

    // Dispatch event to notify other components about unit change
    window.dispatchEvent(new CustomEvent('unit-changed', {
        detail: { unit, isImperial }
    }));
};

const setLocale = (newLocale) => {
    locale.value = newLocale;
    localStorage.setItem('appLanguage', newLocale);
    isLanguageDropdownOpen.value = false;
};

const toggleLanguageDropdown = () => {
    isLanguageDropdownOpen.value = !isLanguageDropdownOpen.value;
};

const closeLanguageDropdown = () => {
    isLanguageDropdownOpen.value = false;
};

const toggleSection = (section) => {
    expandedSections.value[section] = !expandedSections.value[section];
};

// Check if a navigation item should be active based on current route
const surveyId = computed(() => {
    // Check if the current path starts with /surveys/ and access params
    if (route.path.startsWith('/surveys/') && route.params.id) {
        return route.params.id;
    }
    return null;
});

const isNavItemActive = (path) => {
    const currentPath = route.path;

    // Exact match
    if (currentPath === path) {
        return true;
    }

    // Special cases for routes with sub-routes
    switch (path) {
        case '/planned-routes':
            // Active for /planned-routes, and all /planned-routes/* routes
            // ALSO active for Survey Execution/Overview if we consider it part of planning/execution
            return currentPath === '/planned-routes' ||
                currentPath === '/planned-routes' ||
                currentPath.startsWith('/planned-routes/') ||
                (currentPath.startsWith('/surveys/') && currentPath.includes('/overview'));

        case '/route-manager':
            // Active for /route-manager, /routes/:id, /routes/:id/view, /routes/:id/edit, /combine-surveys
            return currentPath === '/route-manager' ||
                (currentPath.startsWith('/routes/') && !currentPath.includes('/report') && !currentPath.includes('/reports')) ||
                currentPath === '/combine-surveys';

        case '/reporting':
            // Active for /reporting, /routes/:id/report, /routes/:id/reports
            // AND the new survey report route
            return currentPath === '/reporting' ||
                (currentPath.includes('/report') && currentPath.startsWith('/routes/')) ||
                (currentPath.includes('/reports') && currentPath.startsWith('/routes/')) ||
                (currentPath.startsWith('/surveys/') && currentPath.includes('/report'));

        case '/user/share_center':
             // NEW: Active for survey share
            return currentPath === '/user/share_center' ||
                   (currentPath.startsWith('/surveys/') && currentPath.includes('/share'));

        case '/admin/organizations':
            // Active for /admin/organizations and all /admin/organizations/* routes
            return currentPath.startsWith('/admin/organizations');

        case '/admin/templates':
            // Active for /admin/templates, /admin/templates/add, /admin/templates/:id/edit
            return currentPath.startsWith('/admin/templates');

        case '/organization/manage':
            // Active for /organization/manage only
            return currentPath === '/organization/manage';

        case '/organization/users':
            // Active for /organization/users only
            return currentPath === '/organization/users';

        default:
            // For other routes, check if current path starts with the nav path
            return currentPath.startsWith(path);
    }
};

const toggleSidebar = () => {
    isSidebarCollapsed.value = !isSidebarCollapsed.value;
    // Dispatch custom event to notify child components about sidebar toggle
    // This allows maps and other components to resize when the layout changes
    setTimeout(() => {
        window.dispatchEvent(new CustomEvent('layout-sidebar-toggle', {
            detail: { collapsed: isSidebarCollapsed.value }
        }));
    }, 350); // Wait for CSS transition (0.3s) + small buffer
};

const toggleMobileMenu = () => {
    isMobileMenuOpen.value = !isMobileMenuOpen.value;
    if (isMobileMenuOpen.value) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
};

const closeMobileMenu = () => {
    isMobileMenuOpen.value = false;
    document.body.style.overflow = '';
};

const toggleUserMenu = () => {
    isUserMenuOpen.value = !isUserMenuOpen.value;
};

const closeUserMenu = () => {
    isUserMenuOpen.value = false;
};

const toggleNotificationsMenu = async () => {
    isNotificationsMenuOpen.value = !isNotificationsMenuOpen.value;
    if (isNotificationsMenuOpen.value) {
        await fetchNotificationsData();
    }
};

const closeNotificationsMenu = () => {
    isNotificationsMenuOpen.value = false;
};

const handleNotificationClick = (notification) => {
    // Mark notification as viewed
    viewedNotificationIds.value.add(notification.id);
    closeNotificationsMenu();
    // Optionally navigate to notification details or mark as read
    router.push('/notifications');
};

const formatNotificationDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    // For very recent notifications, show relative time
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;

    // For today, show time
    if (diffDays < 1) {
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }

    // For this week, show day and time
    if (diffDays < 7) {
        const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        return `${diffDays}d ago • ${timeStr}`;
    }

    // For older notifications, show full date and time
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: diffDays >= 365 ? 'numeric' : undefined,
        hour: 'numeric',
        minute: '2-digit'
    });
};

const handleLogout = async () => {
    try {
        await authStore.logout();
        router.push('/login');
    } catch (error) {
        console.error('Logout failed:', error);
        router.push('/login');
    }
};

const checkMobile = () => {
    isMobile.value = window.innerWidth < 768;
    if (!isMobile.value) {
        closeMobileMenu();
    }
};

// Click outside directive
const vClickOutside = {
    mounted(el, binding) {
        el.clickOutsideEvent = (event) => {
            if (!(el === event.target || el.contains(event.target))) {
                binding.value();
            }
        };
        document.addEventListener('click', el.clickOutsideEvent);
    },
    unmounted(el) {
        document.removeEventListener('click', el.clickOutsideEvent);
    },
};

// Watch for locale changes to save to localStorage and update dir
watch(locale, (newLocale) => {
    localStorage.setItem('appLanguage', newLocale);
    if (newLocale === 'ar') {
        document.documentElement.dir = 'rtl';
    } else {
        document.documentElement.dir = 'ltr';
    }
});

// Watch for theme changes
watch(currentTheme, (newTheme) => {
    document.documentElement.setAttribute('data-bs-theme', newTheme);
});



// Load current subscription


const getCurrentUserData = async () => {
    // If not initialized, try to init store or fetch profile
    if (!authStore.user) {
        await authStore.fetchUserProfile();
    }
    
    if (authStore.user) {
        currentUserData.value = authStore.user;
        userName.value = authStore.user.firstName + " " + authStore.user.lastName;
        userAvatar.value = "https://ui-avatars.com/api/?name=" + authStore.user.firstName + "+" + authStore.user.lastName + "&background=random";
        userType.value = authStore.user.type; // Check if type is correct field name
        
        // Set unit preference from user profile if available
        if (authStore.user.imperial !== undefined) {
            selectedUnit.value = authStore.user.imperial ? 'imperial' : 'metric';
            localStorage.setItem('unit', selectedUnit.value);
        }
    }
}

const getData = async () => {
    try {
        // await getCurrentUserData();
        await Promise.all([
            getCurrentUserData(),
            // checkUserTrailExpired(),

            getSubscriptionData(),
        ]);

        // console.log(subscription.value);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Search methods
const handleSearchInput = () => {
    // Clear existing timeout
    if (searchTimeout.value) {
        clearTimeout(searchTimeout.value);
    }

    // If search query is less than 2 characters, clear results
    if (searchQuery.value.length < 2) {
        searchResults.value = [];
        showSearchResults.value = false;
        return;
    }

    // Show search results dropdown
    showSearchResults.value = true;

    // Debounce search
    searchTimeout.value = setTimeout(() => {
        performSearch();
    }, 300);
};

const performSearch = async () => {
    if (searchQuery.value.length < 2) return;

    isSearching.value = true;

    try {
        console.log('Searching for:', searchQuery.value);
        
        // 1. Context Search (This Page)
        if (contextName.value) {
            contextResults.value = await executeContextSearch(searchQuery.value);
        } else {
            contextResults.value = [];
        }

        // 2. Smart Actions / Navigation Suggestions
        smartActions.value = getSmartSuggestions(searchQuery.value);

        // 3. Global Search (Backend)
        const response = await routes_controller.searchRoutes(searchQuery.value, 5);
        console.log('Search response:', response);

        if (response.result) {
            searchResults.value = response.data || [];
            console.log('Search results:', searchResults.value);
        } else {
            searchResults.value = [];
            console.log('No search results found');
        }
    } catch (error) {
        console.error('Search error:', error);
        searchResults.value = [];
    } finally {
        isSearching.value = false;
    }
};

const getSmartSuggestions = (query) => {
    const q = query.toLowerCase();
    const suggestions = [];
    
    // Command-like suggestions
    if (q.includes('new') || q.includes('create') || q.includes('add')) {
        if (q.includes('route') || q.includes('survey')) {
            suggestions.push({
                type: 'action',
                title: 'Create Manual Route',
                subtitle: 'Start a new survey manually',
                icon: 'bi-plus-circle',
                action: () => router.push('/manual-routes/add')
            });
             suggestions.push({
                type: 'action',
                title: 'Plan New Route',
                subtitle: 'Plan a route before surveying',
                icon: 'bi-map',
                action: () => router.push('/plan-route')
            });
        }
        if (q.includes('user') && userType.value === 'Admin') {
            suggestions.push({
                type: 'action',
                title: 'Add User',
                subtitle: 'Invite a new user',
                icon: 'bi-person-plus',
                action: () => router.push('/admin/users') // assuming add user is there or modal
            });
        }
    }

    if (q.includes('settings') || q.includes('config')) {
         suggestions.push({
            type: 'action',
            title: 'Open Settings',
            subtitle: 'Manage your preferences',
            icon: 'bi-gear',
            action: () => router.push('/user/settings')
        });
    }
    
    if (q.includes('log out') || q.includes('sign out')) {
         suggestions.push({
            type: 'action',
            title: 'Log Out',
            subtitle: 'Sign out of your account',
            icon: 'bi-box-arrow-right',
            action: handleLogout
        });
    }

    return suggestions;
};

const closeSearchResults = () => {
    showSearchResults.value = false;
    searchQuery.value = '';
    searchResults.value = [];
    contextResults.value = [];
    smartActions.value = [];
    activeSearchTab.value = 'all';
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
};

const navigateToRoute = (route) => {
    closeSearchResults();
    // router.push(`/routes/${route.id}`);
    window.location.replace(`/routes/${route.id}/view`);
};

const navigateToPlannedRoute = (plannedRoute) => {
    closeSearchResults();
    // router.push(`/planned-routes/${plannedRoute.id}`);
    window.location.replace(`/planned-routes/${plannedRoute.id}`);
};

const navigateToPage = (pageRoute) => {
    closeSearchResults();
    router.push(pageRoute);
};

const getPageSuggestions = () => {
    const pages = [
        { title: 'Dashboard', description: 'Overview and statistics', route: '/dashboard' },
        { title: 'Plan Route', description: 'Create new route plans', route: '/plan-route' },
        { title: 'Edit Survey', description: 'Manage and edit surveys', route: '/route-manager' },
        { title: 'Combine Surveys', description: 'Merge multiple surveys', route: '/combine-surveys' },
        { title: 'Report', description: 'Generate and view reports', route: '/reporting' },
        { title: 'Share', description: 'Share routes and data', route: '/user/share_center' },
        { title: 'Profile', description: 'User profile settings', route: '/user/profile' },
        { title: 'Subscription', description: 'Manage subscription', route: '/user/subscription' },
        { title: 'Help Center', description: 'Get help and support', route: '/help-center' },
        { title: 'Settings', description: 'Application settings', route: '/user/settings' },
        { title: 'Routes', description: 'View all routes', route: '/routes' },
        { title: 'Planned Routes', description: 'View planned routes', route: '/planned-routes' }
    ];

    // Filter pages based on search query
    if (searchQuery.value.length < 2) return [];

    const filteredPages = pages.filter(page =>
        page.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        page.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    );

    console.log('Page suggestions for query:', searchQuery.value, 'Results:', filteredPages);
    return filteredPages;
};

// Computed properties for filtered search results
const routesResults = computed(() => {
    return searchResults.value.filter(item => item.type === 'Route');
});

const plannedRoutesResults = computed(() => {
    return searchResults.value.filter(item => item.type === 'Planned');
});

const pagesResults = computed(() => {
    return getPageSuggestions();
});

// Get available tabs based on what has results
const availableTabs = computed(() => {
    const tabs = [];
    if (routesResults.value.length > 0) tabs.push({ id: 'routes', label: 'Routes', count: routesResults.value.length, icon: 'bi-sign-turn-left' });
    if (plannedRoutesResults.value.length > 0) tabs.push({ id: 'planned', label: 'Planned Routes', count: plannedRoutesResults.value.length, icon: 'bi-map' });
    if (pagesResults.value.length > 0) tabs.push({ id: 'pages', label: 'Pages', count: pagesResults.value.length, icon: 'bi-grid-3x3-gap' });
    return tabs;
});

// Determine default tab based on current route
const getDefaultTab = () => {
    const routeName = route.name;
    // Check if we're on a planned routes page
    if (routeName && (
        routeName.includes('planned-route') ||
        routeName === 'PlannedRoutes' ||
        routeName === 'PlanRoute' ||
        route.path.includes('/planned-routes')
    )) {
        return 'planned';
    }
    // Default to routes
    return 'routes';
};

// Helper function to get the best default tab
const getBestDefaultTab = (tabs) => {
    const defaultTab = getDefaultTab();

    // First, try to use the route-based default tab
    const defaultTabMatch = tabs.find(tab => tab.id === defaultTab);
    if (defaultTabMatch) {
        return defaultTab;
    }

    // Otherwise, prioritize routes over planned over pages
    const routesTab = tabs.find(tab => tab.id === 'routes');
    if (routesTab) {
        return 'routes';
    }

    const plannedTab = tabs.find(tab => tab.id === 'planned');
    if (plannedTab) {
        return 'planned';
    }

    // Only use pages as last resort
    return tabs[0]?.id || 'all';
};

// Set active tab to default tab based on route when results change
watch(availableTabs, (tabs) => {
    if (tabs.length > 0) {
        // If current tab is not in available tabs, or if we have tabs and activeSearchTab is 'all', set to default tab
        if (!tabs.find(tab => tab.id === activeSearchTab.value) || activeSearchTab.value === 'all') {
            activeSearchTab.value = getBestDefaultTab(tabs);
        }
    } else {
        activeSearchTab.value = 'all';
    }
}, { immediate: true });

// Reset to default tab when search is opened
watch(showSearchResults, (isOpen) => {
    if (isOpen && availableTabs.value.length > 0) {
        // Always reset to the best default tab when search opens
        activeSearchTab.value = getBestDefaultTab(availableTabs.value);
    }
});

// Computed properties for notifications
const displayedNotifications = computed(() => {
    return notifications.value
        .slice()
        .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
        .slice(0, 5); // Show only latest 5 notifications
});

const unreadCount = computed(() => {
    return notifications.value.filter(n => n.active && !viewedNotificationIds.value.has(n.id)).length;
});

onMounted(async () => {
    // Initialize onboarding
    onboardingStore.init();

    // Load locale from localStorage or use default
    const savedLanguage = localStorage.getItem('appLanguage');
    if (savedLanguage) {
        locale.value = savedLanguage;
    } // Else, it will use the default from i18n setup
    else {
        locale.value = 'en'; // Default to English if nothing is saved
    }

    // Set initial document direction based on loaded locale
    if (locale.value === 'ar') {
        document.documentElement.dir = 'rtl';
    } else {
        document.documentElement.dir = 'ltr';
    }

    checkMobile();
    window.addEventListener('resize', checkMobile);
    // Set initial theme
    document.documentElement.setAttribute('data-bs-theme', currentTheme.value);
    getData();
    // await getSubscriptionData();
});

onUnmounted(() => {
    window.removeEventListener('resize', checkMobile);
    document.body.style.overflow = '';
});
</script>

<style scoped>
.layout-wrapper {
    display: flex;
    min-height: 100vh;
    background-color: var(--bs-body-bg);
    color: var(--bs-body-color);
    height: 100vh;
    overflow: hidden;
}

/* Sidebar Styles */
.sidebar {
    width: 240px;
    background: linear-gradient(135deg, rgba(var(--bs-primary-rgb), 0.08), rgba(var(--bs-primary-rgb), 0.12));
    color: var(--bs-body-color);
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    border-right: 1px solid var(--bs-border-color);
    z-index: 1000;
    backdrop-filter: blur(10px);
    box-shadow: 2px 0 8px rgb(0 0 0 / 10%), 4px 0 16px rgb(0 0 0 / 5%);
    position: relative;
}

.sidebar.collapsed {
    width: 70px;
}

.sidebar-header {
    height: 60px;
    padding: 0 0.75rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--bs-border-color);
    flex-shrink: 0;
}

.sidebar-brand {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex: 1;
}

.logo {
    height: 28px;
    width: auto;
    flex-shrink: 0;
    transition: all 0.3s ease;
}

.sidebar-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--bs-body-color);
    transition: opacity 0.3s ease;
}

.sidebar-title.hidden {
    opacity: 0;
    width: 0;
    overflow: hidden;
}

.collapse-btn {
    background: none;
    border: none;
    color: var(--bs-body-color);
    cursor: pointer;
    padding: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.3s ease;
}

.collapse-btn:hover {
    color: var(--bs-primary);
}

.sidebar-nav {
    padding: 0.25rem 0;
    flex: 1;
}

.nav-item {
    position: relative;
    display: flex;
    align-items: center;
    padding: 0.5rem 0.75rem;
    color: var(--bs-body-color);
    text-decoration: none;
    transition: all 0.2s ease;
    gap: 1rem;

    /* border-left: 3px solid transparent; -- Replaced with pseudo-element */
}

/* Active indicator strip */
.nav-item::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background-color: transparent;
    transition: background-color 0.2s ease;
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
}

.nav-item:hover {
    background-color: var(--bs-tertiary-bg);
    color: var(--bs-primary);
}

.nav-item.active {
    background: linear-gradient(90deg, rgba(var(--bs-primary-rgb), 0.1) 0%, rgba(var(--bs-primary-rgb), 0.05) 100%);
    color: var(--bs-primary);
    font-weight: 600;

    /* border-left-color: var(--bs-primary); */
}

.nav-item.active::before {
    background-color: var(--bs-primary);
}

.nav-item i {
    font-size: 1.25rem;
    margin-right: 0;
    width: 24px; /* Increased slightly for better centering */
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
}

.sidebar.collapsed .nav-item {
    justify-content: center;
    padding-left: 0;
    padding-right: 0;
}

.sidebar.collapsed .nav-item span {
    display: none;
}

/* Nav Section Styles */
.nav-section {
    margin-bottom: 0.1rem;
}

.nav-section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.4rem 0.75rem;
    color: var(--bs-body-color);
    cursor: pointer;
    transition: all 0.3s ease;
    border-radius: 6px;
    margin: 0.1rem 0;
}

.nav-section-header:hover {
    background-color: var(--bs-tertiary-bg);
    color: var(--bs-primary);
}

.nav-section-title {
    display: flex;
    align-items: center;
}

.nav-section-title i {
    font-size: 1.25rem;
    margin-right: 1rem;
    width: 20px;
    text-align: center;
}

.nav-section-content {
    margin-left: 1rem;
    border-left: 2px solid var(--bs-border-color);
    padding-left: 0.25rem;
    overflow: hidden;
    transition: all 0.3s ease;
}

.nav-sub-item {
    display: block;
    padding: 0.3rem 0.5rem;
    color: var(--bs-secondary);
    text-decoration: none;
    transition: all 0.3s ease;
    border-radius: 4px;
    margin: 0.05rem 0;
    font-size: 0.875rem;
}

.nav-sub-item:hover {
    background-color: var(--bs-tertiary-bg);
    color: var(--bs-primary);
}

.nav-sub-item.active {
    background-color: var(--bs-primary-bg-subtle);
    color: var(--bs-primary);
    font-weight: 500;
}

/* Nav Divider */
.nav-divider {
    height: 1px;
    background-color: var(--bs-border-color);
    margin: 1rem 0;
}

/* Admin Title */
.admin-title {
    padding: 0.5rem 1rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--bs-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 0.5rem;
}

/* Sidebar Footer */
.sidebar-footer {
    padding: 0.5rem 0.75rem;
    border-top: 1px solid var(--bs-border-color);
    margin-top: auto;
}

.version-text {
    font-size: 0.75rem;
    color: var(--bs-secondary);
    font-weight: 500;
}

/* Collapsed sidebar adjustments */
.sidebar.collapsed .nav-section-header {
    justify-content: center;
    padding: 0.5rem;
}

.sidebar.collapsed .nav-section-title span {
    display: none;
}

.sidebar.collapsed .nav-section-content {
    display: none;
}

.sidebar.collapsed .nav-section-header i:last-child {
    display: none;
}

/* Ensure collapse button is visible but hidden if needed (currently we rely on logo click or we can show it) */
.sidebar.collapsed .collapse-btn {
    display: none; 
}

.sidebar.collapsed .sidebar-brand.clickable {
    cursor: pointer;
    transition: background-color 0.3s ease;
    border-radius: 6px;
    padding: 0.5rem;
    margin: 0;
    justify-content: center;
    width: 100%;
}

.sidebar.collapsed .sidebar-brand {
    justify-content: center;
    width: 100%;
    margin-right: 0;
}

.sidebar.collapsed .sidebar-header {
    padding: 0 0.5rem;
    justify-content: center;
}

.sidebar.collapsed .sidebar-brand.clickable:hover {
    background-color: var(--bs-tertiary-bg);
}

.sidebar.collapsed .sidebar-footer {
    display: none;
}

.sidebar.collapsed .nav-divider {
    display: none;
}

/* Center nav items in collapsed mode */
.sidebar.collapsed .nav-item {
    justify-content: center;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
}

.sidebar.collapsed .nav-item i {
    margin-right: 0;
}

/* Hide admin icons/badges in collapsed mode to prevent clutter */
.sidebar.collapsed .nav-item .bi-shield-fill {
    display: none;
}

.sidebar.collapsed .admin-title {
    display: none;
}

/* Mobile Overlay */
.mobile-overlay {
    position: fixed;
    inset: 0;
    background-color: rgb(0 0 0 / 50%);
    z-index: 999;
}

/* Main Content Styles */
.main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    height: 100vh;
    overflow: hidden;
}

/* Navbar Styles */
.navbar {
    height: 60px;
    background: linear-gradient(90deg, rgba(var(--bs-primary-rgb), 0.06), rgba(var(--bs-primary-rgb), 0.10));
    border-bottom: 1px solid var(--bs-border-color);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    box-shadow: 0 2px 8px rgb(0 0 0 / 10%), 0 4px 16px rgb(0 0 0 / 5%);
    box-sizing: border-box;
    flex-shrink: 0;
    backdrop-filter: blur(10px);
    position: relative;
    z-index: 2000;
}

.navbar-left {
    display: flex;
    align-items: center;
    gap: 1rem;
}


.menu-toggle {
    background: none;
    border: none;
    color: var(--bs-body-color);
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.25rem;
    display: none;
    transition: color 0.3s ease;
}

.menu-toggle:hover {
    color: var(--bs-primary);
}


.page-title {
    font-size: 1.25rem;
    font-weight: 500;
    color: var(--bs-body-color);
}

.navbar-right {
    display: flex;
    align-items: center;
    gap: 1rem;
}



/* Language Dropdown Styles */
.language-dropdown {
    position: relative;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--bs-border-color);
}

.language-dropdown-btn {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--bs-border-color);
    border-radius: 6px;
    background: var(--bs-body-bg);
    color: var(--bs-body-color);
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s ease;
}

.language-dropdown-btn:hover {
    background: var(--bs-tertiary-bg);
    border-color: var(--bs-primary);
}

.current-language {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.language-dropdown-btn i {
    transition: transform 0.2s ease;
    font-size: 0.75rem;
}

.language-dropdown-btn i.rotated {
    transform: rotate(180deg);
}

.language-dropdown-menu {
    position: absolute;
    top: 100%;
    left: 1rem;
    right: 1rem;
    background: var(--bs-body-bg);
    border: 1px solid var(--bs-border-color);
    border-radius: 6px;
    box-shadow: 0 4px 12px rgb(0 0 0 / 10%);
    z-index: 3000;
    margin-top: 0.25rem;
    overflow: hidden;
}

.language-option {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    padding: 0.75rem 1rem;
    border: none;
    background: transparent;
    color: var(--bs-body-color);
    font-size: 0.875rem;
    text-align: left;
    cursor: pointer;
    transition: background-color 0.2s ease;
}

.language-option:hover {
    background: var(--bs-tertiary-bg);
}

.language-option.active {
    background: var(--bs-primary-bg-subtle);
    color: var(--bs-primary);
}

.language-option .flag {
    font-size: 1rem;
    min-width: 1.5rem;
}

.language-option .language-name {
    flex: 1;
    font-weight: 500;
}

.language-option .language-code {
    font-size: 0.75rem;
    color: var(--bs-secondary);
    font-weight: 600;
    min-width: 2rem;
    text-align: right;
}

/* Unit Selection Styles */
.unit-selection-section {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--bs-border-color);
}

.unit-selection-container {
    display: flex;
    gap: 0.5rem;
}

.unit-selection-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--bs-border-color);
    border-radius: 6px;
    background: var(--bs-body-bg);
    color: var(--bs-body-color);
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    flex: 1;
    justify-content: center;
}

.unit-selection-btn:hover {
    background: var(--bs-tertiary-bg);
    border-color: var(--bs-primary);
    transform: translateY(-1px);
}

.unit-selection-btn.active {
    background: var(--bs-primary);
    color: white;
    border-color: var(--bs-primary);
    box-shadow: 0 2px 4px rgba(var(--bs-primary-rgb), 0.2);
}

.unit-selection-btn.active:hover {
    background: var(--bs-primary-emphasis);
    transform: translateY(-1px);
}

.unit-selection-btn i {
    font-size: 1rem;
}

/* Theme Toggle Styles */
.theme-toggle-section {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--bs-border-color);
}

.theme-label {
    display: block;
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--bs-secondary);
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.theme-toggle-container {
    display: flex;
    gap: 0.5rem;
}

.theme-toggle-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--bs-border-color);
    border-radius: 6px;
    background: var(--bs-body-bg);
    color: var(--bs-body-color);
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    flex: 1;
    justify-content: center;
}

.theme-toggle-btn:hover {
    background: var(--bs-tertiary-bg);
    border-color: var(--bs-primary);
    transform: translateY(-1px);
}

.theme-toggle-btn.active {
    background: var(--bs-primary);
    color: white;
    border-color: var(--bs-primary);
    box-shadow: 0 2px 4px rgba(var(--bs-primary-rgb), 0.2);
}

.theme-toggle-btn.active:hover {
    background: var(--bs-primary-emphasis);
    transform: translateY(-1px);
}

.theme-toggle-btn i {
    font-size: 1rem;
}

/* Dashboard Icons Styles */
.dashboard-icons {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    margin-right: 0.75rem;
}

.notifications-menu {
    position: relative;
}

.icon-btn {
    background: none;
    border: none;
    color: var(--bs-body-color);
    font-size: 1rem;
    cursor: pointer;
    padding: 0.4rem;
    border-radius: 50%;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    position: relative;
}

.icon-btn:hover {
    color: var(--bs-primary);
    background-color: var(--bs-tertiary-bg);
}

.notification-badge {
    position: absolute;
    top: 0;
    right: 0;
    background: var(--bs-danger);
    color: white;
    font-size: 0.65rem;
    font-weight: 600;
    padding: 0.15rem 0.35rem;
    border-radius: 10px;
    min-width: 18px;
    text-align: center;
    line-height: 1.2;
    border: 2px solid var(--bs-body-bg);
}

.notifications-dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    background-color: var(--bs-body-bg);
    border: 1px solid var(--bs-border-color);
    border-radius: 0.5rem;
    min-width: 400px;
    max-width: 500px;
    width: 450px;
    max-height: 500px;
    margin-top: 0.5rem;
    box-shadow: 0 4px 12px rgb(0 0 0 / 10%);
    z-index: 3000;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.notifications-dropdown-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--bs-border-color);
    background: linear-gradient(135deg, var(--bs-tertiary-bg), var(--bs-body-bg));
}

.notifications-dropdown-header h4 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--bs-body-color);
}

.view-all-link {
    font-size: 0.875rem;
    color: var(--bs-primary);
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
}

.view-all-link:hover {
    color: var(--bs-primary-emphasis);
    text-decoration: underline;
}

.notifications-dropdown-content {
    flex: 1;
    overflow-y: auto;
    max-height: 400px;
    background-color: var(--bs-body-bg);
}

.notifications-list {
    display: flex;
    flex-direction: column;
}

.notification-item {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--bs-border-color);
    border-left: none;
    cursor: pointer;
    transition: all 0.2s ease;
    background: transparent;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.notification-item:hover {
    background-color: var(--bs-tertiary-bg);
}

.notification-item.unread {
    background-color: rgba(var(--bs-primary-rgb), 0.05);
}

.notification-item:last-child {
    border-bottom: none;
}

.notification-item-content {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    text-align: left;
}

.notification-item-title {
    font-weight: 600;
    font-size: 0.875rem;
    color: var(--bs-body-color);
    line-height: 1.4;
    text-align: left;
}

.notification-item-body {
    font-size: 0.8rem;
    color: var(--bs-secondary);
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2; /* Standard property for compatibility */
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: left;
}
/* ... skipped lines ... */
.content {
    flex: 1;
    padding: 0;
    overflow-y: auto;
    background-color: var(--bs-body-bg); /* Corrected from body-color */
    min-height: 0;
    /* height: calc(100vh - 60px); Removed to allow flex to handle height */
}

.notification-item-date {
    font-size: 0.75rem;
    color: var(--bs-secondary);
    line-height: 1.2;
    text-align: right;
    opacity: 0.8;
    margin-top: auto;
    padding-top: 0.25rem;
}

.notifications-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem 1rem;
    color: var(--bs-secondary);
    text-align: center;
    gap: 0.5rem;
}

.notifications-empty i {
    font-size: 2rem;
    opacity: 0.5;
}

.notifications-empty span {
    font-size: 0.875rem;
}

.notifications-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem 1rem;
    gap: 0.75rem;
    color: var(--bs-secondary);
}

.loading-spinner {
    width: 24px;
    height: 24px;
    border: 3px solid var(--bs-border-color);
    border-top-color: var(--bs-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

/* Dashboard Search Styles */
.dashboard-search-container {
    position: relative;
    display: flex;
    align-items: center;
    margin-left: 1rem;
}

.dashboard-search-container i {
    position: absolute;
    left: 0.75rem;
    color: var(--bs-secondary);
    z-index: 1;
    font-size: 0.875rem;
}

.dashboard-search-input {
    padding: 0.4rem 0.75rem 0.4rem 2rem;
    border: 1px solid var(--bs-border-color);
    border-radius: 6px;
    background: var(--bs-body-bg);
    color: var(--bs-body-color);
    font-size: 0.8rem;
    min-width: 280px;
    transition: border-color 0.2s;
}

.dashboard-search-input:focus {
    outline: none;
    border-color: var(--bs-primary);
    box-shadow: 0 0 0 2px rgba(var(--bs-primary-rgb), 0.1);
}

/* Search Results Dropdown */
.search-results-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: var(--bg-surface, var(--bs-body-bg));
    border: 1px solid var(--border, var(--bs-border-color));
    border-radius: 8px;
    box-shadow: 0 10px 25px rgb(0 0 0 / 15%), 0 4px 10px rgb(0 0 0 / 10%);
    z-index: 3000;
    margin-top: 8px;
    max-height: 500px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    min-width: 350px;
}

.search-results-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px;
    border-bottom: 1px solid var(--border, var(--bs-border-color));
    background: var(--bg-surface, var(--bs-body-bg));
    flex-shrink: 0;
}

/* Search Results Tabs */
.search-results-tabs {
    display: flex;
    gap: 4px;
    padding: 12px 16px;
    border-bottom: 1px solid var(--border, var(--bs-border-color));
    background: var(--bg-surface, var(--bs-body-bg));
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    flex-shrink: 0;
}

.search-results-tabs::-webkit-scrollbar {
    display: none;
}

.search-tab {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border: none;
    background: transparent;
    color: var(--text-secondary, var(--bs-secondary));
    font-size: 14px;
    font-weight: 500;
    letter-spacing: 0.2%;
    cursor: pointer;
    border-radius: 6px;
    transition: all 0.2s ease;
    white-space: nowrap;
    position: relative;
}

.search-tab:hover {
    background: var(--bg-elevated, var(--bs-tertiary-bg));
    color: var(--text-primary, var(--bs-body-color));
}

.search-tab.active {
    background: rgb(0 167 225 / 10%);
    color: var(--accent, var(--bs-primary));
}

.search-tab i {
    font-size: 14px;
}

.search-tab .tab-count {
    background: var(--bg-elevated, var(--bs-secondary-bg));
    color: var(--text-secondary, var(--bs-secondary));
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
    min-width: 20px;
    text-align: center;
    line-height: 1.4;
}

.search-tab.active .tab-count {
    background: var(--accent, var(--bs-primary));
    color: white;
}

.search-results-content {
    flex: 1;
    overflow-y: auto;
    padding: 8px 0;
}

.search-results-title-section {
    display: flex;
    align-items: center;
    gap: 8px;
}

.search-results-title-section i {
    color: var(--accent, var(--bs-primary));
    font-size: 16px;
}

.search-results-title {
    font-weight: 600;
    color: var(--text-primary, var(--bs-body-color));
    font-size: 16px;
    letter-spacing: 0%;
}

.search-results-count {
    font-weight: 500;
    color: var(--text-secondary, var(--bs-secondary));
    font-size: 13px;
    background: rgb(0 167 225 / 10%);
    padding: 4px 8px;
    border-radius: 12px;
    letter-spacing: 0.2%;
}

.close-search-btn {
    background: none;
    border: none;
    color: var(--text-secondary, var(--bs-secondary));
    cursor: pointer;
    padding: 8px;
    border-radius: 6px;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
}

.close-search-btn:hover {
    color: var(--text-primary, var(--bs-body-color));
    background: var(--bg-elevated, var(--bs-tertiary-bg));
}

.search-results-section {
    padding: 0.75rem 0;
}

.search-results-section-title {
    padding: 0.75rem 1.25rem 0.5rem;
    border-bottom: 1px solid var(--bs-border-color);
    margin-bottom: 0.5rem;
}

.section-title-content {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-weight: 600;
    color: var(--bs-body-color);
    font-size: 0.85rem;
}

.section-title-content i {
    color: var(--bs-primary);
    font-size: 1rem;
}

.section-count {
    background: var(--bs-primary-bg-subtle);
    color: var(--bs-primary);
    padding: 0.2rem 0.6rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 500;
    margin-left: auto;
}

.search-results-list {
    padding: 8px 16px;
}

.search-result-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    margin: 4px 0;
    cursor: pointer;
    transition: all 0.2s ease;
    border-radius: 6px;
    border: 1px solid var(--border, var(--bs-border-color));
    background: var(--bg-surface, var(--bs-body-bg));
}

.search-result-item:hover {
    background: var(--bg-elevated, var(--bs-tertiary-bg));
    border-color: var(--accent, var(--bs-primary));
    box-shadow: 0 2px 4px rgb(0 0 0 / 5%);
}

@keyframes searchItemFadeIn {
    from {
        opacity: 0;
        transform: translateX(-20px);
    }

    to {
        opacity: 1;
        transform: translateX(0);
    }
}

.search-result-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: var(--bs-primary-bg-subtle);
    border-radius: 6px;
    color: var(--bs-primary);
    font-size: 0.9rem;
    flex-shrink: 0;
}

.search-result-item:hover .search-result-icon {
    background: var(--bs-primary);
    color: white;
}

.search-result-content {
    flex: 1;
    min-width: 0;
}

.search-result-title {
    font-weight: 500;
    color: var(--text-primary, var(--bs-body-color));
    font-size: 16px;
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    letter-spacing: 0%;
}

.search-result-meta {
    display: flex;
    align-items: center;
    gap: 8px;
}

.search-result-date,
.search-result-description {
    font-size: 13px;
    color: var(--text-secondary, var(--bs-secondary));
    letter-spacing: 0.2%;
}

.search-result-action {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    color: var(--bs-secondary);
    flex-shrink: 0;
}

.search-result-item:hover .search-result-action {
    color: var(--bs-primary);
}

/* No Results */
.no-results {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 48px 24px;
    color: var(--text-secondary, var(--bs-secondary));
    text-align: center;
    justify-content: center;
    background: var(--bg-surface, var(--bs-body-bg));
    border-radius: 8px;
    margin: 16px;
}

.no-results i {
    font-size: 32px;
    color: var(--accent, var(--bs-primary));
    opacity: 0.6;
}

.no-results span {
    font-size: 14px;
    font-weight: 500;
    letter-spacing: 0.2%;
    color: var(--text-secondary, var(--bs-secondary));
}

/* Loading State */
.search-loading {
    padding: 48px 24px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.search-loading-content {
    display: flex;
    align-items: center;
    gap: 16px;
}

.search-loading-text {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.loading-title {
    font-weight: 600;
    color: var(--text-primary, var(--bs-body-color));
    font-size: 16px;
    letter-spacing: 0%;
}

.loading-subtitle {
    font-size: 13px;
    color: var(--text-secondary, var(--bs-secondary));
    letter-spacing: 0.2%;
}

.search-spinner {
    width: 24px;
    height: 24px;
    border: 3px solid var(--border, var(--bs-border-color));
    border-top-color: var(--accent, var(--bs-primary));
    border-radius: 50%;
    animation: search-spin 1s linear infinite;
}

@keyframes search-spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

/* New Survey Button Styles */
.new-survey-btn {
    background: var(--bs-primary);
    color: white;
    border: none;
    padding: 0.4rem 0.75rem;
    border-radius: 6px;
    font-weight: 500;
    font-size: 0.8rem;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    cursor: pointer;
    transition: all 0.2s;
    margin-right: 0.75rem;
}

.new-survey-btn:hover {
    background: var(--bs-primary-dark, #0b5ed7);
    transform: translateY(-1px);
}

/* User Menu Styles */
.user-menu {
    position: relative;
}

.user-menu-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    color: var(--bs-body-color);
    cursor: pointer;
    padding: 0.4rem;
    transition: all 0.3s ease;
}

.user-menu-btn:hover {
    color: var(--bs-primary);
}

.user-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    object-fit: cover;
    border: 1px solid var(--bs-border-color);
    transition: border-color 0.3s ease;
}

.user-menu-btn:hover .user-avatar {
    border-color: var(--bs-primary);
}

.user-name {
    font-size: 0.8rem;
    font-weight: 500;
}

.user-dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    background-color: var(--bs-body-bg);
    border: 1px solid var(--bs-border-color);
    border-radius: 0.5rem;
    min-width: 200px;
    margin-top: 0.5rem;
    box-shadow: 0 4px 12px rgb(0 0 0 / 10%);
    z-index: 3000;
}

.dropdown-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    color: var(--bs-body-color);
    text-decoration: none;
    transition: all 0.3s ease;
}

.dropdown-item:hover {
    background-color: var(--bs-tertiary-bg);
    color: var(--bs-primary);
}

.dropdown-divider {
    height: 1px;
    background-color: var(--bs-border-color);
    margin: 0.5rem 0;
}

/* Content Styles */
.content {
    flex: 1;
    padding: 0;
    overflow-y: auto;
    background-color: var(--bs-body-bg);
    min-height: 0;
    /* height: calc(100vh - 60px); Removed to allow flex to handle height */
}

/* Responsive Styles */
@media (width <= 768px) {
    .sidebar {
        position: fixed;
        left: 0;
        top: 0;
        bottom: 0;
        transform: translateX(-100%);
        box-shadow: 4px 0 20px rgb(0 0 0 / 15%), 8px 0 32px rgb(0 0 0 / 10%);
    }

    .sidebar.show {
        transform: translateX(0);
    }

    .navbar {
        padding: 0.5rem 0.75rem;
        height: auto;
        min-height: 50px;
    }

    .menu-toggle {
        display: block;
    }


    .sidebar-title {
        display: none;
    }

    .sidebar-title.hidden {
        display: none;
    }

    .navbar-right {
        gap: 0.4rem;
    }

    .dashboard-icons {
        display: none;
    }

    .notifications-dropdown {
        right: -0.5rem;
        min-width: 350px;
        max-width: 90vw;
        width: auto;
    }

    .new-survey-btn {
        padding: 0.3rem 0.6rem;
        font-size: 0.75rem;
        margin-right: 0.5rem;
    }

    .language-dropdown {
        padding: 0.5rem 0.75rem;
    }

    .language-dropdown-btn {
        padding: 0.4rem 0.6rem;
        font-size: 0.8rem;
    }

    .language-option {
        padding: 0.6rem 0.75rem;
        font-size: 0.8rem;
    }

    .unit-selection-section {
        padding: 0.5rem 0.75rem;
    }

    .unit-selection-btn {
        padding: 0.4rem 0.6rem;
        font-size: 0.8rem;
    }

    .theme-toggle-section {
        padding: 0.5rem 0.75rem;
    }

    .theme-toggle-btn {
        padding: 0.4rem 0.6rem;
        font-size: 0.8rem;
    }

    .user-name {
        display: none;
    }

    .user-menu-btn {
        padding: 0.35rem;
    }

    .user-avatar {
        width: 28px;
        height: 28px;
    }

    .user-dropdown {
        right: -0.5rem;
    }

    .dashboard-search-container {
        display: none;
    }

    .search-results-dropdown {
        min-width: 280px;
        max-height: 400px;
        left: -16px;
        right: -16px;
    }

    .search-results-header {
        padding: 12px 16px;
    }

    .search-results-title {
        font-size: 14px;
    }

    .search-results-tabs {
        padding: 8px 12px;
        gap: 4px;
    }

    .search-tab {
        padding: 6px 12px;
        font-size: 13px;
        gap: 6px;
    }

    .search-tab span:not(.tab-count) {
        font-size: 12px;
    }

    .search-tab .tab-count {
        font-size: 11px;
        padding: 2px 6px;
    }

    .search-results-content {
        max-height: 300px;
    }

    .search-results-list {
        padding: 8px 12px;
    }

    .search-result-item {
        padding: 10px 12px;
        margin: 4px 0;
        gap: 8px;
    }

    .search-result-title {
        font-size: 14px;
        margin-bottom: 2px;
    }

    .search-result-date,
    .search-result-description {
        font-size: 12px;
    }

    .search-result-icon {
        width: 32px;
        height: 32px;
        font-size: 0.9rem;
        flex-shrink: 0;
    }

    .search-result-content {
        gap: 0.15rem;
    }

    .search-result-title {
        font-size: 0.85rem;
    }

    .search-result-date,
    .search-result-description {
        font-size: 0.75rem;
    }

    .new-survey-btn {
        padding: 0.4rem 0.8rem;
        font-size: 0.8rem;
        margin-right: 0.5rem;
    }
}

/* Animation for mobile menu */
@media (width <= 768px) {
    .sidebar {
        transition: transform 0.3s ease;
    }
}

/* Extra small devices */
@media (width <= 480px) {
    .navbar {
        padding: 0.4rem;
    }

    .new-survey-btn {
        padding: 0.25rem 0.5rem;
        font-size: 0.7rem;
        margin-right: 0.4rem;
    }

    .language-dropdown {
        padding: 0.4rem 0.5rem;
    }

    .language-dropdown-btn {
        padding: 0.3rem 0.5rem;
        font-size: 0.75rem;
    }

    .language-option {
        padding: 0.5rem 0.6rem;
        font-size: 0.75rem;
    }

    .unit-selection-section {
        padding: 0.4rem 0.5rem;
    }

    .unit-selection-btn {
        padding: 0.3rem 0.5rem;
        font-size: 0.75rem;
    }

    .theme-toggle-section {
        padding: 0.4rem 0.5rem;
    }

    .theme-toggle-btn {
        padding: 0.3rem 0.5rem;
        font-size: 0.75rem;
    }

    .user-avatar {
        width: 22px;
        height: 22px;
    }
}

.global-loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgb(255 255 255 / 22.4%);
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
}


@keyframes global-spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.global-message-box {
    position: fixed;
    top: 32px;
    right: 32px;
    min-width: 240px;
    max-width: 90vw;
    z-index: 3000;
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.5rem;
    border-radius: 10px;
    font-size: 1.1rem;
    font-weight: 500;
    box-shadow: 0 4px 24px rgb(0 0 0 / 12%);
    background: #fff;
    color: #222;
    border-left: 6px solid var(--accent);
    animation: fadeInUp 0.3s;
}

.global-message-box.success {
    border-left-color: var(--success);
    color: #155724;
    background: #eafaf1;
}

.global-message-box.error {
    border-left-color: var(--error);
    color: #721c24;
    background: #fbeaea;
}

.global-message-box.info {
    border-left-color: var(--accent);
    color: #004085;
    background: #eaf6fb;
}

.global-message-box.warning {
    border-left-color: var(--warning);
    color: #856404;
    background: #fffbe6;
}

.global-message-box i {
    font-size: 1.5rem;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
