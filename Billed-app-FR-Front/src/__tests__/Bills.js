/**
 * @jest-environment jsdom
 */

import { screen, waitFor, fireEvent } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import Bills from "../containers/Bills.js";
import mockStore from "../__mocks__/store.js"
import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    // Test pour vérifier que l'icône des factures est mise en surbrillance
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      expect(windowIcon.classList.contains('active-icon')).toBe(true)
    })

    // Test pour vérifier que les factures sont triées de la plus récente à la plus ancienne
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    // Test pour vérifier que le clic sur l'icône de l'œil ouvre une modale avec la preuve de la facture
    test("Then clicking on the eye icon should open a modal with the bill proof", async () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const billsInstance = new Bills({
        document,
        onNavigate: (pathname) => document.body.innerHTML = ROUTES({ pathname }),
        store: mockStore,
        localStorage: window.localStorage
      })
      $.fn.modal = jest.fn(); // Mock jQuery modal function

      const eyeIcon = screen.getAllByTestId('icon-eye')[0]
      const handleClickIconEye = jest.fn(billsInstance.handleClickIconEye)
      eyeIcon.addEventListener('click', handleClickIconEye(eyeIcon))
      fireEvent.click(eyeIcon)

      expect(handleClickIconEye).toHaveBeenCalled()
      expect($.fn.modal).toHaveBeenCalled()
    })
  })

  describe("When I navigate to Bills", () => {
    // Test pour vérifier que les factures sont récupérées depuis l'API mockée
    test("fetches bills from mock API GET", async () => {
      const getSpy = jest.spyOn(mockStore.bills(), "list")
      const bills = await mockStore.bills().list()
      expect(getSpy).toHaveBeenCalledTimes(1)
      expect(bills.length).toBe(4)
    })

    // Test pour vérifier la gestion d'erreur 404 lors de la récupération des factures depuis l'API
    test("fetches bills from an API and fails with 404 message error", async () => {
      mockStore.bills().list.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      )
      document.body.innerHTML = BillsUI({ error: "Erreur 404" })
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })

    // Test pour vérifier la gestion d'erreur 500 lors de la récupération des factures depuis l'API
    test("fetches messages from an API and fails with 500 message error", async () => {
      mockStore.bills().list.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      )
      document.body.innerHTML = BillsUI({ error: "Erreur 500" })
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})
