/// <reference types="cypress" />

describe("Login flow", () => {
  it("should log in successfully", () => {
    cy.visit("/login");

    cy.get('[data-testid="email-input"]').type("admin@apivendas.com");
    cy.get('[data-testid="password-input"]').type("123456");
    cy.get('[data-testid="sign-in-button"]').click();

    cy.url().should("include", "/products");
  });

  it("should display error on invalid login", () => {
    cy.visit("/login");

    cy.get('[data-testid="email-input"]').type("admin@apivendas.com");
    cy.get('[data-testid="password-input"]').type("wrongpassword");
    cy.get('[data-testid="sign-in-button"]').click();

    cy.url().should("not.include", "/products");
    cy.get('[data-testid="error-message"]').should("be.visible");
  });

  it("should display field error on submitting empty form", () => {
    cy.visit("/login");

    cy.get('[data-testid="sign-in-button"]').click();

    cy.url().should("not.include", "/profile");

    cy.get('[data-testid="email-input"]')
      .parent()
      .should("contain.text", "Invalid email");

    cy.get('[data-testid="password-input"]')
      .parent()
      .should("contain.text", "Password is required");
  });

  it("should display email error on invalid e-mail format", () => {
    cy.visit("/login");

    cy.get('[data-testid="email-input"]').type("invalid-email");
    cy.get('[data-testid="password-input"]').type("wrongpassword");
    cy.get('[data-testid="sign-in-button"]').click();

    cy.url().should("not.include", "/profile");

    cy.get('[data-testid="email-input"]')
      .parent()
      .contains("Invalid email")
      .should("be.visible");
  });
});