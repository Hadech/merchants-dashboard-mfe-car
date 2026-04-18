export interface CountryUiFlags {
  showEnrollmentBanner: boolean
}

export interface CountryConfig {
  uiFlags: CountryUiFlags
}

const configs: Record<string, CountryConfig> = {
  CO: {
    uiFlags: {
      showEnrollmentBanner: true,
    },
  },
  GT: {
    uiFlags: {
      showEnrollmentBanner: false,
    },
  },
}

const defaultConfig: CountryConfig = {
  uiFlags: {
    showEnrollmentBanner: true,
  },
}

export function getCountryConfig(region: string): CountryConfig {
  return configs[region] ?? defaultConfig
}
