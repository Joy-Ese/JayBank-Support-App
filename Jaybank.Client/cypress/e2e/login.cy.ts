describe('Login Page Test', () => {
  it('should load login page and submit form', () => {
    cy.visit('/login'); 
    
    // Fill the form
    cy.get('#username').type('Eseosa');
    cy.get('#password').type('123456789');

    // Take screenshot BEFORE submitting
    cy.screenshot('before-login-submit');

    // Submit the form
    cy.get('button[type="submit"]').click();

    // Wait for redirect
    cy.url({ timeout: 10000 }).should('include', '/chat');

    // Wait until loader is gone
    cy.get('.loader', { timeout: 10000 }).should('not.exist'); 

    // Now UI is ready, take the screenshot
    cy.screenshot('after-redirect-to-chat');

    // Confirm chat page loaded
    cy.contains("I'm your AI Support assistant. How can I help you today?");
  });
});
