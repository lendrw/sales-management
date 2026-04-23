/// <reference types="cypress" />

describe("Navigation", () => {
  beforeEach(() => {
    // Login before each test
    cy.visit("/login");
    cy.get('[data-testid="email-input"]').type("admin@apivendas.com");
    cy.get('[data-testid="password-input"]').type("123456");
    cy.get('[data-testid="sign-in-button"]').click();
    cy.url().should("include", "/products");
  });

  it("should navigate between dashboard pages", () => {
    // Start on products page
    cy.url().should("include", "/products");
    cy.contains("Products").should("be.visible");

    // Navigate to customers
    cy.get('[data-testid="sidebar-customers"]').click();
    cy.url().should("include", "/customers");
    cy.contains("Customers").should("be.visible");

    // Navigate to orders
    cy.get('[data-testid="sidebar-orders"]').click();
    cy.url().should("include", "/orders");
    cy.contains("Orders").should("be.visible");

    // Navigate to profile
    cy.get('[data-testid="sidebar-profile"]').click();
    cy.url().should("include", "/profile");
    cy.contains("Profile").should("be.visible");

    // Navigate back to products
    cy.get('[data-testid="sidebar-products"]').click();
    cy.url().should("include", "/products");
    cy.contains("Products").should("be.visible");
  });

  it("should highlight active navigation item", () => {
    // Check products is active
    cy.get('[data-testid="sidebar-products"]').should("have.class", "bg-emerald-600");

    // Navigate to customers
    cy.get('[data-testid="sidebar-customers"]').click();
    cy.get('[data-testid="sidebar-customers"]').should("have.class", "bg-emerald-600");
    cy.get('[data-testid="sidebar-products"]').should("not.have.class", "bg-emerald-600");
  });

  it("should logout successfully", () => {
    // Click logout button in sidebar
    cy.get('[data-testid="sidebar-logout"]').click();

    // Should redirect to login page
    cy.url().should("include", "/login");
  });

  it("should redirect to login when accessing protected route without auth", () => {
    // Logout first
    cy.get('[data-testid="sidebar-logout"]').click();

    // Try to access products directly
    cy.visit("/products");
    cy.url().should("include", "/login");
  });
});