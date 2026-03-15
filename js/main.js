/*
  ============================================================
  FICHIER JAVASCRIPT PRINCIPAL — main.js
  ============================================================

  JavaScript (JS) ajoute de l'INTERACTIVITÉ à la page.
  HTML = structure, CSS = apparence, JS = comportement.

  CE QUE CE FICHIER FAIT :
  1. Gère la navbar (défilement, menu burger mobile)
  2. Gère le formulaire de commentaires (validation, envoi)
  3. Stocke les commentaires dans le localStorage
  4. Affiche les commentaires enregistrés au chargement
  5. Met à jour le compteur de caractères et la note en direct

  COMMENT JAVASCRIPT FONCTIONNE ?
  JS manipule le DOM (Document Object Model).
  Le DOM = la représentation de ta page HTML sous forme d'arbre d'objets.
  JS peut lire et modifier chaque élément HTML.

  STRUCTURE D'UNE VARIABLE :
    const maVariable = valeur;    // const : ne peut pas changer
    let   maVariable = valeur;    // let   : peut changer
    var   maVariable = valeur;    // var   : ancienne façon, éviter

  STRUCTURE D'UNE FONCTION :
    function nomFonction(paramètre1, paramètre2) {
      // code à exécuter
      return résultat;
    }
    // Appel : nomFonction(valeur1, valeur2);

  ============================================================
*/

'use strict';
/*
  'use strict' → active le "mode strict" de JavaScript.
  Il interdit certaines pratiques dangereuses et lève des erreurs
  plus claires. Bonne habitude à toujours prendre.
*/


/* ============================================================
   1. SÉLECTION DES ÉLÉMENTS DU DOM
   ============================================================
   document.getElementById('id') → sélectionne un élément par son id
   document.querySelector('.classe') → sélectionne le PREMIER élément
   document.querySelectorAll('.classe') → sélectionne TOUS les éléments

   On les stocke dans des constantes pour ne pas les chercher
   à chaque fois dans le DOM (moins efficace).
*/
const navbar                = document.getElementById('navbar');
const burgerBtn             = document.getElementById('burgerBtn');
const navbarLiens           = document.querySelector('.navbar__liens');
const formulaire            = document.getElementById('formulaireCommentaire');
const champNom              = document.getElementById('champNom');
const champEmail            = document.getElementById('champEmail');
const champMessage          = document.getElementById('champMessage');
const champNote             = document.getElementById('champNote');
const affichageNote         = document.getElementById('affichageNote');
const nbChars               = document.getElementById('nbChars');
const confirmationMessage   = document.getElementById('confirmationMessage');
const listeCommentaires     = document.getElementById('commentairesContainer');
const aucunCommentaire      = document.getElementById('aucunCommentaire');
const btnEffacerTout        = document.getElementById('btnEffacerTout');

/* Messages d'erreur */
const erreurNom     = document.getElementById('erreurNom');
const erreurEmail   = document.getElementById('erreurEmail');
const erreurMessage = document.getElementById('erreurMessage');

/* Clé utilisée pour sauvegarder les commentaires dans localStorage */
const CLE_STOCKAGE = 'siteVitrine_commentaires';
/*
  Pourquoi une constante pour la clé ?
  → Si on veut la changer plus tard, on n'a qu'un seul endroit à modifier.
  → Les "magic strings" (chaînes en dur partout) sont une mauvaise pratique.
*/


/* ============================================================
   2. LOCALSTORAGE — COMMENT ÇA MARCHE ?
   ============================================================
   Le localStorage est un espace de stockage dans le navigateur.
   Il persiste même si on ferme et rouvre le navigateur.

   MÉTHODES :
   • localStorage.setItem('clé', valeur)  → sauvegarde
   • localStorage.getItem('clé')          → récupère (retourne null si absent)
   • localStorage.removeItem('clé')       → supprime une entrée
   • localStorage.clear()                 → vide tout le localStorage

   IMPORTANT : localStorage ne stocke que des CHAÎNES DE CARACTÈRES (strings).
   Pour stocker un tableau ou un objet, on doit le convertir :
   • Objet → String : JSON.stringify(monObjet)
   • String → Objet : JSON.parse(maChaine)
*/

/**
 * Récupère les commentaires depuis le localStorage.
 * @returns {Array} Un tableau de commentaires (vide si aucun).
 *
 * Les /** ... * / = JSDoc : documentation des fonctions.
 * @returns décrit ce que la fonction retourne.
 * @param  décrit les paramètres attendus.
 */
function lireCommentaires() {
  /* localStorage.getItem retourne null si la clé n'existe pas */
  const donnees = localStorage.getItem(CLE_STOCKAGE);

  if (donnees === null) {
    /* Aucun commentaire sauvegardé : on retourne un tableau vide */
    return [];
  }

  /*
    JSON.parse convertit la chaîne JSON en tableau JavaScript.
    JSON = JavaScript Object Notation, format d'échange de données.
    Exemple : '[{"nom":"Alice","message":"Bravo!"}]'  → tableau JS
  */
  return JSON.parse(donnees);
}

/**
 * Sauvegarde un tableau de commentaires dans le localStorage.
 * @param {Array} commentaires - Le tableau à sauvegarder.
 */
function sauvegarderCommentaires(commentaires) {
  /*
    JSON.stringify convertit le tableau en chaîne JSON.
    Le 2ème argument (null) et 3ème (2) → indentation pour lisibilité.
    Sans ça : '[{"nom":"Alice"}]'
    Avec ça :
    [
      {
        "nom": "Alice"
      }
    ]
  */
  const chaine = JSON.stringify(commentaires, null, 2);
  localStorage.setItem(CLE_STOCKAGE, chaine);
}


/* ============================================================
   3. AFFICHAGE DES COMMENTAIRES
   ============================================================
*/

/**
 * Crée et affiche toutes les cartes de commentaires dans la liste.
 */
function afficherCommentaires() {
  const commentaires = lireCommentaires();

  /* Vide d'abord le conteneur pour éviter les doublons */
  listeCommentaires.innerHTML = '';
  /*
    innerHTML = contenu HTML d'un élément sous forme de chaîne.
    En lui assignant '', on supprime tout son contenu.
    ATTENTION : n'utilise pas innerHTML avec du texte fourni par
    l'utilisateur sans nettoyer (risque XSS).
  */

  if (commentaires.length === 0) {
    /* Aucun commentaire : affiche le message vide, cache le bouton effacer */
    aucunCommentaire.style.display = 'block';
    btnEffacerTout.style.display = 'none';
    return; /* Sortie anticipée de la fonction */
  }

  /* Il y a des commentaires : cache le message vide, affiche le bouton */
  aucunCommentaire.style.display = 'none';
  btnEffacerTout.style.display = 'block';

  /*
    On parcourt le tableau avec forEach.
    forEach applique une fonction à CHAQUE élément du tableau.
    commentaire → l'élément courant
    index → son numéro (0, 1, 2...)
  */
  commentaires.forEach(function(commentaire, index) {
    /* Crée la carte HTML pour ce commentaire */
    const carteHTML = creerCarteCommentaire(commentaire, index);

    /*
      insertAdjacentHTML ajoute du HTML sans effacer l'existant.
      'beforeend' → ajoute à la fin du conteneur.
      Autres positions : 'beforebegin', 'afterbegin', 'afterend'
    */
    listeCommentaires.insertAdjacentHTML('beforeend', carteHTML);
  });
}

/**
 * Crée le HTML d'une carte de commentaire.
 * @param {Object} commentaire - L'objet commentaire { nom, email, note, message, date }
 * @param {number} index - L'index dans le tableau (pour la suppression)
 * @returns {string} La chaîne HTML de la carte.
 */
function creerCarteCommentaire(commentaire, index) {
  /* Convertit la note en étoiles (⭐) */
  const etoiles = '⭐'.repeat(commentaire.note);

  /*
    Template literals (template strings) :
    On utilise les backticks ` ` au lieu des guillemets.
    ${variable} → insère la valeur de la variable dans la chaîne.
    Permet d'écrire du HTML multi-lignes proprement.
  */
  return `
    <article class="carte-commentaire" data-index="${index}">
      <div class="carte-commentaire__entete">
        <span class="carte-commentaire__auteur">
          ${echapper(commentaire.nom)}
        </span>
        <div class="carte-commentaire__meta">
          <span class="carte-commentaire__note" title="${commentaire.note}/5 étoiles">
            ${etoiles}
          </span>
          <span class="carte-commentaire__date">${commentaire.date}</span>
          <button
            class="bouton bouton--petit bouton--danger"
            onclick="supprimerCommentaire(${index})"
            title="Supprimer ce commentaire"
            aria-label="Supprimer le commentaire de ${echapper(commentaire.nom)}"
          >
            ✕
          </button>
        </div>
      </div>
      <p class="carte-commentaire__texte">${echapper(commentaire.message)}</p>
    </article>
  `;
}

/**
 * Échappe les caractères HTML dangereux pour prévenir les attaques XSS.
 *
 * XSS (Cross-Site Scripting) = une attaque où quelqu'un injecte du
 * JavaScript malveillant via un formulaire.
 * Ex : si quelqu'un écrit "<script>alert('hacké!')</script>" dans ton champ,
 * sans protection, ce code s'exécuterait !
 * La fonction ci-dessous le convertit en texte inoffensif.
 *
 * @param {string} texte - Le texte à sécuriser.
 * @returns {string} Le texte avec les caractères dangereux convertis.
 */
function echapper(texte) {
  const div = document.createElement('div');
  /*
    On crée un élément <div> temporaire (non inséré dans la page).
    En assignant à .textContent (pas .innerHTML), le navigateur
    traite le texte comme du texte brut, pas comme du HTML.
    Puis on lit .innerHTML pour récupérer la version "échappée".
  */
  div.textContent = String(texte);
  return div.innerHTML;
}


/* ============================================================
   4. SUPPRESSION D'UN COMMENTAIRE
   ============================================================
*/

/**
 * Supprime un commentaire selon son index dans le tableau.
 * Appelé depuis le bouton ✕ de chaque carte.
 * @param {number} index - L'index du commentaire à supprimer.
 */
function supprimerCommentaire(index) {
  /*
    window.confirm() affiche une boîte de dialogue de confirmation.
    Retourne true (Confirmer) ou false (Annuler).
  */
  const confirmation = window.confirm('Voulez-vous vraiment supprimer ce commentaire ?');

  if (!confirmation) {
    return; /* L'utilisateur a annulé */
  }

  const commentaires = lireCommentaires();

  /*
    splice(index, nbÀSupprimer) :
    Modifie le tableau en place en supprimant nbÀSupprimer éléments
    à partir de la position index.
  */
  commentaires.splice(index, 1);

  sauvegarderCommentaires(commentaires);
  afficherCommentaires(); /* Rafraîchit l'affichage */
}

/*
  On rend la fonction accessible globalement car elle est appelée
  depuis un attribut HTML onclick="supprimerCommentaire(index)".
  Sans ça, elle serait encapsulée dans le module et inaccessible.
*/
window.supprimerCommentaire = supprimerCommentaire;


/* ============================================================
   5. VALIDATION DU FORMULAIRE
   ============================================================
   On valide AVANT d'enregistrer. La validation peut se faire
   côté navigateur (HTML5 : required, minlength...) ou en JS.
   On fait les deux pour plus de robustesse.
*/

/**
 * Valide le champ Nom.
 * @returns {boolean} true si valide, false sinon.
 */
function validerNom() {
  const valeur = champNom.value.trim();
  /* .trim() supprime les espaces au début et à la fin */

  if (valeur === '') {
    afficherErreur(champNom, erreurNom, 'Le nom est obligatoire.');
    return false;
  }

  if (valeur.length < 2) {
    afficherErreur(champNom, erreurNom, 'Le nom doit contenir au moins 2 caractères.');
    return false;
  }

  if (valeur.length > 50) {
    afficherErreur(champNom, erreurNom, 'Le nom ne peut pas dépasser 50 caractères.');
    return false;
  }

  /* Tout est bon ! */
  effacerErreur(champNom, erreurNom);
  return true;
}

/**
 * Valide le champ Email (facultatif mais doit être valide si rempli).
 * @returns {boolean} true si valide, false sinon.
 */
function validerEmail() {
  const valeur = champEmail.value.trim();

  /* Si vide → c'est facultatif, donc ok */
  if (valeur === '') {
    effacerErreur(champEmail, erreurEmail);
    return true;
  }

  /*
    Regex (expression régulière) pour valider un email.
    Une regex est un motif de recherche dans une chaîne.
    .test(valeur) retourne true si valeur correspond au motif.

    Ce motif vérifie :
    - [^\s@]+  → au moins 1 caractère (pas espace, pas @)
    - @        → le symbole @
    - [^\s@]+  → au moins 1 caractère
    - \.       → un point (le \ est nécessaire car . seul = "n'importe quel caractère")
    - [^\s@]+  → au moins 1 caractère
  */
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!regexEmail.test(valeur)) {
    afficherErreur(champEmail, erreurEmail, 'Veuillez entrer un email valide (ex: nom@domaine.fr).');
    return false;
  }

  effacerErreur(champEmail, erreurEmail);
  return true;
}

/**
 * Valide le champ Message.
 * @returns {boolean} true si valide, false sinon.
 */
function validerMessage() {
  const valeur = champMessage.value.trim();

  if (valeur === '') {
    afficherErreur(champMessage, erreurMessage, 'Le message est obligatoire.');
    return false;
  }

  if (valeur.length < 10) {
    afficherErreur(champMessage, erreurMessage, `Message trop court (${valeur.length}/10 min).`);
    return false;
  }

  if (valeur.length > 500) {
    afficherErreur(champMessage, erreurMessage, 'Le message ne peut pas dépasser 500 caractères.');
    return false;
  }

  effacerErreur(champMessage, erreurMessage);
  return true;
}

/**
 * Affiche un message d'erreur sous un champ.
 * @param {HTMLElement} champ - L'input/textarea à marquer invalide.
 * @param {HTMLElement} zoneErreur - L'élément où afficher l'erreur.
 * @param {string} message - Le message d'erreur.
 */
function afficherErreur(champ, zoneErreur, message) {
  zoneErreur.textContent = message;
  /*
    classList permet de manipuler les classes CSS d'un élément.
    .add('classe')    → ajoute la classe
    .remove('classe') → supprime la classe
    .toggle('classe') → ajoute si absente, supprime si présente
    .contains('classe') → retourne true/false
  */
  champ.classList.add('invalide');
  champ.classList.remove('valide');
}

/**
 * Efface le message d'erreur et marque le champ comme valide.
 * @param {HTMLElement} champ - Le champ à marquer valide.
 * @param {HTMLElement} zoneErreur - La zone d'erreur à vider.
 */
function effacerErreur(champ, zoneErreur) {
  zoneErreur.textContent = '';
  champ.classList.remove('invalide');
  champ.classList.add('valide');
}


/* ============================================================
   6. GESTIONNAIRES D'ÉVÉNEMENTS (EVENT LISTENERS)
   ============================================================
   addEventListener(événement, fonctionCallback) :
   Écoute un événement et exécute une fonction quand il se produit.

   Événements courants :
   • 'click'    → clic souris
   • 'input'    → texte saisi dans un champ (en temps réel)
   • 'change'   → valeur d'un champ modifiée
   • 'submit'   → formulaire soumis
   • 'keydown'  → touche pressée
   • 'scroll'   → défilement de la page
   • 'resize'   → redimensionnement fenêtre
   • 'load'     → page entièrement chargée
*/

/* ---- Validation en temps réel (au fur et à mesure de la saisie) ---- */

champNom.addEventListener('input', validerNom);
/*
  L'événement 'input' se déclenche à chaque frappe de touche.
  Ici, on valide le champ nom à chaque modification.
*/

champEmail.addEventListener('input', validerEmail);

champMessage.addEventListener('input', function() {
  validerMessage();

  /* Met à jour le compteur de caractères */
  const longueur = champMessage.value.length;
  nbChars.textContent = longueur;

  /* Change la couleur du compteur si on approche de la limite */
  if (longueur > 450) {
    nbChars.style.color = 'var(--couleur-danger)';
    nbChars.style.fontWeight = 'bold';
  } else if (longueur > 400) {
    nbChars.style.color = 'var(--couleur-avertissement)';
    nbChars.style.fontWeight = 'normal';
  } else {
    nbChars.style.color = '';  /* Remet la couleur par défaut */
    nbChars.style.fontWeight = 'normal';
  }
});

/* ---- Mise à jour de la note en temps réel ---- */
champNote.addEventListener('input', function() {
  /*
    this.value → la valeur actuelle du curseur (1 à 5).
    parseInt() convertit la chaîne en nombre entier.
  */
  const note = parseInt(this.value);
  affichageNote.textContent = '⭐'.repeat(note);
  /*
    String.repeat(n) → répète la chaîne n fois.
    '⭐'.repeat(3) → '⭐⭐⭐'
  */
});


/* ---- Soumission du formulaire ---- */
formulaire.addEventListener('submit', function(evenement) {
  /*
    evenement.preventDefault() → empêche le comportement par défaut.
    Par défaut, soumettre un formulaire recharge la page (comportement HTML).
    On empêche ça pour gérer la soumission avec notre JavaScript.
  */
  evenement.preventDefault();

  /* Valide tous les champs */
  const nomValide     = validerNom();
  const emailValide   = validerEmail();
  const messageValide = validerMessage();

  /* Si un seul champ est invalide, on arrête */
  if (!nomValide || !emailValide || !messageValide) {
    /* Focus sur le premier champ invalide pour l'accessibilité */
    if (!nomValide) champNom.focus();
    else if (!emailValide) champEmail.focus();
    else champMessage.focus();
    return;
  }

  /* ---- Tout est valide : on crée et enregistre le commentaire ---- */

  /*
    new Date() → crée un objet Date représentant la date/heure actuelle.
    .toLocaleDateString('fr-FR') → formate en français (ex: "15/03/2024")
  */
  const maintenant = new Date();
  const dateFormatee = maintenant.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',    /* Mois en toutes lettres */
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  /* Objet représentant le commentaire */
  const nouveauCommentaire = {
    nom:     champNom.value.trim(),
    email:   champEmail.value.trim(),
    note:    parseInt(champNote.value),
    message: champMessage.value.trim(),
    date:    dateFormatee,
    id:      Date.now()  /* Identifiant unique basé sur le timestamp en ms */
  };

  /* Récupère les commentaires existants et ajoute le nouveau */
  const commentaires = lireCommentaires();
  commentaires.unshift(nouveauCommentaire);
  /*
    unshift() ajoute un élément AU DÉBUT du tableau (le plus récent en premier).
    push() ajouterait à la FIN.
  */

  sauvegarderCommentaires(commentaires);
  afficherCommentaires();

  /* Réinitialise le formulaire */
  formulaire.reset();
  /*
    .reset() remet tous les champs à leur valeur initiale.
    On remet aussi manuellement les états visuels.
  */

  /* Remet les indicateurs visuels des champs à zéro */
  [champNom, champEmail, champMessage].forEach(function(champ) {
    champ.classList.remove('valide', 'invalide');
  });
  nbChars.textContent = '0';
  nbChars.style.color = '';
  affichageNote.textContent = '⭐⭐⭐'; /* Note à 3 par défaut */

  /* Affiche le message de confirmation */
  confirmationMessage.classList.add('visible');

  /* Cache la confirmation après 5 secondes */
  setTimeout(function() {
    confirmationMessage.classList.remove('visible');
    /*
      setTimeout(fonction, délaiEnMs) → exécute la fonction après un délai.
      5000ms = 5 secondes.
    */
  }, 5000);

  /* Fait défiler vers la liste des commentaires */
  document.getElementById('listeCommentaires').scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });
});


/* ---- Bouton "Effacer tous les commentaires" ---- */
btnEffacerTout.addEventListener('click', function() {
  const confirmation = window.confirm(
    '⚠️ Voulez-vous vraiment supprimer TOUS les commentaires ?\nCette action est irréversible.'
  );

  if (confirmation) {
    localStorage.removeItem(CLE_STOCKAGE);
    afficherCommentaires();
  }
});


/* ============================================================
   7. NAVBAR : DÉFILEMENT ET MENU BURGER
   ============================================================
*/

/* ---- Effet de la navbar au défilement ---- */
window.addEventListener('scroll', function() {
  /*
    window.scrollY → nombre de pixels défilés depuis le haut.
    On change l'apparence de la navbar dès qu'on a défilé de 50px.
  */
  if (window.scrollY > 50) {
    navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
  } else {
    navbar.style.boxShadow = '';
  }

  /* Met en évidence le lien de navigation de la section visible */
  mettreAJourLienActif();
});

/**
 * Détecte la section actuellement visible et met en évidence
 * le lien de navigation correspondant.
 */
function mettreAJourLienActif() {
  /*
    querySelectorAll retourne une NodeList (pas un vrai tableau).
    Array.from() la convertit en tableau pour utiliser les méthodes (forEach etc.)
  */
  const sections = Array.from(document.querySelectorAll('section[id]'));
  const liens = Array.from(document.querySelectorAll('.navbar__liens a'));

  let sectionCourante = '';

  sections.forEach(function(section) {
    /*
      getBoundingClientRect() retourne la position de l'élément
      par rapport à la fenêtre (viewport).
      .top → distance depuis le haut de la fenêtre.
    */
    const rect = section.getBoundingClientRect();

    if (rect.top <= 100 && rect.bottom >= 100) {
      sectionCourante = section.id;
    }
  });

  liens.forEach(function(lien) {
    lien.classList.remove('actif');
    /*
      getAttribute('href') récupère la valeur de l'attribut href.
      On compare avec '#' + sectionCourante.
    */
    if (lien.getAttribute('href') === '#' + sectionCourante) {
      lien.classList.add('actif');
    }
  });
}

/* ---- Menu burger mobile ---- */
burgerBtn.addEventListener('click', function() {
  /*
    toggle() → ajoute la classe si absente, la supprime si présente.
    C'est parfait pour un bouton marche/arrêt (toggle = bascule).
  */
  navbarLiens.classList.toggle('ouvert');

  /* Met à jour l'attribut aria pour l'accessibilité */
  const estOuvert = navbarLiens.classList.contains('ouvert');
  burgerBtn.setAttribute('aria-expanded', estOuvert);
  burgerBtn.textContent = estOuvert ? '✕' : '☰';
  /*
    L'opérateur ternaire : condition ? valeurSiVrai : valeurSiFaux
    Équivalent à un if/else en une ligne.
  */
});

/* Ferme le menu burger quand on clique sur un lien */
navbarLiens.querySelectorAll('a').forEach(function(lien) {
  lien.addEventListener('click', function() {
    navbarLiens.classList.remove('ouvert');
    burgerBtn.textContent = '☰';
    burgerBtn.setAttribute('aria-expanded', false);
  });
});

/* Ferme le menu burger si on clique en dehors */
document.addEventListener('click', function(evenement) {
  /*
    evenement.target → l'élément sur lequel l'utilisateur a cliqué.
    .closest('.navbar') → cherche le parent le plus proche qui correspond.
    Si le clic n'est pas dans la navbar → ferme le menu.
  */
  if (!evenement.target.closest('.navbar')) {
    navbarLiens.classList.remove('ouvert');
    burgerBtn.textContent = '☰';
    burgerBtn.setAttribute('aria-expanded', false);
  }
});


/* ============================================================
   8. ANIMATIONS D'ENTRÉE AU DÉFILEMENT (SCROLL ANIMATIONS)
   ============================================================
   On ajoute une classe "visible" aux éléments quand ils entrent
   dans le champ de vision. Le CSS gère l'animation.

   On utilise l'IntersectionObserver, une API moderne du navigateur.
   Elle observe quand un élément devient visible dans la fenêtre.
*/

/*
  Options de l'observateur :
  threshold: 0.15 → déclenche quand 15% de l'élément est visible
  rootMargin → marge autour de la zone d'observation
*/
const optionsObservateur = {
  threshold: 0.15,
  rootMargin: '0px 0px -50px 0px'
};

const observateur = new IntersectionObserver(function(entrees) {
  /*
    entrees = tableau d'objets, un par élément observé.
    Chaque entrée a :
    - .target → l'élément HTML
    - .isIntersecting → true si l'élément est visible
  */
  entrees.forEach(function(entree) {
    if (entree.isIntersecting) {
      entree.target.classList.add('animate-in');
      /*
        Une fois animé, on arrête d'observer l'élément.
        Économise des ressources.
      */
      observateur.unobserve(entree.target);
    }
  });
}, optionsObservateur);

/* Observe les cartes de projets et les groupes de compétences */
document.querySelectorAll('.carte-projet, .competences__groupe, .carte-commentaire').forEach(function(el) {
  observateur.observe(el);
});


/* ============================================================
   9. INITIALISATION AU CHARGEMENT DE LA PAGE
   ============================================================
   Ce code s'exécute quand la page est prête.
*/

/*
  DOMContentLoaded → déclenché quand le HTML est parsé et le DOM prêt.
  C'est différent de 'load' qui attend aussi les images/styles.
  Ici ça n'est pas strictement nécessaire car notre script est en bas
  du <body>, mais c'est une bonne pratique.
*/
document.addEventListener('DOMContentLoaded', function() {

  /* Affiche les commentaires sauvegardés */
  afficherCommentaires();

  /* Initialise l'indicateur de note */
  affichageNote.textContent = '⭐'.repeat(parseInt(champNote.value));

  console.log('🚀 Site vitrine chargé !');
  console.log(`📝 ${lireCommentaires().length} commentaire(s) en mémoire.`);
  /*
    console.log() → affiche un message dans la console du navigateur.
    Pour voir la console : F12 → onglet "Console".
    Très utile pour déboguer (trouver des erreurs) !
  */
});
