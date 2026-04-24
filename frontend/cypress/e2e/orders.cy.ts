/// <reference types="cypress" />

describe("Orders page", () => {
  beforeEach(() => {
    // Login before each test
    cy.visit("/login");
    cy.get('[data-testid="email-input"]').type("admin@apivendas.com");
    cy.get('[data-testid="password-input"]').type("123456");
    cy.get('[data-testid="sign-in-button"]').click();
    cy.url().should("include", "/products");

    // Navigate to orders
    cy.get('[data-testid="sidebar-orders"]').click();
    cy.url().should("include", "/orders");
  });

  it("should display orders page", () => {
    cy.contains("Orders").should("be.visible");
    cy.contains("Track and manage customer orders").should("be.visible");
  });

  it("should display orders table", () => {
    // Wait for the page title to be visible first
    cy.contains("Orders").should("be.visible");
    cy.contains("Track and manage customer orders").should("be.visible");
    // Wait for loading to finish
    cy.get("table").should("be.visible");
  });

  it("should open create order modal", () => {
    cy.get('[data-testid="new-order-button"]').click();
    cy.get('[data-testid="order-modal"]').should("be.visible");
    cy.contains("New order").should("be.visible");
  });

  it("should create a new order", () => {
    cy.get('[data-testid="new-order-button"]').click();

    // Select customer
    cy.get('[data-testid="order-customer-select"]').select(1); // Select first customer

    // Add product
    cy.get('[data-testid="order-product-select"]').first().select(1); // Select first product
    cy.get('[data-testid="order-quantity-input"]').first().clear().type("2");

    cy.get('[data-testid="create-order-button"]').click();

    cy.get('[data-testid="order-modal"]').should("not.exist");
    // Should show the new order in the table
  });

  it("should add multiple products to order", () => {
    cy.get('[data-testid="new-order-button"]').click();

    cy.get('[data-testid="order-customer-select"]').select(1);

    // Add first product
    cy.get('[data-testid="order-product-select"]').first().select(1);
    cy.get('[data-testid="order-quantity-input"]').first().clear().type("1");

    // Add second product
    cy.get('[data-testid="add-product-button"]').click();
    cy.get('[data-testid="order-product-select"]').eq(1).select(2);
    cy.get('[data-testid="order-quantity-input"]').eq(1).clear().type("3");

    cy.get('[data-testid="create-order-button"]').click();

    cy.get('[data-testid="order-modal"]').should("not.exist");
  });

  it("should view order details", () => {
    // Click view button on first order (if exists)
    cy.get('[data-testid="view-order-button"]').first().click();

    cy.get('[data-testid="order-details-modal"]').should("be.visible");
    cy.contains("Order details").should("be.visible");
  });

  it("should display validation errors", () => {
    cy.get('[data-testid="new-order-button"]').click();

    cy.get('[data-testid="create-order-button"]').click();

    cy.contains("Customer is required").should("be.visible");
    cy.contains("Product is required").should("be.visible");
  });

  it("should remove product from order", () => {
    cy.get('[data-testid="new-order-button"]').click();

    cy.get('[data-testid="order-customer-select"]').select(1);

    // Add first product
    cy.get('[data-testid="order-product-select"]').first().select(1);

    // Add second product
    cy.get('[data-testid="add-product-button"]').click();

    // Remove second product
    cy.get('[data-testid="remove-product-button"]').last().click();

    // Should only have one product left
    cy.get('[data-testid="order-product-select"]').should("have.length", 1);
  });
});
