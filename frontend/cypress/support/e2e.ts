// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Global test configuration and utilities

// Configure global behavior
beforeEach(() => {
  // Clear localStorage before each test
  cy.window().then((win) => {
    win.localStorage.clear();
  });

  // Intercept API calls for consistent testing
  cy.intercept('GET', '/api/*', { statusCode: 200 }).as('api');
  cy.intercept('POST', '/api/*', { statusCode: 200 }).as('api');
  cy.intercept('PUT', '/api/*', { statusCode: 200 }).as('api');
  cy.intercept('DELETE', '/api/*', { statusCode: 200 }).as('api');
});

// Add custom commands for common actions
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login');
  cy.get('[data-testid="email-input"]').type(email);
  cy.get('[data-testid="password-input"]').type(password);
  cy.get('[data-testid="sign-in-button"]').click();
  cy.url().should('include', '/products');
});

Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="sidebar-logout"]').click();
  cy.url().should('include', '/login');
});

Cypress.Commands.add('navigateToPage', (page: string) => {
  cy.get(`[data-testid="sidebar-${page}"]`).click();
  cy.url().should('include', `/${page}`);
});

// Handle uncaught exceptions
Cypress.on('uncaught:exception', (err, runnable) => {
  // Return false to prevent Cypress from failing the test
  // Useful for handling expected errors in the application
  if (err.message.includes('Network Error') ||
      err.message.includes('Request failed') ||
      err.message.includes('Loading chunk')) {
    return false;
  }
});