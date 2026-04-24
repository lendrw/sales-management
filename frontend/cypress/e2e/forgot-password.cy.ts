/// <reference types="cypress" />

describe("Forgot Password flow", () => {
  it("should send reset link successfully", () => {
    cy.visit("/forgot-password");

    cy.get('[data-testid="email-input"]').type("admin@apivendas.com");
    cy.get('[data-testid="send-reset-button"]').click();

    cy.contains("Check your inbox").should("be.visible");
    cy.contains("We sent you a link to reset your password").should("be.visible");
  });

  it("should display error for invalid email", () => {
    cy.visit("/forgot-password");

    cy.get('[data-testid="email-input"]').type("invalid-email");
    cy.get('[data-testid="send-reset-button"]').click();

    cy.get('[data-testid="error-message"]').should("be.visible");
  });

  it("should navigate back to login", () => {
    cy.visit("/forgot-password");

    cy.contains("Back to sign in").click();
    cy.url().should("include", "/login");
  });
});