import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AmenitiesService } from '../../../services/amenities.service';

interface Amenity {
  id?: number;
  name: string;
  description: string;
  icon: string;
  is_active: boolean;
}

@Component({
  selector: 'app-admin-amenities',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-amenities.html',
  styleUrl: './admin-amenities.css',
})
export class AdminAmenities implements OnInit {
  amenities: Amenity[] = [];
  filteredAmenities: Amenity[] = [];
  showModal = false;
  amenityForm: Amenity = { name: '', description: '', icon: '', is_active: true };
  editingId: number | null = null;
  searchQuery = '';
  filterStatus: 'all' | 'active' | 'inactive' = 'all';

  loading = false;
  error = '';
  success = '';

  // Common emoji options for quick selection
  emojiOptions = ['🏊', '🏋️', '🅿️', '🌳', '🎪', '🔒', '🛗', '⚡', '🏛️', '🧘', '🏃', '💧', '🎾', '🏓', '🎱', '🏸', '⚽', '🏀', '🎭', '🎨', '📚', '🎮', '🎬', '☕', '🍕'];

  constructor(private amenitiesService: AmenitiesService) { }

  ngOnInit() {
    this.loadAmenities();
  }

  loadAmenities() {
    this.loading = true;
    this.amenitiesService.getAll().subscribe({
      next: (data) => {
        this.amenities = data;
        this.filterAmenities();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading amenities:', err);
        this.error = 'Failed to load amenities';
        this.loading = false;
      }
    });
  }

  filterAmenities() {
    this.filteredAmenities = this.amenities.filter(amenity => {
      // Filter by search query
      const matchesSearch = !this.searchQuery ||
        amenity.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        amenity.description?.toLowerCase().includes(this.searchQuery.toLowerCase());

      // Filter by status
      const matchesStatus = this.filterStatus === 'all' ||
        (this.filterStatus === 'active' && amenity.is_active) ||
        (this.filterStatus === 'inactive' && !amenity.is_active);

      return matchesSearch && matchesStatus;
    });
  }

  openModal(amenity?: Amenity) {
    if (amenity && amenity.id) {
      this.editingId = amenity.id;
      this.amenityForm = { ...amenity };
    } else {
      this.editingId = null;
      this.amenityForm = { name: '', description: '', icon: '', is_active: true };
    }
    this.showModal = true;
    this.error = '';
  }

  closeModal() {
    this.showModal = false;
    this.editingId = null;
    this.error = '';
  }

  saveAmenity() {
    if (!this.amenityForm.name.trim()) {
      this.error = 'Amenity name is required';
      return;
    }

    this.loading = true;
    this.error = '';

    const operation = this.editingId
      ? this.amenitiesService.update(this.editingId, this.amenityForm)
      : this.amenitiesService.create(this.amenityForm);

    operation.subscribe({
      next: () => {
        this.success = this.editingId ? 'Amenity updated!' : 'Amenity created!';
        this.loadAmenities();
        this.closeModal();
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        this.error = err.error?.error || 'Failed to save amenity';
        this.loading = false;
      }
    });
  }

  deleteAmenity(id: number, name: string) {
    if (!confirm(`Delete "${name}"? This will remove it from all flats.`)) {
      return;
    }

    this.loading = true;
    this.amenitiesService.delete(id).subscribe({
      next: () => {
        this.success = 'Amenity deleted!';
        this.loadAmenities();
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        this.error = err.error?.error || 'Failed to delete amenity';
        this.loading = false;
      }
    });
  }

  toggleActive(amenity: Amenity) {
    if (!amenity.id) return;

    const updatedAmenity = { ...amenity, is_active: !amenity.is_active };

    this.amenitiesService.update(amenity.id, updatedAmenity).subscribe({
      next: () => {
        this.success = `Amenity ${updatedAmenity.is_active ? 'activated' : 'deactivated'}!`;
        this.loadAmenities();
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        this.error = err.error?.error || 'Failed to update amenity status';
      }
    });
  }

  selectEmoji(emoji: string) {
    this.amenityForm.icon = emoji;
  }

  get activeCount(): number {
    return this.amenities.filter(a => a.is_active).length;
  }

  get inactiveCount(): number {
    return this.amenities.filter(a => !a.is_active).length;
  }
}
