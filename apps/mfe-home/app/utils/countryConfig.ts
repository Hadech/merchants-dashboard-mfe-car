interface CountryConfig {
  uiFlags: {
    showEnrollmentBanner: boolean
  }
}

const configs: Record<string, CountryConfig> = {
  CO: { uiFlags: { showEnrollmentBanner: true } },
  GT: { uiFlags: { showEnrollmentBanner: false } },
}

const defaultConfig: CountryConfig = { uiFlags: { showEnrollmentBanner: false } }

export function getCountryConfig(region: string): CountryConfig {
  return configs[region] ?? defaultConfig
}
