/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { screen, fireEvent, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import NewBill from "../containers/NewBill.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore);

beforeAll(() => {
   Object.defineProperty(window, "localStorage", { value: localStorageMock });
   window.localStorage.setItem(
      "user",
      JSON.stringify({
         type: "Employee",
         email: "employee@test.tld",
         status: "connected",
      })
   );
   const root = document.createElement("div");
   root.setAttribute("id", "root");
   document.body.append(root);
   router();
   window.onNavigate(ROUTES_PATH.NewBill);
});

afterEach(() => {
   jest.clearAllMocks();
});

describe("Given I am connected as an employee", () => {

   // Test suite pour remplir le formulaire de nouvelle facture
   describe("When I am on newBill Page and I fill out the form", () => {

      // Test pour sélectionner une option dans le menu déroulant des types de dépenses
      test("Then I choose an option in the select menu and it should select 'Hôtel et logement' from select menu", async () => {
         const inputSelect = screen.getByTestId("expense-type"); // Récupère le menu déroulant du type de dépense
         userEvent.selectOptions(inputSelect, ["Hôtel et logement"]); // Sélectionne 'Hôtel et logement'
         await waitFor(() => expect(inputSelect.value).toBe("Hôtel et logement")); // Vérifie que la valeur sélectionnée est bien 'Hôtel et logement'
      });

      // Test pour entrer un nom de dépense et vérifier qu'il est affiché dans le champ de saisie du nom
      test("Then I enter an expense name and it should display 'Nouvelle facture' in the name input", async () => {
         const inputName = screen.getByTestId("expense-name"); // Récupère le champ de saisie du nom de la dépense
         userEvent.type(inputName, "Nouvelle facture"); // Saisit 'Nouvelle facture'
         await waitFor(() => expect(inputName.value).toBe("Nouvelle facture")); // Vérifie que la valeur saisie est bien 'Nouvelle facture'
      });

      // Test pour sélectionner une date et vérifier qu'elle est affichée dans le champ de saisie de la date
      test("Then I select a date and it should display the date in the date input", async () => {
         const inputDate = screen.getByTestId("datepicker"); // Récupère le champ de saisie de la date
         userEvent.type(inputDate, "2023-03-22"); // Saisit '2023-03-22'
         // Ajout d'un événement 'input' pour forcer la mise à jour de la valeur
         fireEvent.input(inputDate, { target: { value: "2023-03-22" } });
         await waitFor(() => expect(inputDate.value).toBe("2023-03-22")); // Vérifie que la valeur saisie est bien '2023-03-22'
      });

      // Test pour entrer un montant et vérifier qu'il est affiché dans le champ de saisie du montant
      test("Then I enter an amount and it should display '150' in the amount input", async () => {
         const inputAmount = screen.getByTestId("amount"); // Récupère le champ de saisie du montant
         userEvent.type(inputAmount, "150"); // Saisit '150'
         await waitFor(() => expect(inputAmount.value).toBe("150")); // Vérifie que la valeur saisie est bien '150'
      });

      // Test pour entrer un montant de TVA et vérifier qu'il est affiché dans le champ de saisie de la TVA
      test("Then I enter a VAT amount and it should display '30' in the VAT amount input", async () => {
         const inputVATAmount = screen.getByTestId("vat"); // Récupère le champ de saisie du montant de la TVA
         userEvent.type(inputVATAmount, "30"); // Saisit '30'
         await waitFor(() => expect(inputVATAmount.value).toBe("30")); // Vérifie que la valeur saisie est bien '30'
      });

      // Test pour entrer un pourcentage de TVA et vérifier qu'il est affiché dans le champ de saisie du pourcentage de TVA
      test("Then I enter a VAT Pourcentage and it should display '20' in the VAT Pourcentage input", async () => {
         const inputVATPourcentage = screen.getByTestId("pct"); // Récupère le champ de saisie du pourcentage de TVA
         userEvent.type(inputVATPourcentage, "20"); // Saisit '20'
         await waitFor(() => expect(inputVATPourcentage.value).toBe("20")); // Vérifie que la valeur saisie est bien '20'
      });

      // Test pour écrire un commentaire et vérifier qu'il est affiché dans le champ de saisie du commentaire
      test("Then I write a commentary and it should display 'Je t'envoie les notes de frais pour le restaurant à part' in the commentary input", async () => {
         const inputCommentary = screen.getByTestId("commentary"); // Récupère le champ de saisie du commentaire
         userEvent.type(inputCommentary, "Je t'envoie les notes de frais pour le restaurant à part"); // Saisit le commentaire
         await waitFor(() => expect(inputCommentary.value).toBe("Je t'envoie les notes de frais pour le restaurant à part")); // Vérifie que la valeur saisie est bien le commentaire attendu
      });
   });

   // Test suite pour uploader un fichier avec une extension incorrecte
   describe("When I am on newBill Page and I upload a file with an incorrect extension ", () => {
      test("Then it should display the error message", async () => {
         const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage });
         const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e)); // Mock la fonction de gestion du changement de fichier
         const inputFile = screen.getByTestId("file"); // Récupère le champ de saisie du fichier
         inputFile.addEventListener("change", handleChangeFile);
         fireEvent.change(inputFile, {
            target: {
               files: [new File(["fileTestPdf"], "test.pdf", { type: "application/pdf" })],
            },
         }); // Simule le changement de fichier avec un fichier PDF
         await waitFor(() => expect(handleChangeFile).toHaveBeenCalledTimes(1)); // Vérifie que la fonction a été appelée
         await waitFor(() => expect(inputFile.validationMessage).toBe("Formats acceptés : jpg, jpeg et png")); // Vérifie que le message d'erreur est affiché
      });
   });

   // Test suite pour uploader un fichier avec une extension correcte
   describe("When I am on newBill Page and I upload a file with a correct extension ", () => {
      test("Then I upload a file with a correct extension and it should not display the error message", async () => {
         const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage });
         const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e)); // Mock la fonction de gestion du changement de fichier
         const inputFile = screen.getByTestId("file"); // Récupère le champ de saisie du fichier
         inputFile.addEventListener("change", handleChangeFile);
         fireEvent.change(inputFile, {
            target: {
               files: [new File(["fileTestPng"], "test.png", { type: "image/png" })],
            },
         }); // Simule le changement de fichier avec un fichier PNG
         await waitFor(() => expect(handleChangeFile).toHaveBeenCalledTimes(1)); // Vérifie que la fonction a été appelée
         await waitFor(() => expect(inputFile.validationMessage).not.toBe("Formats acceptés : jpg, jpeg et png")); // Vérifie que le message d'erreur n'est pas affiché
      });
   });

   // Test suite pour soumettre une facture valide
   describe("When I am on newBill Page and I submit a valid bill", () => {
      test("Then it should render the Bill Page", async () => {
         const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage });

         // Données d'une facture valide
         const validBill = {
            name: "Nouvelle facture",
            date: "2023-03-22",
            type: "Hôtel et logement",
            amount: 150,
            pct: 20,
            vat: "30",
            fileName: "test.png",
            fileUrl: "https://test.png",
         };

         const handleSubmit = jest.fn((e) => newBill.handleSubmit(e)); // Mock la fonction de gestion de la soumission

         // Remplit le formulaire avec les données de la facture valide
         document.querySelector('input[data-testid="expense-name"]').value = validBill.name;
         document.querySelector('input[data-testid="datepicker"]').value = validBill.date;
         document.querySelector('select[data-testid="expense-type"]').value = validBill.type;
         document.querySelector('input[data-testid="amount"]').value = validBill.amount;
         document.querySelector('input[data-testid="vat"]').value = validBill.vat;
         document.querySelector('input[data-testid="pct"]').value = validBill.pct;
         document.querySelector('textarea[data-testid="commentary"]').value = validBill.commentary;
         newBill.fileUrl = validBill.fileUrl;
         newBill.fileName = validBill.fileName;

         const submit = screen.getByTestId("form-new-bill"); // Récupère le bouton de soumission du formulaire
         submit.addEventListener("click", handleSubmit);
         userEvent.click(submit); // Simule le clic sur le bouton de soumission
         await waitFor(() => expect(handleSubmit).toHaveBeenCalledTimes(1)); // Vérifie que la fonction de soumission a été appelée

         await waitFor(() => expect(screen.getByText("Mes notes de frais")).toBeTruthy()); // Vérifie que la page des notes de frais est affichée
         const windowIcon = screen.getByTestId("icon-window"); // Récupère l'icône de la fenêtre
         await waitFor(() => expect(windowIcon.classList.contains("active-icon")).toBe(true)); // Vérifie que l'icône de la fenêtre est active
      });
   });
});

// test d'intégration POST
//Ce test d'intégration POST vérifie que :
//- Une facture est correctement créée via l'API mockée.
//- Les erreurs de l'API sont gérées correctement et les messages d'erreur appropriés sont renvoyés.
//- L'environnement de test est correctement configuré et nettoyé avant et après chaque test.
describe("Given I am a user connected as an employee", () => {
   describe("When I am on newBill Page and I have sent the form", () => {
      test("Then it should create a new bill to mock API POST", async () => {
         Object.defineProperty(window, "localStorage", { value: localStorageMock });
         window.localStorage.setItem(
            "user",
            JSON.stringify({
               type: "Employee",
               email: "employee@test.tld",
               status: "connected",
            })
         );
         const root = document.createElement("div");
         root.setAttribute("id", "root");
         document.body.append(root);
         router();
         window.onNavigate(ROUTES_PATH.NewBill);

         const dataCreated = jest.spyOn(mockStore.bills(), "create");
         const bill = {
            name: "Nouvelle facture",
            date: "2023-03-22",
            type: "Hôtel et logement",
            amount: 150,
            pct: 20,
            vat: "30",
            fileName: "test.jpg",
            fileUrl: "https://test.jpg",
            commentary: "Test bill for spying create function",
         };
         const result = await mockStore.bills().create(bill);

         expect(dataCreated).toHaveBeenCalled();
         expect(result).toEqual({ fileUrl: "https://localhost:3456/images/test.jpg", key: "1234" });
      });

      describe("When an error occurs on API", () => {
         beforeEach(() => {
            jest.spyOn(mockStore, "bills");
            Object.defineProperty(window, "localStorage", { value: localStorageMock });
            window.localStorage.setItem(
               "user",
               JSON.stringify({
                  type: "Employee",
                  email: "employee@test.tld",
                  status: "connected",
               })
            );
            const root = document.createElement("div");
            root.setAttribute("id", "root");
            document.body.appendChild(root);
            router();
         });
         afterEach(() => {
            jest.clearAllMocks();
         });

         test("Then sends new bill to the API and fails with 404 message error", async () => {
            const error = new Error("Erreur 404");
            mockStore.bills.mockImplementationOnce(() => {
               return {
                  create: () => {
                     return Promise.reject(new Error("Erreur 404"));
                  },
               };
            });

            window.onNavigate(ROUTES_PATH.NewBill);
            await new Promise(process.nextTick);
            await expect(mockStore.bills().create({})).rejects.toEqual(error);
         });

         test("Then sends new bill to the API and fails with 500 message error", async () => {
            const error = new Error("Erreur 500");
            mockStore.bills.mockImplementationOnce(() => {
               return {
                  create: () => {
                     return Promise.reject(new Error("Erreur 500"));
                  },
               };
            });

            window.onNavigate(ROUTES_PATH.NewBill);
            await new Promise(process.nextTick);
            await expect(mockStore.bills().create({})).rejects.toEqual(error);
         });
      });
   });
});
