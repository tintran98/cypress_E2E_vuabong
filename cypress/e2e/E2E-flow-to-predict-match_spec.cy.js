
let accountEmptyMsg = 'It nhất 6 ký tự, không cho phép ký tự đặc biệt'
const betTypes = {
  fullMatch_12_gold: "TỈ LỆ CHẤP TOÀN TRẬN",
  firstHalf_5_gold: "TỈ LỆ CHẤP HIỆP 1",
  firstHalf_Big_Small_41_gold : "TÀI XỈU HIỆP 1",
  fullMatch_Big_Small_23_gold: "TÀI XỈU TOÀN TRẬN",
  fullMatch_1x2_32_gold: "1X2 TOÀN TRẬN",
  firstHalf_1x2_27_gold: "1X2 HIỆP 1",
  fullMatchScore: "TỈ SỐ TOÀN TRẬN",
  firstHalfScore: "TỈ SỐ HIỆP 1",
  secondHalfScore: "TỈ SỐ HIỆP 2",
  even_odd_4_gold: "LẺ/CHẴN",
  firstHalf_Even_Odd_4_gold: "LẺ/CHẴN HIỆP 1",
  numOfScores_4_gold: "TỔNG SỐ BÀN THẮNG",
  firstHalf_numOfScores_3_gold: "TỔNG SỐ BÀN THẮNG HIỆP 1"
}

describe('E2E flow to predict match', () => {
  it('Navigate to site', () => {
    cy.visit('https://vuabong.cc/')
  })

  context('Sign Up flow', () => {
    let usernameIFSel = 'input[placeholder*="Nhập tên"]'
    let accountIFSel = 'input[placeholder*="Nhập tài"]'
    let emailIFSel = 'input[placeholder*="Nhập địa"]'
    let passwordIFSel = 'input[placeholder*="Nhập mật"]'

    it('Sign In form validation', () => {
      cy.get('button.header-button:contains("Đăng ký")').realClick()
      cy.get('button:contains("ĐĂNG KÝ")').realClick()
  
      //username should show warning msg "Ít nhất 6 kí tự"
      // ex: usernameIF alias means username Input Field
      cy.checkInputValidationMsg(usernameIFSel, 'Ít nhất 6 kí tự', 'usernameIF')
      //input username field
      cy.get('@usernameIF').type('richard').should('have.class', 'is-valid')
      //account should show warning msg "It nhất 6 ký tự, không cho phép ký tự đặc biệt"
      cy.checkInputValidationMsg(accountIFSel, accountEmptyMsg, 'accountIF')
      //input account field
      cy.get('@accountIF').type(Cypress.env('account')).should('have.class', 'is-valid')
      //email should show warning msg "Email không tồn tại"
      cy.checkInputValidationMsg(emailIFSel, 'Email không tồn tại', 'emailIF')
      //input email field
      cy.get('@emailIF').type(`${Cypress.env('account')}@gmail.com`).should('have.class', 'is-valid')
      //password should show warning msg "Ít nhất 8 kí tự"
      cy.checkInputValidationMsg(passwordIFSel, 'Ít nhất 8 kí tự', 'passwordIF')
      //input email field
      cy.get('@passwordIF').type(Cypress.env('password')).should('have.class', 'is-valid')
  
      cy.clearRegisterFormInputField()
      
    })

    it('Register an account flow', () => {
      cy.get('#signup-modal').should('be.visible')
      // input username field
      cy.get(`${usernameIFSel}`).type(Cypress.env('username'))
      // input account field
      cy.get(`${accountIFSel}`).type(Cypress.env('account'))
      // input email field
      cy.get(`${emailIFSel}`).type(`${Cypress.env('account')}@gmail.com`)
      // input password field
      cy.get(`${passwordIFSel}`).type(Cypress.env('password'))
      // hit the submit button to register account
      cy.get('button:contains("ĐĂNG KÝ")').realClick()
    })
  })

  context('Log In flow', () => {
    let isRegisterButtonVisible
    it('Log out if logged in', () => {
      cy.get('.user-box').realClick()
      cy.get('a:contains("Đăng xuất")').realClick()
    })

    it('Log In Form Validation', () => {
      cy.intercept('POST','/api/user/signin').as('signinAPI')
      cy.get('button.header-button:contains("Đăng nhập")').realClick()    
      cy.get('#login-modal').should('be.visible')
      //Click dang nhap button without fill out the fields
      cy.get('#login-modal button:contains("ĐĂNG NHẬP")').realClick()
      //Assert the toaster should pop up the log in fail msg
      cy.get('.b-toaster-top-right').contains('Đăng nhập không thành công').should('be.visible')
      //Assert that API response will have status 400 b/c request did not success without given data
      cy.wait('@signinAPI').its('response.body').should('contain', '"status": 400').and('contain', '"err": 1')
      //Close modal then re-login
      // cy.get('button.close[aria-label="Close"]').should('be.visible').realClick()
      // cy.get('button.header-button:contains("Đăng nhập")').realClick()   
      //fill out the login data
      cy.get('.modal-body input[placeholder*="Nhập địa"]').focus().realType(`${Cypress.env('account')}@gmail.com`)
      cy.get('.modal-body input[placeholder*="Nhập mật"]').focus().realType(Cypress.env('password'))
      //click submit button
      cy.get('#login-modal button:contains("ĐĂNG NHẬP")').realClick()
      //catch API then assert response has no error and status success
      cy.wait('@signinAPI').its('response.body').should('contain', '"status": 2').and('contain', '"err": 0')
    })

  })
  
  context('Predict match flow', () => {
    let lstSearchResult = [{}]
    let lstNewestBetResult = []
    let betNum = 0
    let numOfGoldCanBet = 0
    it('Click "Đăng dự đoán" button should open BV modal', () => {
      cy.intercept('GET','/api/event/search?s=*').as('listResultsAPI')
      cy.intercept('GET','/api/user/check-max-bet-gold').as('getMaxGoldsAPI')
      cy.intercept('POST','/api/tip/new-tips').as('newestPredictAPI')
      
      cy.get('.navbar-nav a.nav-link[href="/du-doan"]').click()
      cy.get('button.header-button:contains("ĐĂNG DỰ ĐOÁN")').click()
      // cy.wait(2000)
      cy.get('#bv-modal-post-tip-search input[placeholder*="Tìm kiếm"]').as('searchIF')
        .should('be.visible')
        .type('Kyoto')
      
      cy.get('.modal-body .list-group li').should('be.visible')
      cy.wait('@listResultsAPI').then((res) => {
        cy.wrap(res).its('response').then((response) => {
          lstSearchResult = JSON.parse(response.body)
          expect(lstSearchResult.data).length.gt(0)
        })
      })

      cy.get('.modal-body .list-group li').first().click()

      //Navigate to predict page detail
      cy.contains(' ĐĂNG DỰ ĐOÁN ').click()
      //Get random bettype
      const randomBetType = Cypress._.sample(betTypes)

      //remove all the predict match before create new one
      cy.get('.card span:contains("Xóa hết")').click()
      //Now select new match
      cy.get(`.row .card span:contains(${randomBetType})`)
        .parent()
        .parent()
        .siblings()
        .children()
        .eq(0).within((bet) => {
          cy.wrap(bet).find('span[role="button"]').scrollIntoView().click()
          cy.wrap(bet).find('button > span').invoke('text').then((betTxt) => {
            betNum = betTxt
          })
        })
      
      //Verify that new bet has been set at the list bets
      cy.then(() => {
        cy.get('.card span b:contains("DỰ ĐOÁN ĐÃ CHỌN")').should('be.visible')
        cy.get('.card span b span').should('contain.text', Math.abs(betNum) )

        //click Du Doan Ngay
        cy.get('button:contains("DỰ ĐOÁN NGAY")').should('be.visible').click()

        cy.wait('@getMaxGoldsAPI').then((res) => {
          cy.wrap(res).its('response').then((response) => {
            let responseDt = JSON.parse(response.body)
            numOfGoldCanBet = responseDt.data
            expect(numOfGoldCanBet).is.gt(0)
          })
        })
      })

      cy.then(() => {
        //Verify alert msg if user not select the gold wanna bet
        cy.get('#post-tip-modal span:contains("ĐĂNG DỰ ĐOÁN")').realClick()
        //Assert the toaster should pop up the log in fail msg
        cy.get('#b-toaster-top-right').contains('Vui lòng chọn số gold bạn muốn đặt.').should('be.visible')
        cy.wait(3000)
        //Verify that the msg would match the numOfGoldCanBet number
        cy.get('#post-tip-modal .row p span').invoke('text').then((txt) => {
          expect(parseInt(txt)).equal(numOfGoldCanBet)
        }) 
        //choose 10 gold
        cy.get('#post-tip-modal [data-toggle="buttons"] label:last').click()
        //click Dang Du Doan
        cy.get('#post-tip-modal span:contains("ĐĂNG DỰ ĐOÁN")').realClick()
        //Assert that toast the success msg
        cy.get('#b-toaster-top-right').contains('Đăng dự đoán thành công').should('be.visible')
        //Verify the predict match just posted is appear in the Newest Predict part
        cy.get('.header-chart-event button:contains("DỰ ĐOÁN")').eq(0).click()

        // cy.wait('@newestPredictAPI').then((res) => {
        //   cy.wrap(res).its('response').then((response) => {
        //     let responseDt = JSON.parse(response.body)
        //     lstNewestBetResult = responseDt.data
        //     console.log('lstNewestBetResult: ', lstNewestBetResult)
        //     // expect(lstNewestBetResult).is.gt(0)
        //   })
        // })
        cy.get('.card h5 b:contains("DỰ ĐOÁN MỚI NHẤT")').should('be.visible')
        //newest predict match should show at the first index
        cy.get(`.new-tips-lanscape .match-box-content a[role="button"] div:contains("${Cypress.env("username")}")`)
          .should('be.visible')
      })
      

    })
  })
  
})