import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TowersService } from '../../../services/towers.service';
import { FlatsService } from '../../../services/flats.service';
import { AmenitiesService } from '../../../services/amenities.service';

interface Tower {
  id?: number;
  name: string;
  total_floors: number;
  flats_per_floor: number;
  address: string;
}

interface Flat {
  id?: number;
  flat_no: string;
  floor: number;
  tower: string;
  rent: number;
  available: boolean;
  amenities?: Amenity[];
}

interface Amenity {
  id: number;
  name: string;
  icon: string;
  is_active: boolean;
}

@Component({
  selector: 'app-admin-units',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-units.html',
  styleUrl: './admin-units.css',
})
export class AdminUnits implements OnInit {
  activeTab: 'towers' | 'flats' = 'towers';

  // Towers
  towers: Tower[] = [];
  showTowerModal = false;
  towerForm: Tower = { name: '', total_floors: 5, flats_per_floor: 10, address: '' };
  editingTowerId: number | null = null;

  // Flats
  flats: Flat[] = [];
  filteredFlats: Flat[] = [];
  showFlatModal = false;
  flatForm: Flat = { flat_no: '', floor: 1, tower: '', rent: 10000, available: true };
  editingFlatId: number | null = null;
  selectedTowerFilter = '';
  selectedFloorFilter = '';
  searchQuery = '';

  // Amenities
  amenities: Amenity[] = [];
  selectedAmenities: number[] = [];

  // State
  loading = false;
  error = '';
  success = '';

  constructor(
    private towersService: TowersService,
    private flatsService: FlatsService,
    private amenitiesService: AmenitiesService
  ) { }

  ngOnInit() {
    this.loadTowers();
    this.loadAmenities();
  }

  // Switch between tabs
  switchTab(tab: 'towers' | 'flats') {
    this.activeTab = tab;
    this.error = '';
    this.success = '';

    if (tab === 'flats' && this.flats.length === 0) {
      this.loadFlats();
    }
  }

  // ============ TOWERS ============
  loadTowers() {
    this.loading = true;
    this.towersService.getAll().subscribe({
      next: (data) => {
        this.towers = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load towers';
        this.loading = false;
      }
    });
  }

  openTowerModal(tower?: Tower) {
    if (tower && tower.id) {
      this.editingTowerId = tower.id;
      this.towerForm = { ...tower };
    } else {
      this.editingTowerId = null;
      this.towerForm = { name: '', total_floors: 5, flats_per_floor: 10, address: '' };
    }
    this.showTowerModal = true;
  }

  closeTowerModal() {
    this.showTowerModal = false;
    this.editingTowerId = null;
    this.error = '';
  }

  saveTower() {
    this.loading = true;
    this.error = '';

    const operation = this.editingTowerId
      ? this.towersService.update(this.editingTowerId, this.towerForm)
      : this.towersService.create(this.towerForm);

    operation.subscribe({
      next: () => {
        this.success = this.editingTowerId ? 'Tower updated!' : 'Tower created!';
        this.loadTowers();
        this.closeTowerModal();
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        this.error = err.error?.error || 'Failed to save tower';
        this.loading = false;
      }
    });
  }

  deleteTower(id: number, name: string) {
    if (!confirm(`Delete ${name}? This will remove all associated flats.`)) {
      return;
    }

    this.loading = true;
    this.towersService.delete(id).subscribe({
      next: () => {
        this.success = 'Tower deleted!';
        this.loadTowers();
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        this.error = err.error?.error || 'Failed to delete tower';
        this.loading = false;
      }
    });
  }

  // ============ FLATS ============
  loadFlats() {
    console.log('🔵 loadFlats() called');
    this.loading = true;
    this.flatsService.getAll().subscribe({
      next: (data) => {
        console.log('✅ Flats loaded:', data);
        console.log('✅ Number of flats:', data.length);
        this.flats = data;
        this.filterFlats();
        console.log('✅ Filtered flats:', this.filteredFlats.length);
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Error loading flats:', err);
        this.error = 'Failed to load flats';
        this.loading = false;
      }
    });
  }

  filterFlats() {
    this.filteredFlats = this.flats.filter(flat => {
      const matchesTower = !this.selectedTowerFilter || flat.tower === this.selectedTowerFilter;
      const matchesFloor = !this.selectedFloorFilter || flat.floor.toString() === this.selectedFloorFilter;
      const matchesSearch = !this.searchQuery ||
        flat.flat_no.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchesTower && matchesFloor && matchesSearch;
    });
  }

  openFlatModal(flat?: Flat) {
    if (flat && flat.id) {
      this.editingFlatId = flat.id;
      this.flatForm = { ...flat };
      // Set selected amenities if editing
      this.selectedAmenities = flat.amenities?.map(a => a.id) || [];
    } else {
      this.editingFlatId = null;
      this.flatForm = { flat_no: '', floor: 1, tower: '', rent: 10000, available: true };
      this.selectedAmenities = [];
    }
    this.showFlatModal = true;
  }

  closeFlatModal() {
    this.showFlatModal = false;
    this.editingFlatId = null;
    this.selectedAmenities = [];
    this.error = '';
  }

  saveFlat() {
    this.loading = true;
    this.error = '';

    // Add amenities to flat form
    const flatData = {
      ...this.flatForm,
      amenity_ids: this.selectedAmenities
    };

    const operation = this.editingFlatId
      ? this.flatsService.update(this.editingFlatId, flatData)
      : this.flatsService.create(flatData);

    operation.subscribe({
      next: () => {
        this.success = this.editingFlatId ? 'Flat updated!' : 'Flat created!';
        this.loadFlats();
        this.closeFlatModal();
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        this.error = err.error?.error || 'Failed to save flat';
        this.loading = false;
      }
    });
  }

  deleteFlat(id: number, flatNo: string) {
    if (!confirm(`Delete Flat ${flatNo}?`)) {
      return;
    }

    this.loading = true;
    this.flatsService.delete(id).subscribe({
      next: () => {
        this.success = 'Flat deleted!';
        this.loadFlats();
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        this.error = err.error?.error || 'Failed to delete flat';
        this.loading = false;
      }
    });
  }

  toggleAmenity(amenityId: number) {
    const index = this.selectedAmenities.indexOf(amenityId);
    if (index > -1) {
      this.selectedAmenities.splice(index, 1);
    } else {
      this.selectedAmenities.push(amenityId);
    }
  }

  isAmenitySelected(amenityId: number): boolean {
    return this.selectedAmenities.includes(amenityId);
  }

  // ============ AMENITIES ============
  loadAmenities() {
    this.amenitiesService.getAll().subscribe({
      next: (data) => {
        this.amenities = data.filter(a => a.is_active);
      },
      error: () => {
        console.error('Failed to load amenities');
      }
    });
  }

  // Get unique floors for filter
  get uniqueFloors(): number[] {
    return [...new Set(this.flats.map(f => f.floor))].sort((a, b) => a - b);
  }

  // Get unique towers for filter
  get uniqueTowers(): string[] {
    return [...new Set(this.flats.map(f => f.tower))].sort();
  }
}
