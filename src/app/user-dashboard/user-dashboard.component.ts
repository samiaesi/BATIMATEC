import { Component, OnInit } from '@angular/core';
import { Firestore, collection, getDocs, getDoc, doc, updateDoc } from '@angular/fire/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ReactiveFormsModule, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTableModule } from '@angular/material/table';
import { v4 as uuidv4 } from 'uuid';
import {RouterLink} from '@angular/router'; // Assurez-vous d'installer uuid via npm

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatToolbarModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    MatExpansionModule,
    MatTableModule,
    RouterLink,
  ],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent implements OnInit {
  users: any[] = [];
  displayedColumns: string[] = ['quoteSystem', 'ral', 'width', 'height', 'status', 'action'];
  totalUsers: number = 0;

  // Définir les régions et leurs wilayas
  regions: Map<string, string[]> = new Map([
    // Région 1
    ['Région 1', [
      'Alger', 'Tizi Ouzou', 'Blida', 'Boumerdès', 'Tipaza', 'Aïn Defla', 'Chlef', 'Médéa',
      'Bouira', 'Béjaïa', 'Setif', 'Skikda', 'Jijel', 'Annaba', 'El Tarf', 'Guelma'
    ]],

    // Région 2
    ['Région 2', [
      'Oran', 'Mostaganem', 'Sidi Bel Abbès', 'Mascara', 'Tlemcen', 'Bechar', 'Saïda',
      'Laghouat', 'Tiaret', 'Khenchela', 'El Oued', 'Ghardaïa', 'Biskra', 'M’Sila', 'Batna'
    ]],

    // Région 3
    ['Région 3', [
      'Constantine', 'Skikda', 'Guelma', 'El Oued', 'Sétif', 'Tébessa', 'Tizi Ouzou',
      'Bouira', 'Khenchela', 'Batna', 'M’sila', 'Djelfa', 'Relizane', 'Chlef', 'Béjaïa'
    ]],

    // Région 4
    ['Région 4', [
      'Tlemcen', 'Bechar', 'Béjaïa', 'Tiaret', 'Sidi Bel Abbès', 'Ghardaïa', 'Biskra', 'Khenchela',
      'M’sila', 'Laghouat', 'Tiaret', 'El Tarf', 'Chlef', 'Skikda', 'Tizi Ouzou', 'Alger'
    ]],

    // Add additional wilayas as required in each region
  ]);


  constructor(private firestore: Firestore, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadUsers();
    this.getUserCount();
    console.log(this.getRegionColor('Alger'));
  }

  // Charger les utilisateurs et leurs devis depuis Firestore
  async loadUsers() {
    try {
      const usersCollection = collection(this.firestore, 'users');
      const userSnapshot = await getDocs(usersCollection);

      // Mapper les données des utilisateurs et leurs devis
      this.users = userSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          quotes: Array.isArray(data['quotes']) ? data['quotes'] : []  // Utilisation des crochets pour accéder à 'quotes'
        };
      });
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      this.snackBar.open('Erreur de chargement des utilisateurs', 'Fermer', {
        duration: 3000,
      });
    }
  }

  getRegionColor(city: string): string {
    // Vérifier dans chaque région si la ville appartient à cette région
    for (const [region, cities] of this.regions) {
      if (cities.includes(city)) {
        // Retourner la couleur en fonction de la région
        switch (region) {
          case 'Région 1':
            return '#AEC6CF'; // Pastel Blue
          case 'Région 2':
            return '#B0EACD'; // Pastel Green
          case 'Région 3':
            return '#FFFACD'; // Pastel Yellow (Lemon Chiffon)
          case 'Région 4':
            return '#F7BFBF'; // Pastel Coral
        }
      }
    }
    return 'white'; // Retourner 'white' si la ville ne correspond à aucune région
  }


  async sendQuote(quote: any) {
    try {
      // Vérification et journalisation des informations de quote pour déboguer
      console.log('Devis reçu :', quote);

      // Vérification de la présence des informations du devis
      if (!quote || !quote.userId || !quote.quoteSystem) {
        console.error('Informations manquantes :', quote); // Journalisation de l'objet quote
        throw new Error('Informations du devis incomplètes.');
      }

      // Inverse le statut (Envoyé / Non envoyé)
      quote.hasSent = !quote.hasSent;

      // Assurer que chaque devis a un 'quoteId' unique (si pas déjà présent)
      if (!quote.quoteId) {
        quote.quoteId = uuidv4(); // Génère un identifiant unique pour chaque devis
      }

      const userRef = doc(this.firestore, 'users', quote.userId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        const currentQuotes = data?.['quotes'];

        if (!Array.isArray(currentQuotes)) {
          throw new Error('Aucune liste de devis valide trouvée.');
        }

        // Mise à jour du devis dans la liste en comparant 'quoteId'
        const updatedQuotes = currentQuotes.map((existingQuote: any) => {
          return existingQuote?.quoteId === quote.quoteId
            ? { ...existingQuote, hasSent: quote.hasSent } // Mettez à jour le statut du devis
            : existingQuote;
        });

        // Mettre à jour la collection Firestore avec le nouveau statut du devis
        await updateDoc(userRef, { quotes: updatedQuotes });

        // Affichage d'un message de succès
        this.snackBar.open('Statut du devis mis à jour avec succès', 'Fermer', {
          duration: 3000,
        });
      } else {
        // L'utilisateur n'existe pas
        this.snackBar.open("L'utilisateur n'existe pas", 'Fermer', {
          duration: 3000,
        });
      }
    } catch (error) {
      // Gestion des erreurs
      console.error('Erreur lors de la mise à jour du devis:', error);
      this.snackBar.open('Erreur lors de la mise à jour du devis', 'Fermer', {
        duration: 3000,
      });
    }
  }

  async getUserCount(): Promise<void> {
    try {
      const userRef = collection(this.firestore, 'users'); // Référence à la collection "users"
      const userSnapshot = await getDocs(userRef); // Récupère tous les documents
      this.totalUsers = userSnapshot.size; // Le nombre d'utilisateurs est le nombre de documents
    } catch (error) {
      console.error('Erreur lors de la récupération du nombre d\'utilisateurs:', error);
      this.snackBar.open('Erreur lors de la récupération du nombre d\'utilisateurs', 'Fermer', {
        duration: 3000,
      });
    }
  }
}
