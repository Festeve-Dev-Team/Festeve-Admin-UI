import { lazy } from 'react'
import { APP_PREFIX_PATH } from '@/constants/route.constant'
import { ADMIN, USER } from '@/constants/roles.constant'
import type { Routes } from '@/@types/routes'

const appsRoute: Routes = [
    {
        key: 'appsProject.dashboard',
        path: `${APP_PREFIX_PATH}/project/dashboard`,
        component: lazy(() => import('@/views/project/ProjectDashboard')),
        authority: [ADMIN, USER],
    },
    {
        key: 'appsProject.projectList',
        path: `${APP_PREFIX_PATH}/project/project-list`,
        component: lazy(() => import('@/views/project/ProjectList')),
        authority: [ADMIN, USER],
    },
    {
        key: 'appsProject.scrumBoard',
        path: `${APP_PREFIX_PATH}/project/scrum-board`,
        component: lazy(() => import('@/views/project/ScrumBoard')),
        authority: [ADMIN, USER],
        meta: {
            pageContainerType: 'gutterless',
        },
    },
    {
        key: 'appsProject.issue',
        path: `${APP_PREFIX_PATH}/project/issue`,
        component: lazy(() => import('@/views/project/Issue')),
        authority: [ADMIN, USER],
    },
    {
        key: 'appsCrm.dashboard',
        path: `${APP_PREFIX_PATH}/crm/dashboard`,
        component: lazy(() => import('@/views/crm/CrmDashboard')),
        authority: [ADMIN, USER],
    },
    {
        key: 'appsCrm.calendar',
        path: `${APP_PREFIX_PATH}/crm/calendar`,
        component: lazy(() => import('@/views/crm/Calendar')),
        authority: [ADMIN, USER],
    },
    {
        key: 'appsCrm.customers',
        path: `${APP_PREFIX_PATH}/crm/customers`,
        component: lazy(() => import('@/views/crm/Customers')),
        authority: [ADMIN, USER],
        meta: {
            header: 'Customers',
        },
    },
    {
        key: 'appsCrm.customerDetails',
        path: `${APP_PREFIX_PATH}/crm/customer-details`,
        component: lazy(() => import('@/views/crm/CustomerDetail')),
        authority: [ADMIN, USER],
        meta: {
            header: 'Customer Details',
            headerContainer: true,
        },
    },
    {
        key: 'appsCrm.mail',
        path: `${APP_PREFIX_PATH}/crm/mail`,
        component: lazy(() => import('@/views/crm/Mail')),
        authority: [ADMIN, USER],
        meta: {
            pageContainerType: 'gutterless',
            footer: false,
        },
    },
    {
        key: 'appsCrm.mail',
        path: `${APP_PREFIX_PATH}/crm/mail/:category`,
        component: lazy(() => import('@/views/crm/Mail')),
        authority: [ADMIN, USER],
        meta: {
            pageContainerType: 'gutterless',
            footer: false,
        },
    },
    {
        key: 'appsSales.dashboard',
        path: `${APP_PREFIX_PATH}/sales/dashboard`,
        component: lazy(() => import('@/views/sales/SalesDashboard')),
        authority: [ADMIN, USER],
    },
    {
        key: 'appsSales.productList',
        path: `${APP_PREFIX_PATH}/sales/product-list`,
        component: lazy(() => import('@/views/sales/ProductList')),
        authority: [ADMIN, USER],
    },
    // V2 sales routes (non-breaking, separate namespace)
    {
        key: 'appsSalesV2.productList',
        path: `${APP_PREFIX_PATH}/sales-v2/product-list`,
        component: lazy(() => import('@/views/salesV2/ProductListV2')),
        authority: [ADMIN, USER],
        meta: { header: 'Product List V2' },
    },
    {
        key: 'appsSalesV2.productNew',
        path: `${APP_PREFIX_PATH}/sales-v2/product-new`,
        component: lazy(() => import('@/views/salesV2/ProductCreateV2')),
        authority: [ADMIN, USER],
        meta: { header: 'Add New Product (V2)' },
    },
    {
        key: 'appsSalesV2.productEdit',
        path: `${APP_PREFIX_PATH}/sales-v2/product-edit/:productId`,
        component: lazy(() => import('@/views/salesV2/ProductEditV2')),
        authority: [ADMIN, USER],
        meta: { header: 'Edit Product (V2)' },
    },
    // Vendors V2
    {
        key: 'appsVendorsV2.vendorList',
        path: `${APP_PREFIX_PATH}/vendors-v2/vendor-list`,
        component: lazy(() => import('@/views/vendorsV2/VendorListV2')),
        authority: [ADMIN, USER],
        meta: { header: 'Vendors V2' },
    },
    {
        key: 'appsVendorsV2.vendorNew',
        path: `${APP_PREFIX_PATH}/vendors-v2/vendor-new`,
        component: lazy(() => import('@/views/vendorsV2/VendorCreateV2')),
        authority: [ADMIN, USER],
        meta: { header: 'Add New Vendor (V2)' },
    },
    {
        key: 'appsVendorsV2.vendorEdit',
        path: `${APP_PREFIX_PATH}/vendors-v2/vendor-edit/:id`,
        component: lazy(() => import('@/views/vendorsV2/VendorEditV2')),
        authority: [ADMIN, USER],
        meta: { header: 'Edit Vendor (V2)' },
    },
    // Categories V2
    {
        key: 'appsCategoriesV2.categoryList',
        path: `${APP_PREFIX_PATH}/categories-v2/category-list`,
        component: lazy(() => import('@/views/categoriesV2/CategoryListV2')),
        authority: [ADMIN, USER],
        meta: { header: 'Categories V2' },
    },
    {
        key: 'appsCategoriesV2.categoryNew',
        path: `${APP_PREFIX_PATH}/categories-v2/category-new`,
        component: lazy(() => import('@/views/categoriesV2/CategoryCreateV2')),
        authority: [ADMIN, USER],
        meta: { header: 'Add New Category (V2)' },
    },
    {
        key: 'appsCategoriesV2.categoryEdit',
        path: `${APP_PREFIX_PATH}/categories-v2/category-edit/:id`,
        component: lazy(() => import('@/views/categoriesV2/CategoryEditV2')),
        authority: [ADMIN, USER],
        meta: { header: 'Edit Category (V2)' },
    },
    // Purohits V2
    {
        key: 'appsPurohitsV2.list',
        path: `${APP_PREFIX_PATH}/purohits-v2/purohit-list`,
        component: lazy(() => import('@/views/purohitsV2/PurohitListV2')),
        authority: [ADMIN, USER],
        meta: { header: 'Purohits V2' },
    },
    {
        key: 'appsPurohitsV2.new',
        path: `${APP_PREFIX_PATH}/purohits-v2/purohit-new`,
        component: lazy(() => import('@/views/purohitsV2/PurohitCreateV2')),
        authority: [ADMIN, USER],
        meta: { header: 'Add New Purohit (V2)' },
    },
    {
        key: 'appsPurohitsV2.edit',
        path: `${APP_PREFIX_PATH}/purohits-v2/purohit-edit/:purohitId`,
        component: lazy(() => import('@/views/purohitsV2/PurohitEditV2')),
        authority: [ADMIN, USER],
        meta: { header: 'Edit Purohit (V2)' },
    },
    // Events V2
    {
        key: 'appsEventsV2.list',
        path: `${APP_PREFIX_PATH}/events-v2/event-list`,
        component: lazy(() => import('@/views/eventsV2/EventListV2')),
        authority: [ADMIN, USER],
        meta: { header: 'Events V2' },
    },
    {
        key: 'appsEventsV2.new',
        path: `${APP_PREFIX_PATH}/events-v2/event-new`,
        component: lazy(() => import('@/views/eventsV2/EventCreateV2')),
        authority: [ADMIN, USER],
        meta: { header: 'Add New Event (V2)' },
    },
    {
        key: 'appsEventsV2.edit',
        path: `${APP_PREFIX_PATH}/events-v2/event-edit/:eventId`,
        component: lazy(() => import('@/views/eventsV2/EventEditV2')),
        authority: [ADMIN, USER],
        meta: { header: 'Edit Event (V2)' },
    },
    // Promos V2
    {
        key: 'appsPromosV2.list',
        path: `${APP_PREFIX_PATH}/promos-v2/promo-list`,
        component: lazy(() => import('@/views/promosV2/PromoListV2')),
        authority: [ADMIN, USER],
        meta: { header: 'Promos V2' },
    },
    {
        key: 'appsPromosV2.new',
        path: `${APP_PREFIX_PATH}/promos-v2/promo-new`,
        component: lazy(() => import('@/views/promosV2/PromoCreateV2')),
        authority: [ADMIN, USER],
        meta: { header: 'Add New Promo (V2)' },
    },
    {
        key: 'appsPromosV2.edit',
        path: `${APP_PREFIX_PATH}/promos-v2/promo-edit/:promoId`,
        component: lazy(() => import('@/views/promosV2/PromoEditV2')),
        authority: [ADMIN, USER],
        meta: { header: 'Edit Promo (V2)' },
    },
    // Offers V2
    {
        key: 'appsOffersV2.list',
        path: `${APP_PREFIX_PATH}/offers-v2/offer-list`,
        component: lazy(() => import('@/views/offersV2/OfferListV2')),
        authority: [ADMIN, USER],
        meta: { header: 'Offers V2' },
    },
    {
        key: 'appsOffersV2.new',
        path: `${APP_PREFIX_PATH}/offers-v2/offer-new`,
        component: lazy(() => import('@/views/offersV2/OfferCreateV2')),
        authority: [ADMIN, USER],
        meta: { header: 'Add New Offer (V2)' },
    },
    {
        key: 'appsOffersV2.edit',
        path: `${APP_PREFIX_PATH}/offers-v2/offer-edit/:offerId`,
        component: lazy(() => import('@/views/offersV2/OfferEditV2')),
        authority: [ADMIN, USER],
        meta: { header: 'Edit Offer (V2)' },
    },
    // Homepage V2
    {
        key: 'appsHomepageV2.configure',
        path: `${APP_PREFIX_PATH}/homepage-v2/configure`,
        component: lazy(() => import('@/views/homepageV2/HomepageConfigureV2')),
        authority: [ADMIN, USER],
        meta: { header: 'Homepage Configure (V2)' },
    },
    // Bookings V2
    {
        key: 'appsBookingsV2.list',
        path: `${APP_PREFIX_PATH}/bookings-v2/booking-list`,
        component: lazy(() => import('@/views/bookingsV2/BookingListV2')),
        authority: [ADMIN, USER],
        meta: { header: 'Bookings V2' },
    },
    {
        key: 'appsBookingsV2.new',
        path: `${APP_PREFIX_PATH}/bookings-v2/booking-new`,
        component: lazy(() => import('@/views/bookingsV2/BookingCreateV2')),
        authority: [ADMIN, USER],
        meta: { header: 'Add New Booking (V2)' },
    },
    {
        key: 'appsBookingsV2.edit',
        path: `${APP_PREFIX_PATH}/bookings-v2/booking-edit/:bookingId`,
        component: lazy(() => import('@/views/bookingsV2/BookingEditV2')),
        authority: [ADMIN, USER],
        meta: { header: 'Edit Booking (V2)' },
    },
    // Payments V2
    {
        key: 'appsPaymentsV2.list',
        path: `${APP_PREFIX_PATH}/payments-v2/payment-list`,
        component: lazy(() => import('@/views/paymentsV2/PaymentListV2')),
        authority: [ADMIN, USER],
        meta: { header: 'Payments V2' },
    },
    {
        key: 'appsPaymentsV2.new',
        path: `${APP_PREFIX_PATH}/payments-v2/payment-new`,
        component: lazy(() => import('@/views/paymentsV2/PaymentCreateV2')),
        authority: [ADMIN, USER],
        meta: { header: 'Add New Payment (V2)' },
    },
    {
        key: 'appsPaymentsV2.edit',
        path: `${APP_PREFIX_PATH}/payments-v2/payment-edit/:paymentId`,
        component: lazy(() => import('@/views/paymentsV2/PaymentEditV2')),
        authority: [ADMIN, USER],
        meta: { header: 'Edit Payment (V2)' },
    },
    // Delivery Slots V2
    {
        key: 'appsDeliverySlotsV2.create',
        path: `${APP_PREFIX_PATH}/delivery-v2/slot-new`,
        component: lazy(() => import('@/views/deliverySlotsV2/SlotCreateV2')),
        authority: [ADMIN, USER],
        meta: { header: 'New Delivery Slot (V2)' },
    },
    // Vendors V2
    {
        key: 'appsVendorsV2.new',
        path: `${APP_PREFIX_PATH}/vendors-v2/vendor-new`,
        component: lazy(() => import('@/views/vendorsV2/VendorCreateV2')),
        authority: [ADMIN, USER],
        meta: { header: 'New Vendor (V2)' },
    },
    {
        key: 'appsSales.productEdit',
        path: `${APP_PREFIX_PATH}/sales/product-edit/:productId`,
        component: lazy(() => import('@/views/sales/ProductEdit')),
        authority: [ADMIN, USER],
        meta: {
            header: 'Edit Product',
        },
    },
    {
        key: 'appsSales.productNew',
        path: `${APP_PREFIX_PATH}/sales/product-new`,
        component: lazy(() => import('@/views/sales/ProductNew')),
        authority: [ADMIN, USER],
        meta: {
            header: 'Add New Product',
        },
    },
    {
        key: 'appsSales.orderList',
        path: `${APP_PREFIX_PATH}/sales/order-list`,
        component: lazy(() => import('@/views/sales/OrderList')),
        authority: [ADMIN, USER],
    },
    {
        key: 'appsSales.orderDetails',
        path: `${APP_PREFIX_PATH}/sales/order-details/:orderId`,
        component: lazy(() => import('@/views/sales/OrderDetails')),
        authority: [ADMIN, USER],
    },
    {
        key: 'appsCrypto.dashboard',
        path: `${APP_PREFIX_PATH}/crypto/dashboard`,
        component: lazy(() => import('@/views/crypto/CryptoDashboard')),
        authority: [ADMIN, USER],
    },
    {
        key: 'appsCrypto.portfolio',
        path: `${APP_PREFIX_PATH}/crypto/portfolio`,
        component: lazy(() => import('@/views/crypto/Portfolio')),
        authority: [ADMIN, USER],
        meta: {
            header: 'Portfolio',
        },
    },
    {
        key: 'appsCrypto.market',
        path: `${APP_PREFIX_PATH}/crypto/market`,
        component: lazy(() => import('@/views/crypto/Market')),
        authority: [ADMIN, USER],
        meta: {
            header: 'Market',
        },
    },
    {
        key: 'appsCrypto.wallets',
        path: `${APP_PREFIX_PATH}/crypto/wallets`,
        component: lazy(() => import('@/views/crypto/Wallets')),
        authority: [ADMIN, USER],
        meta: {
            header: 'Wallets',
        },
    },
    {
        key: 'appsknowledgeBase.helpCenter',
        path: `${APP_PREFIX_PATH}/knowledge-base/help-center`,
        component: lazy(() => import('@/views/knowledge-base/HelpCenter')),
        authority: [ADMIN, USER],
        meta: {
            pageContainerType: 'gutterless',
        },
    },
    {
        key: 'appsknowledgeBase.article',
        path: `${APP_PREFIX_PATH}/knowledge-base/article`,
        component: lazy(() => import('@/views/knowledge-base/Article')),
        authority: [ADMIN, USER],
    },
    {
        key: 'appsknowledgeBase.manageArticles',
        path: `${APP_PREFIX_PATH}/knowledge-base/manage-articles`,
        component: lazy(() => import('@/views/knowledge-base/ManageArticles')),
        authority: [ADMIN, USER],
        meta: {
            header: 'Manage Articles',
            extraHeader: lazy(
                () =>
                    import(
                        '@/views/knowledge-base/ManageArticles/components/PanelHeader'
                    ),
            ),
            headerContainer: true,
        },
    },
    {
        key: 'appsknowledgeBase.editArticle',
        path: `${APP_PREFIX_PATH}/knowledge-base/edit-article`,
        component: lazy(() => import('@/views/knowledge-base/EditArticle')),
        authority: [ADMIN, USER],
    },
    {
        key: 'appsAccount.settings',
        path: `${APP_PREFIX_PATH}/account/settings/:tab`,
        component: lazy(() => import('@/views/account/Settings')),
        authority: [ADMIN, USER],
        meta: {
            header: 'Settings',
            headerContainer: true,
        },
    },
    {
        key: 'appsAccount.invoice',
        path: `${APP_PREFIX_PATH}/account/invoice/:id`,
        component: lazy(() => import('@/views/account/Invoice')),
        authority: [ADMIN, USER],
    },
    {
        key: 'appsAccount.activityLog',
        path: `${APP_PREFIX_PATH}/account/activity-log`,
        component: lazy(() => import('@/views/account/ActivityLog')),
        authority: [ADMIN, USER],
    },
    {
        key: 'appsAccount.kycForm',
        path: `${APP_PREFIX_PATH}/account/kyc-form`,
        component: lazy(() => import('@/views/account/KycForm')),
        authority: [ADMIN, USER],
    },
]

export default appsRoute
