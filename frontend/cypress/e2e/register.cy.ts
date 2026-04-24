/// <reference types="cypress" />

describe("Register flow", () => {
  it("should register successfully", () => {
    const uniqueEmail = `karl+${Date.now()}@apivendas.com`;

    cy.visit("/register");

    cy.get('[data-testid="name-input"]').type("Karl Doe");
    cy.get('[data-testid="email-input"]').type(uniqueEmail);
    cy.get('[data-testid="password-input"]').type("123456");
    cy.get('[data-testid="register-button"]').click();

    cy.url().should("include", "/products");
  });

  it("should display error when e-mail is already in use", () => {
    cy.visit("/register");

    cy.get('[data-testid="name-input"]').type("Admin");
    cy.get('[data-testid="email-input"]').type("admin@apivendas.com");
    cy.get('[data-testid="password-input"]').type("wrongpassword");
    cy.get('[data-testid="register-button"]').click();

    cy.url().should("not.include", "/products");
    cy.get('[data-testid="error-message"]').should("be.visible");
  });

  it("should display field error on submitting empty form", () => {
    cy.visit("/register");

    cy.get('[data-testid="register-button"]').click();

    cy.url().should("not.include", "/profile");

    cy.get('[data-testid="email-input"]')
      .parent()
      .should("contain.text", "Invalid email");

    cy.get('[data-testid="password-input"]')
      .parent()
      .should("contain.text", "Minimum 6 characters");
  });

  it("should display email error on invalid e-mail format", () => {
    cy.visit("/register");

    cy.get('[data-testid="name-input"]').type("Admin");
    cy.get('[data-testid="email-input"]').type("invalid-email");
    cy.get('[data-testid="password-input"]').type("wrongpassword");
    cy.get('[data-testid="register-button"]').click();

    cy.url().should("not.include", "/profile");

    cy.get('[data-testid="email-input"]')
      .parent()
      .contains("Invalid email")
      .should("be.visible");
  });
});
