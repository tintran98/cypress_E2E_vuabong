// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add('clearRegisterFormInputField', () => { 
    cy.get('.modal-body').within(() => {
        cy.get('input[placeholder*="Nhập tên"]').clear()
        cy.get('input[placeholder*="Nhập tài"]').clear()
        cy.get('input[placeholder*="Nhập địa"]').clear()
        cy.get('input[placeholder*="Nhập mật"]').clear()
    })
})

Cypress.Commands.add('checkInputValidationMsg', ($sel, msg, alias) => { 
    cy.get('.modal-body').within(() => {
        cy.get($sel).as(alias).should('have.class', 'is-invalid').next('.invalid-feedback')
            .invoke('text')
                .should('equal', msg)
    })
})