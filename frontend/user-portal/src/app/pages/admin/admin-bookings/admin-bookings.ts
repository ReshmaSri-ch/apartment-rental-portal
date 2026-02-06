import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService } from '../../../services/booking.service';

@Component({
  selector: 'app-admin-bookings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-bookings.html'
})
export class AdminBookings implements OnInit {

  bookings: any[] = [];   // 👈 IMPORTANT: backend-safe
  loading = true;

  constructor(
    private bookingService: BookingService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;

    this.bookingService.getAdminBookings().subscribe({
      next: (data) => {
        console.log('✅ Admin bookings response:', data);

        this.bookings = data || [];
        this.loading = false;

        // 🔁 Force UI refresh (safe, optional)
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Admin bookings error:', err);
        alert('Failed to load bookings');

        this.bookings = [];
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  approve(id: number) {
  this.bookingService.approveBooking(id).subscribe({
    next: () => this.load(),
    error: () => alert('Approve failed')
  });
}

reject(id: number) {
  this.bookingService.rejectBooking(id).subscribe({
    next: () => this.load(),
    error: () => alert('Reject failed')
  });
}

}

