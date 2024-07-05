import VerticalLayout from './VerticalLayout.js'
import ErrorPage from "./ErrorPage.js"
import LoadingPage from "./LoadingPage.js"
import Actions from './Actions.js'

// Fonction pour créer une ligne de tableau pour chaque facture
const row = (bill) => {
  return (`
    <tr>
      <td>${bill.type}</td>
      <td>${bill.name}</td>
      <td>${bill.formatedDate || bill.date}</td> <!-- Utilise la date formatée si disponible, sinon la date brute -->
      <td>${bill.amount} €</td>
      <td>${bill.status}</td>
      <td>
        ${Actions(bill.fileUrl)} <!-- Actions (icône pour voir le justificatif) -->
      </td>
    </tr>
    `)
}

// Fonction pour créer toutes les lignes du tableau
const rows = (data) => {
  return (data && data.length)
    ? [...data]
        .sort((a, b) => new Date(b.date) - new Date(a.date)) // Tri par date décroissante
        .map(bill => row(bill)) // Crée une ligne pour chaque facture
        .join("") // Joins toutes les lignes en une seule chaîne de caractères
    : ""
}

// Fonction principale pour afficher la page des notes de frais
export default ({ data: bills, loading, error }) => {
  // Fonction pour créer la modale (fenêtre modale) pour afficher le justificatif
  const modal = () => (`
    <div class="modal fade" id="modaleFile" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLongTitle">Justificatif</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
          </div>
        </div>
      </div>
    </div>
  `)

  // Affiche la page de chargement si les données sont en cours de chargement
  if (loading) {
    return LoadingPage()
  } 
  // Affiche la page d'erreur s'il y a une erreur
  else if (error) {
    return ErrorPage(error)
  }

  // Retourne le contenu principal de la page
  return (`
    <div class='layout'>
      ${VerticalLayout(120)}
      <div class='content'>
        <div class='content-header'>
          <div class='content-title'> Mes notes de frais </div>
          <button type="button" data-testid='btn-new-bill' class="btn btn-primary">Nouvelle note de frais</button>
        </div>
        <div id="data-table">
          <table id="example" class="table table-striped" style="width:100%">
            <thead>
              <tr>
                <th>Type</th>
                <th>Nom</th>
                <th>Date</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody data-testid="tbody">
              ${rows(bills)} <!-- Insère les lignes du tableau -->
            </tbody>
          </table>
        </div>
      </div>
      ${modal()} <!-- Insère la modale pour les justificatifs -->
    </div>`
  )
}
