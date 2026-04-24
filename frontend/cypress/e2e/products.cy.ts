/// <reference types="cypress" />

describe("Products page", () => {
  const uniqueProductName = (prefix: string) =>
    `${prefix} ${Date.now()} ${Cypress._.random(1000, 9999)}`;

  beforeEach(() => {
    // Login before each test
    cy.visit("/login");
    cy.get('[data-testid="email-input"]').type("admin@apivendas.com");
    cy.get('[data-testid="password-input"]').type("123456");
    cy.get('[data-testid="sign-in-button"]').click();
    cy.url().should("include", "/products");
  });

  it("should display products page", () => {
    cy.contains("Products").should("be.visible");
    cy.contains("Manage your product catalog").should("be.visible");
  });

  it("should display products table", () => {
    // Wait for the page title to be visible first
    cy.contains("Products").should("be.visible");
    cy.contains("Manage your product catalog").should("be.visible");
    // Wait for loading to finish
    cy.get("table").should("be.visible");
  });

  it("should search products", () => {
    cy.get('[data-testid="search-input"]').type("test product");
    cy.wait(500); // Wait for debounce
    // Should filter results
  });

  it("should open create product modal", () => {
    cy.get('[data-testid="new-product-button"]').click();
    cy.get('[data-testid="product-modal"]').should("be.visible");
    cy.contains("New product").should("be.visible");
  });

  it("should create a new product", () => {
    const productName = uniqueProductName("Test Product");

    cy.get('[data-testid="new-product-button"]').click();

    cy.get('[data-testid="product-name-input"]').type(productName);
    cy.get('[data-testid="product-price-input"]').type("29.99");
    cy.get('[data-testid="product-stock-input"]').type("10");

    cy.get('[data-testid="save-product-button"]').click();

    cy.get('[data-testid="product-modal"]').should("not.exist");
    cy.contains(productName).should("be.visible");
  });

  it("should edit a product", () => {
    const updatedProductName = uniqueProductName("Updated Product");

    // Click edit button on first product
    cy.get('[data-testid="edit-product-button"]').first().click();

    cy.get('[data-testid="product-modal"]').should("be.visible");
    cy.contains("Edit product").should("be.visible");

    cy.get('[data-testid="product-name-input"]')
      .clear()
      .type(updatedProductName);
    cy.get('[data-testid="save-product-button"]').click();

    cy.get('[data-testid="product-modal"]').should("not.exist");
    cy.contains(updatedProductName).should("be.visible");
  });

  it("should delete a product", () => {
    // Click delete button on first product
    cy.get('[data-testid="delete-product-button"]').first().click();

    cy.get('[data-testid="confirm-dialog"]').should("be.visible");
    cy.contains("Delete product").should("be.visible");

    cy.get('[data-testid="confirm-delete-button"]').click();

    cy.get('[data-testid="confirm-dialog"]').should("not.exist");
  });

  it("should navigate pagination", () => {
    // This test assumes there are multiple pages
    cy.get('[data-testid="pagination-next"]').click();
    cy.url().should("include", "page=2");
  });
});
