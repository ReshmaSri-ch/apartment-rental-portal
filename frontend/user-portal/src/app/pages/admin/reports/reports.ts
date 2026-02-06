import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { DashboardService } from '../../../services/dashboard.service';

@Component({
    selector: 'app-reports',
    standalone: true,
    imports: [CommonModule, HttpClientModule],
    templateUrl: './reports.html',
    styleUrls: ['./reports.css'],
    providers: [DashboardService]
})
export class ReportsComponent implements OnInit {
    occupancyReport: any[] = [];
    paymentReport: any = null;
    revenueReport: any = null;
    loading = false;
    error = '';

    selectedTab = 'occupancy'; // occupancy, payments, revenue

    constructor(private dashboardService: DashboardService) { }

    ngOnInit() {
        this.loadAllReports();
    }

    loadAllReports() {
        this.loadOccupancyReport();
        this.loadPaymentReport();
        this.loadRevenueReport();
    }

    loadOccupancyReport() {
        this.loading = true;
        this.dashboardService.getOccupancyReport().subscribe({
            next: (data) => {
                this.occupancyReport = data;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading occupancy report:', err);
                this.error = 'Failed to load occupancy report';
                this.loading = false;
            }
        });
    }

    loadPaymentReport() {
        this.dashboardService.getPaymentReport().subscribe({
            next: (data) => {
                this.paymentReport = data;
            },
            error: (err) => {
                console.error('Error loading payment report:', err);
            }
        });
    }

    loadRevenueReport() {
        this.dashboardService.getRevenueReport().subscribe({
            next: (data) => {
                this.revenueReport = data;
            },
            error: (err) => {
                console.error('Error loading revenue report:', err);
            }
        });
    }

    selectTab(tab: string) {
        this.selectedTab = tab;
    }
}
