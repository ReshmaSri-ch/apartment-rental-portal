import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService } from '../../../services/dashboard.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  providers: [DashboardService]
})

export class Dashboard implements OnInit {

  stats = [
    { label: 'Total Towers', value: 0 },
    { label: 'Total Flats', value: 0 },
    { label: 'Pending Bookings', value: 0 },
    { label: 'Occupied Flats', value: 0 }
  ];

  loading = true;
  error = '';

  constructor(
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.loading = true;
    console.log('Loading stats...');
    this.dashboardService.getStats().subscribe({
      next: (data) => {
        console.log('Stats received:', data);
        this.stats = [
          { label: 'Total Towers', value: data.total_towers },
          { label: 'Total Flats', value: data.total_flats },
          { label: 'Pending Bookings', value: data.pending_bookings },
          { label: 'Occupied Flats', value: data.occupied_flats }
        ];
        this.loading = false;
        this.cdr.detectChanges(); // Force UI update
      },
      error: (err) => {
        console.error('Error loading dashboard stats:', err);
        this.error = 'Failed to load dashboard statistics';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
