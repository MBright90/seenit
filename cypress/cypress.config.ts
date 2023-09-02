import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {},
    baseUrl: 'http://localhost:8080/',
    env: {
      EMAIL: 'the test email',
      PASSWORD: 'the test password'
    }
  }
})