/// <reference types="cypress" />

describe("Customers page", () => {
  beforeEach(() => {
    // Login before each test
    cy.visit("/login");
    cy.get('[data-testid="email-input"]').type("admin@apivendas.com");
    cy.get('[data-testid="password-input"]').type("123456");
    cy.get('[data-testid="sign-in-button"]').click();
    cy.url().should("include", "/products");

    // Navigate to customers
    cy.get('[data-testid="sidebar-customers"]').click();
    cy.url().should("include", "/customers");
  });

  it("should display customers page", () => {
    cy.contains("Customers").should("be.visible");
    cy.contains("Manage your customer base").should("be.visible");
  });

  it("should display customers table", () => {
    // Wait for the page title to be visible first
    cy.contains("Customers").should("be.visible");
    cy.contains("Manage your customer base").should("be.visible");
    // Wait for loading to finish (skeleton should disappear)
    cy.get("table").should("be.visible");
  });

  it("should search customers", () => {
    cy.get('[data-testid="search-input"]').type("john");
    cy.wait(500); // Wait for debounce
    // Should filter results
  });

  it("should open create customer modal", () => {
    cy.get('[data-testid="new-customer-button"]').click();
    cy.get('[data-testid="customer-modal"]').should("be.visible");
    cy.contains("New customer").should("be.visible");
  });

  it("should create a new customer", () => {
    const uniqueEmail = `customer+${Date.now()}@example.com`;

    cy.get('[data-testid="new-customer-button"]').click();

    cy.get('[data-testid="customer-name-input"]').type("John Doe");
    cy.get('[data-testid="customer-email-input"]').type(uniqueEmail);

    cy.get('[data-testid="create-customer-button"]').click();

    cy.get('[data-testid="customer-modal"]').should("not.exist");
    cy.contains("John Doe").should("be.visible");
  });

  it("should display validation errors", () => {
    cy.get('[data-testid="new-customer-button"]').click();

    cy.get('[data-testid="create-customer-button"]').click();

    cy.get('[data-testid="customer-name-input"]')
      .parent()
      .should("contain.text", "Name is required");

    cy.get('[data-testid="customer-email-input"]')
      .parent()
      .should("contain.text", "Invalid email");
  });

  it("should navigate pagination", () => {
    // This test assumes there are multiple pages
    cy.get('[data-testid="pagination-next"]').click();
    cy.url().should("include", "page=2");
  });
});
