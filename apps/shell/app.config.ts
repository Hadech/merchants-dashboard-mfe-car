export default defineAppConfig({
  ui: {
    primary: 'primary',
    gray: 'neutral',

    button: {
      rounded: 'rounded-button',
      font: 'font-semibold text-md',
      default: {
        size: 'md',
      },
      color: {
        primary: {
          solid: 'bg-secondary text-primary-text border border-secondary hover:bg-secondary/90 disabled:opacity-40',
        },
        secondary: {
          outline: 'bg-white text-primary-text border border-primary-text hover:bg-gray-50',
        },
      },
    },

    input: {
      rounded: 'rounded-input',
      size: { md: 'h-10' },
      color: {
        white: {
          outline: 'border-border-input focus:border-secondary focus:ring-secondary/20',
        },
      },
      default: { size: 'md' },
    },

    select: {
      rounded: 'rounded-input',
      default: { size: 'md' },
    },

    modal: {
      rounded: 'rounded-modal',
      padding: 'p-10',
      overlay: { background: 'bg-black/50' },
    },

    table: {
      th: { color: 'text-[#909399]', font: 'font-normal' },
      td: { color: 'text-[#606266]', padding: 'py-2 px-0' },
      divide: 'divide-border',
    },

    notification: {
      rounded: 'rounded-lg',
    },

    pagination: {
      rounded: 'rounded',
      default: { size: 'sm' },
    },
  },
})
