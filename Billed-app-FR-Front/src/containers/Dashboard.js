import { formatDate } from "../app/format.js";
import DashboardFormUI from "../views/DashboardFormUI.js";
import BigBilledIcon from "../assets/svg/big_billed.js";
import { ROUTES_PATH } from "../constants/routes.js";
import USERS_TEST from "../constants/usersTest.js";
import Logout from "./Logout.js";

// Fonction pour filtrer les factures par statut
export const filteredBills = (data, status) => {
  return data && data.length
    ? data.filter((bill) => {
        let selectCondition;

        // En environnement jest
        if (typeof jest !== "undefined") {
          selectCondition = bill.status === status;
        } else {
          /* istanbul ignore next */
          // En environnement de production
          const userEmail = JSON.parse(localStorage.getItem("user")).email;
          selectCondition = bill.status === status && ![...USERS_TEST, userEmail].includes(bill.email);
        }

        return selectCondition;
      })
    : [];
};

// Génère le HTML pour une carte de facture
export const card = (bill) => {
  const firstAndLastNames = bill.email.split("@")[0];
  const firstName = firstAndLastNames.includes(".") ? firstAndLastNames.split(".")[0] : "";
  const lastName = firstAndLastNames.includes(".") ? firstAndLastNames.split(".")[1] : firstAndLastNames;

  return `
    <div class='bill-card' id='open-bill${bill.id}' data-testid='open-bill${bill.id}'>
      <div class='bill-card-name-container'>
        <div class='bill-card-name'> ${firstName} ${lastName} </div>
        <span class='bill-card-grey'> ... </span>
      </div>
      <div class='name-price-container'>
        <span> ${bill.name} </span>
        <span> ${bill.amount} € </span>
      </div>
      <div class='date-type-container'>
        <span> ${formatDate(bill.date)} </span>
        <span> ${bill.type} </span>
      </div>
    </div>
  `;
};

// Génère le HTML pour toutes les cartes de factures
export const cards = (bills) => {
  return bills && bills.length ? bills.map((bill) => card(bill)).join("") : "";
};

// Détermine le statut en fonction de l'index
export const getStatus = (index) => {
  switch (index) {
    case 1:
      return "pending";
    case 2:
      return "accepted";
    case 3:
      return "refused";
  }
};

// Classe principale du Dashboard
export default class Dashboard {
  constructor({ document, onNavigate, store, bills, localStorage }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.store = store;
    this.bills = bills;
    this.counter = {};
    this.id = {};
    $("#arrow-icon1").click((e) => this.handleShowTickets(e, bills, 1));
    $("#arrow-icon2").click((e) => this.handleShowTickets(e, bills, 2));
    $("#arrow-icon3").click((e) => this.handleShowTickets(e, bills, 3));
    new Logout({ localStorage, onNavigate });
  }

  // Fonction pour gérer le clic sur l'icône d'œil
  handleClickIconEye = () => {
    const billUrl = $("#icon-eye-d").attr("data-bill-url");
    const imgWidth = Math.floor($("#modaleFileAdmin1").width() * 0.8);
    $("#modaleFileAdmin1").find(".modal-body").html(`<div style='text-align: center;'><img width=${imgWidth} src=${billUrl} alt="Bill"/></div>`);
    if (typeof $("#modaleFileAdmin1").modal === "function") $("#modaleFileAdmin1").modal("show");
  };

  // Fonction pour gérer l'édition d'un ticket
  handleEditTicket(e, bill, bills) {
    // Initialisation du compteur si nécessaire
    if (this.counter[bill.id] === undefined) this.counter[bill.id] = 0;
    
    if (this.counter[bill.id] % 2 === 0) {
      // Afficher les détails de la facture
      bills.forEach((b) => {
        $(`#open-bill${b.id}`).css({ background: "#0D5AE5" });
      });
      $(`#open-bill${bill.id}`).css({ background: "#2A2B35" });
      $(".dashboard-right-container div").html(DashboardFormUI(bill));
      $(".vertical-navbar").css({ height: "150vh" });
    } else {
      // Afficher l'icône de la grande facture
      $(`#open-bill${bill.id}`).css({ background: "#0D5AE5" });
      $(".dashboard-right-container div").html(`
        <div id="big-billed-icon" data-testid="big-billed-icon"> ${BigBilledIcon} </div>
      `);
      $(".vertical-navbar").css({ height: "120vh" });
    }
    this.counter[bill.id]++;
    $("#icon-eye-d").click(this.handleClickIconEye);
    $("#btn-accept-bill").click((e) => this.handleAcceptSubmit(e, bill));
    $("#btn-refuse-bill").click((e) => this.handleRefuseSubmit(e, bill));
  }

  // Fonction pour gérer la soumission d'une acceptation de facture
  handleAcceptSubmit = (e, bill) => {
    const newBill = {
      ...bill,
      status: "accepted",
      commentAdmin: $("#commentary2").val(),
    };
    this.updateBill(newBill);
    this.onNavigate(ROUTES_PATH["Dashboard"]);
  };

  // Fonction pour gérer la soumission d'un refus de facture
  handleRefuseSubmit = (e, bill) => {
    const newBill = {
      ...bill,
      status: "refused",
      commentAdmin: $("#commentary2").val(),
    };
    this.updateBill(newBill);
    this.onNavigate(ROUTES_PATH["Dashboard"]);
  };

  // Fonction pour afficher ou masquer les tickets en fonction de l'index
  handleShowTickets(e, bills, index) {
    // Initialise le compteur pour l'index donné s'il n'est pas déjà défini
    if (this.counter[index] === undefined) this.counter[index] = 0;
    // Vérifie si le compteur est pair
    if (this.counter[index] % 2 === 0) {
      // Si le compteur est pair, tourne l'icône de flèche vers le bas (0 degrés)
      $(`#arrow-icon${index}`).css({ transform: "rotate(0deg)" });
      $(`#status-bills-container${index}`).html(cards(filteredBills(bills, getStatus(index))));
    } else {
      // Si le compteur est impair, tourne l'icône de flèche vers la droite (90 degrés)
      $(`#arrow-icon${index}`).css({ transform: "rotate(90deg)" });
      $(`#status-bills-container${index}`).html("");
    }
    this.counter[index]++;

    // Ajoute des gestionnaires d'événements de clic pour chaque ticket
    bills.forEach((bill) => {
      $(`#open-bill${bill.id}`)
        .off("click") // Supprime tout gestionnaire de clic existant pour éviter les doublons
        .click((e) => this.handleEditTicket(e, bill, bills)); // Ajoute un nouveau gestionnaire de clic pour éditer le ticket
    });

    return bills;
  }

  // Fonction pour récupérer les factures de tous les utilisateurs
  getBillsAllUsers = () => {
    if (this.store) {
      return this.store
        .bills()
        .list()
        .then((snapshot) => {
          const bills = snapshot.map((doc) => ({
            id: doc.id,
            ...doc,
            date: doc.date,
            status: doc.status,
          }));
          return bills;
        })
        .catch((error) => {
          throw error;
        });
    }
  };

  // Fonction non couverte par les tests
  /* istanbul ignore next */
  updateBill = (bill) => {
    if (this.store) {
      return this.store
        .bills()
        .update({ data: JSON.stringify(bill), selector: bill.id })
        .then((bill) => bill)
        .catch(console.log);
    }
  };
}
