import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingService, Flat } from '../../services/booking.service';
import { TowersService } from '../../services/towers.service';

@Component({
  selector: 'app-flats',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './flats.html'
})
export class Flats implements OnInit {

  floors = [1, 2, 3, 4, 5];
  selectedFloor!: number;

  towers: any[] = [];
  selectedTower: string = '';

  flats: Flat[] = [];
  loadingFlatId: number | null = null;

  constructor(
    private bookingService: BookingService,
    private towersService: TowersService
  ) { }

  ngOnInit() {
    this.towersService.getAll().subscribe(data => {
      // Map 'Tower A' to value 'A', etc.
      this.towers = data.map(t => ({
        name: t.name,
        value: t.name.replace('Tower ', '')
      }));
    });
  }

  loadFlats() {
    if (!this.selectedFloor || !this.selectedTower) {
      this.flats = []; // Clear flats if selection incomplete
      return;
    }

    this.bookingService.getFlatsByFloor(this.selectedFloor).subscribe(
      data => {
        // Filter flats by selected tower
        this.flats = data.filter(f => f.tower === this.selectedTower);
      }
    );
  }

  requestBooking(flat: Flat) {
    this.loadingFlatId = flat.id;

    this.bookingService.createBooking(flat.id).subscribe({
      next: () => {
        flat.requestStatus = 'Requested';
        this.loadingFlatId = null;
      },
      error: () => {
        alert('Booking failed');
        this.loadingFlatId = null;
      }
    });
  }
}
