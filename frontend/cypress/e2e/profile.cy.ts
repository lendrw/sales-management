/// <reference types="cypress" />

describe("Profile page", () => {
  beforeEach(() => {
    // Login before each test
    cy.visit("/login");
    cy.get('[data-testid="email-input"]').type("admin@apivendas.com");
    cy.get('[data-testid="password-input"]').type("123456");
    cy.get('[data-testid="sign-in-button"]').click();
    cy.url().should("include", "/products");

    // Navigate to profile
    cy.get('[data-testid="sidebar-profile"]').click();
    cy.url().should("include", "/profile");
  });

  it("should display profile page", () => {
    cy.contains("Profile").should("be.visible");
    cy.contains("Manage your account settings").should("be.visible");
  });

  it("should display user information", () => {
    cy.get('[data-testid="user-name"]').should("be.visible");
    cy.get('[data-testid="user-email"]').should("be.visible");
  });

  it("should update profile information", () => {
    cy.get('[data-testid="profile-name-input"]').clear().type("Updated Name");
    cy.get('[data-testid="profile-email-input"]').clear().type("updated@example.com");

    cy.get('[data-testid="save-profile-button"]').click();

    cy.contains("Profile updated successfully").should("be.visible");
  });

  it("should change password", () => {
    cy.get('[data-testid="current-password-input"]').type("123456");
    cy.get('[data-testid="new-password-input"]').type("newpassword123");

    cy.get('[data-testid="save-profile-button"]').click();

    cy.contains("Profile updated successfully").should("be.visible");
  });

  it("should require current password when changing password", () => {
    cy.get('[data-testid="new-password-input"]').type("newpassword123");

    cy.get('[data-testid="save-profile-button"]').click();

    cy.contains("Current password is required").should("be.visible");
  });

  it("should display validation errors", () => {
    cy.get('[data-testid="profile-name-input"]').clear();
    cy.get('[data-testid="profile-email-input"]').clear().type("invalid-email");

    cy.get('[data-testid="save-profile-button"]').click();

    cy.contains("Name is required").should("be.visible");
    cy.contains("Invalid email").should("be.visible");
  });

  it("should upload avatar", () => {
    // Mock file upload
    cy.get('[data-testid="avatar-upload"]').selectFile("cypress/fixtures/example.json", { force: true });

    cy.contains("Avatar updated").should("be.visible");
  });
});