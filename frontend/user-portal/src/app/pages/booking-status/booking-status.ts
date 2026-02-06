import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BookingService, Booking } from '../../services/booking.service';

@Component({
  selector: 'app-booking-status',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './booking-status.html',
})
export class BookingStatus implements OnInit {

  bookings: Booking[] = [];
  loading = true;

  constructor(
    private bookingService: BookingService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings() {
    this.loading = true;

    this.bookingService.getUserBookings().subscribe({
      next: (data) => {
        this.bookings = data;
        this.loading = false;

        // ✅ Force UI update
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        alert('Failed to load booking status');

        // ✅ Force UI update even on error
        this.cdr.detectChanges();
      }
    });
  }
}
