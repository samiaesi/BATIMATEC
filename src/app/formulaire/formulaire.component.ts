import { Component } from '@angular/core';
import {FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {Observable} from 'rxjs';
import {addDoc, collection, Firestore, getDocs, where} from '@angular/fire/firestore';
import {Router, RouterLink, RouterOutlet} from '@angular/router';
import {map, startWith} from 'rxjs/operators';
import {CommonModule} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatOptionModule} from '@angular/material/core';
import {MatAutocomplete, MatAutocompleteTrigger} from '@angular/material/autocomplete';
import {MatToolbar} from '@angular/material/toolbar';
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from '@angular/material/datepicker';
import {query} from '@angular/fire/database';



@Component({
  selector: 'app-formulaire',
  imports: [CommonModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatOptionModule,
    ReactiveFormsModule,
    MatAutocompleteTrigger,
    MatAutocomplete,
    MatToolbar,
    RouterLink, MatDatepickerInput, MatDatepickerToggle, MatDatepicker, FormsModule,],
  templateUrl: './formulaire.component.html',
  styleUrl: './formulaire.component.css'
})
export class FormulaireComponent {
  title = 'Batimatec 2025';
  form: FormGroup;
  selectedDate: Date | null = null;
  filteredUsers: any[] = [];
  cities: string[] = [
    'Alger', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Setif', 'Tlemcen',
    'Batna', 'Béchar', 'Biskra', 'Bouira', 'Boumerdès', 'Chlef', 'Djelfa', 'El Bayadh', 'El Tarf',
    'Ghardaïa', 'Guelma', 'Illizi', 'Jijel', 'Khenchela', 'Laghouat', 'M’sila', 'Mascara',
    'Médéa', 'Mila', 'Mostaganem', 'Naâma', 'Oran', 'Ouargla', 'Oum El Bouaghi', 'Relizane',
    'Saïda', 'Sidi Bel Abbès', 'Skikda', 'Souk Ahras', 'Tamanrasset', 'Tébessa', 'Tiaret',
    'Tizi Ouzou', 'Tindouf', 'Tipaza', 'Tissemsilt', 'Touggourt', 'Tizgin', 'Setif', 'Adrar', 'Bejaia'
  ];

  systemOptions = [
    { key: 'h40', label: 'H40' },
    { key: 'h31', label: 'H31' },
    { key: 'h52', label: 'H52' },
    { key: 'h36', label: 'H36' },
    { key: 'h55', label: 'H55' },
    { key: 'h48T', label: 'H48T' },
    { key: 'h68T', label: 'H68T' },
    { key: 'h92', label: 'H92' },
    { key: 'h75', label: 'H75' },
    { key: 'h56', label: 'H56' },
    { key: 'h21', label: 'H21' },
    { key: 'h125', label: 'H125' },
    { key: 'bioclimatique', label: 'Bioclimatique' }
  ];

  filteredCities: Observable<string[]>;

  constructor(private fb: FormBuilder, private firestore: Firestore , private router: Router) {
    this.form = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      city: ['', [Validators.required]],
      function: ['', [Validators.required]],
      clientType: ['', [Validators.required]],
      systems: this.fb.group({
        h40: [false],
        h31: [false],
        h52: [false],
        h36: [false],
        h55: [false],
        h48T: [false],
        h68T: [false],
        h92: [false],
        h75: [false],
        h56: [false],
        h21: [false],
        h125: [false],
        bioclimatique: [false],
      }),
      comments: ['', [Validators.maxLength(500)]],
      hasQuote: [false],
      quotes: this.fb.array([]),
    });

    this.filteredCities = this.form.get('city')?.valueChanges.pipe(
      startWith(''),
      map(value => this._filterCities(value))
    ) ?? new Observable<string[]>();

    this.form.get('hasQuote')?.valueChanges.subscribe((hasQuote: boolean) => {
      if (!hasQuote) {
        this.clearQuoteFields();
      }
    });
  }



  clearQuoteFields() {
    while (this.quotes.length) {
      this.quotes.removeAt(0); // Supprime toutes les `quotes` du tableau
    }
  }
  private _filterCities(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.cities.filter(city => city.toLowerCase().includes(filterValue));
  }

  get quotes() {
    return this.form.get('quotes') as FormArray;
  }
  addQuote() {
    const quoteGroup = this.fb.group({
      quoteSystem: ['', Validators.required],
      ral: ['', Validators.required],
      width: ['', [Validators.required, Validators.min(1)]],
      height: ['', [Validators.required, Validators.min(1)]],
    });
    this.quotes.push(quoteGroup);
    this.printQuoteErrors(); // Afficher les erreurs pour la nouvelle quote
  }

  printQuoteErrors() {
    this.quotes.controls.forEach((quoteGroup, index) => {
      // Cast to FormGroup to access controls
      const formGroup = quoteGroup as FormGroup;
      if (formGroup.invalid) {
        console.log(`Quote ${index + 1} is invalid`);
        // Parcours des contrôles dans chaque FormGroup
        Object.keys(formGroup.controls).forEach(controlName => {
          const control = formGroup.get(controlName);
          if (control) {
            // Vérifiez si le contrôle est invalide
            if (control.invalid) {
              console.log(`${controlName} in Quote ${index + 1} is invalid: `, control.errors);
            }
          } else {
            console.log(`${controlName} in Quote ${index + 1} is not found.`);
          }
        });
      }
    });
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);  // Navigation vers la route /dashboard
  }

  async submit() {
    console.log('Form validation state: ', this.form.valid); // Vérifier l'état de validation du formulaire
    console.log('Form errors: ', this.form.errors); // Afficher toutes les erreurs du formulaire

    if (this.form.valid) {
      try {

        const formData = {
          ...this.form.value,
       };
        const userRef = collection(this.firestore, 'users');
        await addDoc(userRef, formData);
        console.log('Form submitted successfully');
        this.form.reset();

        // Si tu as des éléments comme les devis dans un tableau dynamique, tu peux également les réinitialiser
        this.quotes.clear(); // S
      } catch (error) {
        console.error('Error submitting form:', error);
      }
    } else {
      this.printQuoteErrors();  // Afficher les erreurs des quotes si le formulaire est invalide
    }
  }

}
