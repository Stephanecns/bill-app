import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    formNewBill.addEventListener("submit", this.handleSubmit)
    const file = this.document.querySelector(`input[data-testid="file"]`)
    file.addEventListener("change", this.handleChangeFile)
    this.fileUrl = null
    this.fileName = null
    this.billId = null
    new Logout({ document, localStorage, onNavigate })
  }

  handleFileType({ target }) {
    // Récupère le type de fichier du premier fichier sélectionné
    const { type } = target.files[0]
    
    // Réinitialise tout message de validité personnalisé
    target.setCustomValidity("")
    
    // Extrait l'extension du fichier à partir de son type MIME
    const fileExtension = type.split('/').pop();
    
    // Définit une liste des extensions de fichier autorisées
    const allowedExtensions = ['jpg', 'jpeg', 'png']
    
    // Vérifie si l'extension du fichier est dans la liste des extensions autorisées
    const isFileExtensionAllowed = allowedExtensions.includes(fileExtension);
    
    // Si l'extension du fichier n'est pas autorisée
    if (isFileExtensionAllowed === false) {
      // Définit un message de validité personnalisé
      target.setCustomValidity("Formats acceptés : jpg, jpeg et png")
      
      // Affiche le message de validité personnalisé à l'utilisateur
      target.reportValidity()
      
      // Réinitialise la valeur du champ de fichier pour empêcher la soumission
      target.value = null
      
      // Indique que le fichier n'est pas valide
      this.isFileValid = false
      
      // Arrête l'exécution de la fonction et retourne false
      return false
    }
    
    // Si le fichier est valide, indique que le fichier est valide
    this.isFileValid = true
  }
  

  handleChangeFile = e => {
    e.preventDefault()
    const isFileTypeValid = this.handleFileType(e)
    if (isFileTypeValid === false) return
    const filePath = e.target.value.split(/\\/g)
    const fileName = filePath[filePath.length - 1]
    const formData = new FormData()
    const email = JSON.parse(localStorage.getItem("user")).email
    formData.append('file', e.target.files[0])
    formData.append('email', email)
    this.store
      .bills()
      .create({
        data: formData,
        headers: {
          noContentType: true
        }
      })
      .then(({ fileUrl, key }) => {
        this.billId = key
        this.fileUrl = fileUrl
        this.fileName = fileName
      }).catch(error => console.error(error))
  }

  handleSubmit = e => {
    e.preventDefault()
    const email = JSON.parse(localStorage.getItem("user")).email
    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
      name: e.target.querySelector(`input[data-testid="expense-name"]`).value,
      amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
      date: e.target.querySelector(`input[data-testid="datepicker"]`).value,
      vat: e.target.querySelector(`input[data-testid="vat"]`).value,
      pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: 'pending'
    }
    this.updateBill(bill)
    this.onNavigate(ROUTES_PATH['Bills'])
  }

  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
        .bills()
        .update({ data: JSON.stringify(bill), selector: this.billId })
        .then(() => {
          this.onNavigate(ROUTES_PATH['Bills'])
        })
        .catch(error => console.error(error))
    }
  }
}
