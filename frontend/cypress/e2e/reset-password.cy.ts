/// <reference types="cypress" />

describe("Reset Password flow", () => {
  it("should reset password successfully", () => {
    cy.visit("/reset-password?token=valid-token");

    cy.get('[data-testid="password-input"]').type("newpassword123");
    cy.get('[data-testid="reset-password-button"]').click();

    cy.url().should("include", "/login");
  });

  it("should display error for invalid token", () => {
    cy.visit("/reset-password?token=invalid-token");

    cy.get('[data-testid="password-input"]').type("newpassword123");
    cy.get('[data-testid="reset-password-button"]').click();

    cy.get('[data-testid="error-message"]').should("be.visible");
  });

  it("should display validation error for short password", () => {
    cy.visit("/reset-password?token=valid-token");

    cy.get('[data-testid="password-input"]').type("123");
    cy.get('[data-testid="reset-password-button"]').click();

    cy.get('[data-testid="password-input"]')
      .parent()
      .should("contain.text", "Minimum 6 characters");
  });
});