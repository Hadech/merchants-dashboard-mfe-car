<template>
  <div>
    <!-- Mobile Toolbar -->
    <div class="mobile-toolbar">
      <i
        v-if="!isOpen"
        class="event-icon ic ic_menu-bar"
        @click="$emit('open')"
      />
      <i class="icon-mobile-toolbar ic ic_wompi_primary_positive" />
      <i
        v-if="isOpen"
        class="event-icon ic ic_error"
        @click="$emit('close')"
      />
    </div>

    <!-- Sidebar -->
    <aside
      class="side-menu"
      :class="{ hide: !isOpen, 'is-sandbox': isSandbox }"
    >
      <!-- Header with Logo -->
      <div class="side-menu__header">
        <span class="menu-icon">Wompi</span>
        <i
          class="close-icon ic ic_error"
          @click="$emit('close')"
        />
      </div>

      <!-- Menu Items -->
      <div class="menu-items">
        <div
          v-for="item in menuItems"
          :key="item.id"
          class="menu-item"
        >
          <!-- Simple item (no subItems or single subItem) -->
          <a
            v-if="!item.subItems || item.subItems.length === 0"
            :class="{ 'item-selected': isItemSelected(item) }"
            @click="handleNavigate(item)"
          >
            <div class="__content">
              <i v-if="item.icon" :class="'ic ic_' + item.icon" />
              <span>{{ item.name }}</span>
              <div v-if="item.isNew" class="is-new">
                <span>Nuevo</span>
              </div>
            </div>
          </a>

          <!-- Group item with subItems -->
          <a v-else>
            <div class="__content" @click="toggleDropdown(item.id)">
              <i v-if="item.icon" :class="'ic ic_' + item.icon" />
              <span>{{ item.name }}</span>
              <i
                :class="'ic ic_angle-' + (expandedItems[item.id] ? 'up' : 'down') + ' arrow'"
              />
            </div>
            <div
              v-for="subItem in item.subItems"
              :key="subItem.id"
              :class="['sub-item', { expanded: expandedItems[item.id] }]"
            >
              <a
                v-if="subItem.to && subItem.to.includes('https')"
                :href="subItem.to"
                target="_blank"
                @click="handleClose()"
              >
                <span>{{ subItem.name }}</span>
              </a>
              <a
                v-else
                :class="{ 'sub-item-selected': isItemSelected(subItem) }"
                @click="handleNavigate(subItem)"
              >
                <span>{{ subItem.name }}</span>
              </a>
            </div>
          </a>
        </div>

        <!-- Bottom section: Aprende con Wompi + Salir -->
        <div class="account-items">
          <div class="menu-item">
            <a
              :class="{ 'item-selected': route.path === '/learn-wompi' }"
              @click="handleNavigate({ id: 'learn-wompi', to: '/learn-wompi', name: 'Aprende con Wompi' })"
            >
              <div class="__content">
                <i class="ic ic_lightbulb" />
                <span>Aprende con Wompi</span>
              </div>
            </a>
            <a @click="$emit('logout')">
              <div class="__content">
                <i class="ic ic_sign-out" />
                <span>Salir</span>
              </div>
            </a>
          </div>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
interface MenuItem {
  id: string
  to: string
  name: string
  icon?: string
  isNew?: boolean
  subItems?: MenuItem[]
}

interface Props {
  menuItems: MenuItem[]
  isSandbox: boolean
  isOpen: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  open: []
  navigate: [path: string]
  logout: []
}>()

const route = useRoute()
const expandedItems = ref<Record<string, boolean>>({})

function toggleDropdown(itemId: string) {
  expandedItems.value[itemId] = !expandedItems.value[itemId]
}

function isItemSelected(item: MenuItem): boolean {
  return route.path === item.to
}

function handleNavigate(item: MenuItem) {
  emit('navigate', item.to)
  emit('close')
}

function handleClose() {
  emit('close')
}

// Auto-expand parent if a sub-item is the current route
watch(
  () => route.path,
  (newPath) => {
    for (const item of props.menuItems) {
      if (item.subItems?.some(sub => sub.to === newPath)) {
        expandedItems.value[item.id] = true
      }
    }
  },
  { immediate: true }
)
</script>

<style scoped>
/* ===== Sidebar Container ===== */
.side-menu::-webkit-scrollbar {
  display: none !important;
}

.side-menu {
  font-size: 1rem;
  position: fixed;
  top: 0;
  left: 0;
  width: 16.3rem;
  bottom: 0;
  background: #fff;
  transition: margin-left 250ms ease-in-out;
  box-shadow: -0.063rem 0rem 0.375rem 0rem rgba(0, 0, 0, 0.1) inset;
  -ms-overflow-style: none !important;
  scrollbar-width: none !important;
  z-index: 20;
  overflow-y: auto;
}

/* ===== Header ===== */
.side-menu__header {
  position: relative;
  height: 6.25rem;
  width: 100%;
}

.menu-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1.5rem;
  font-weight: 700;
  color: #2C2A29;
}

.close-icon {
  cursor: pointer;
  color: #BDF4BC;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  right: 3%;
  font-size: 2.1875rem;
  display: none;
}

/* ===== Menu Items ===== */
.menu-items {
  padding: 0.5rem;
  overflow-y: auto;
  overflow-x: hidden;
  max-height: calc(100vh - 15rem);
}

.menu-item {
  cursor: pointer;
  transition: color 0.1s ease-in-out;
  font-weight: 400;
  color: #2A2C29;
}

.menu-item .__content {
  display: flex;
  align-items: center;
  height: 2.5rem;
  padding: 0.53125rem 5%;
  transition: all 250ms ease-in-out;
}

.menu-item .__content:hover {
  color: #2A2C29;
  background: #D8F9D7;
  border-radius: 0.4rem;
}

.menu-item .__content:hover i {
  color: #2A2C29 !important;
}

.menu-item .__content:hover span {
  color: #2A2C29;
}

.menu-item .__content span {
  font-size: 1rem;
}

.menu-item .__content i,
.menu-item .__content span {
  display: inline-block;
  vertical-align: middle;
}

.menu-item .__content i {
  margin-right: 0.5rem;
  font-size: 1.5rem;
  color: #2A2C29;
}

.menu-item .__content .arrow {
  margin-left: auto;
  font-size: 1.113rem;
}

/* ===== Selected State ===== */
.item-selected .__content {
  border-radius: 0.5rem;
  background-color: #2C2A29;
  margin-bottom: 4px;
  margin-top: 4px;
}

.item-selected .__content i {
  color: #DFFF61 !important;
}

.item-selected .__content span {
  color: #DFFF61;
}

/* ===== Sub Items ===== */
.sub-item {
  position: relative;
  overflow: hidden;
  max-height: 0;
  transition: max-height 0.3s ease-in-out;
}

.sub-item a {
  display: block;
  cursor: pointer;
  width: 85%;
  margin: 0 2.2rem;
  padding: 0.625rem;
}

.sub-item a:hover {
  color: #2A2C29;
  background: #D8F9D7;
  border-radius: 0.5rem;
}

.sub-item::before {
  content: '';
  display: block;
  position: absolute;
  width: 0.313rem;
  height: 0.313rem;
  background: #616161;
  border-radius: 50%;
  left: 1.25rem;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
}

.sub-item::after {
  content: '';
  display: block;
  position: absolute;
  height: 2.3rem;
  background: #616161;
  border-left: 0.063rem solid #CACACA;
  left: 1.4rem;
  top: 50%;
  transform: translateY(-50%);
}

.sub-item:last-child::after {
  height: 1rem;
  top: 0.625rem;
}

.sub-item.expanded {
  max-height: 12.5rem;
}

.sub-item-selected {
  color: #DFFF61;
  background-color: #2C2A29;
  border-radius: 0.5rem;
  margin-bottom: 0.25rem;
  margin-top: 0.25rem;
}

/* ===== "Nuevo" Badge ===== */
.is-new {
  display: flex;
  background: #00825A;
  border-radius: 0.25rem;
  margin-left: 0.5rem;
  padding: 0.125rem 0.188rem;
  right: 1.875rem;
}

.is-new span {
  font-family: 'Open Sans', sans-serif;
  font-weight: 600;
  font-size: 0.75rem !important;
  line-height: 1rem;
  color: #FFFFFF !important;
  margin: auto;
}

/* ===== Bottom Account Items ===== */
.account-items {
  position: absolute;
  width: 95%;
  bottom: 0;
  border-top: 1px solid #CACACA;
  background: #FFFFFF;
  padding: 1rem 0;
  z-index: 1;
}

/* ===== Mobile Toolbar ===== */
.mobile-toolbar {
  display: none;
  position: relative;
  height: 4.2rem;
  padding: 1.3125rem 1.1975rem;
  background: #fff;
  border-bottom: 0.019rem solid #CACACA;
}

.icon-mobile-toolbar {
  position: absolute;
  font-size: 2.5rem;
  bottom: 0.8rem;
  left: 1.8rem;
}

.event-icon {
  cursor: pointer;
  color: #DFFF61;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-size: 2rem;
  background: #2C2A29;
  border-radius: 50%;
  padding: 0.2rem;
}

/* ===== Sandbox Offset ===== */

/* ===== Responsive: < 48rem (768px) ===== */
@media screen and (max-width: 48rem) {
  .side-menu {
    position: absolute;
    top: 4.2rem;
    left: 0;
    width: 100%;
    z-index: 10;
    box-shadow: none;
  }

  .side-menu.hide {
    margin-left: -100vw;
  }

  .side-menu__header {
    width: 95%;
    margin: 0 auto;
    display: none;
  }

  .side-menu.is-sandbox {
    top: calc(4.2rem + 3rem);
  }

  .side-menu.is-sandbox .side-menu__header {
    height: calc(6.25rem - 1rem);
  }

  .close-icon {
    display: block;
  }

  .mobile-toolbar {
    display: flex;
    flex-direction: row-reverse;
  }

  .menu-items {
    margin-top: 1rem;
  }

  .sub-item a {
    margin: 0 2.5rem;
    padding: 0.625rem;
  }

  .sub-item::before {
    left: 1.6rem;
  }

  .sub-item::after {
    left: 1.78rem;
  }
}
</style>
